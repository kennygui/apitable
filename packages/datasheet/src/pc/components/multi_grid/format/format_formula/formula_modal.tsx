import { Button, TextButton, useThemeColors } from '@vikadata/components';
import {
  expressionTransform,
  Field,
  FormulaExprLexer,
  FormulaExprParser,
  FormulaFuncType,
  FunctionExample,
  Functions,
  IField,
  IFunction,
  IViewColumn,
  Selectors,
  Strings,
  t,
  Token,
  TokenType,
} from '@vikadata/core';
import classNames from 'classnames';
import Fuse from 'fuse.js';
import { Message } from 'pc/components/common';
import { ComponentDisplay, ScreenSize } from 'pc/components/common/component_display';
import { FieldPermissionLock } from 'pc/components/field_permission';
import { useSelectIndex } from 'pc/hooks';
import { store } from 'pc/store';
import { KeyCode } from 'pc/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { FormulaGuiding } from './formula_guiding';
import styles from './styles.module.less';
import { ExpressionColorant } from './token_colorant';
import { ValueTypeIcon } from './value_type_icon';

const FORMULA_TEXTAREA_ELEMENT = 'FORMULA_TEXTAREA_ELEMENT';
const FORMULA_COLORANT_ELEMENT = 'FORMULA_COLORANT_ELEMENT';

interface IFormulaModal {
  field: IField;
  expression: string;
  onClose?: () => void;
  onSave?: (exp: string) => void;
}

interface ISuggestItem {
  type: 'field' | 'func';
  id: string;
  name: string;
}

interface IFunctionMap {
  [key: string]: IFunctionItem;
}

interface IFunctionItem {
  title: string;
  list: IFunction[];
  prevCount: number;
  sortIdx: number;
}

// TODO：这里先做 ISERROR 的兼容，刷完用户数据后统一删掉
const FunctionsArray = Array.from(Functions)
  .map(item => item[1])
  .filter(item => item.name !== 'ISERROR');
export const FormulaModal: React.FC<IFormulaModal> = props => {
  const colors = useThemeColors();
  const { field, expression: initExpression, onClose, onSave } = props;
  const fieldMap = useSelector(state => Selectors.getFieldMap(state, state.pageParams.datasheetId!))!;
  const fieldPermissionMap = useSelector(Selectors.getFieldPermissionMap);
  const formulaInputEleRef = useRef<HTMLElement>();
  const formulaColorantEleRef = useRef<HTMLElement>();
  const columns = (useSelector(state => Selectors.getCurrentView(state)!.columns)! as IViewColumn[]).filter(column => column.fieldId !== field.id); // 公式字段不允许选择自己。
  const [expError, setExpError] = useState<string>('');
  const [tokens, setTokens] = useState<Token[]>();
  const [activeToken, setActiveToken] = useState<Token>();
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const inputRef = useRef<any>(null);
  const leftPaneRef = useRef<any>(null);

  const parse = (exp: string) => {
    const lexer = new FormulaExprLexer(exp);
    setTokens(lexer.fullMatches);

    try {
      if (lexer.errors.length) {
        throw lexer.errors[0];
      }
      // 这里 FormulaExprParser 是以 fieldName 作为 fieldId 来进行 context 计算的，所以要对 fieldMap 进行一次转换 id => name。
      const convertedFieldMap = {};
      for (const key in fieldMap) {
        convertedFieldMap[fieldMap[key].name] = fieldMap[key];
      }
      lexer.matches.length &&
        new FormulaExprParser(lexer, { field: { ...field, id: field.name }, fieldMap: convertedFieldMap, state: store.getState() }).parse();
      setExpError('');
    } catch (e) {
      setExpError((e as any).message);
    }
  };

  const transformedExp = useMemo(() => {
    const tExp = expressionTransform(initExpression.trim(), { fieldMap, fieldPermissionMap }, 'name');
    parse(tExp);
    return tExp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [expression, setExpression] = useState<string>(transformedExp);
  const [cursorOffset, setCursorOffset] = useState<number>(expression.length);

  useEffect(() => {
    formulaInputEleRef.current = document.getElementById(FORMULA_TEXTAREA_ELEMENT)!;
    formulaColorantEleRef.current = document.getElementById(FORMULA_COLORANT_ELEMENT)!;
    formulaInputEleRef.current.innerText = expression;
    formulaInputEleRef.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const height = formulaInputEleRef.current!.offsetHeight;
    formulaColorantEleRef.current!.style.height = height + 'px';
    formulaColorantEleRef.current!.scrollTop = formulaInputEleRef.current!.scrollTop;
  }, [expression]);

  const onExpressionChange = function(v: string) {
    parse(v);
    setExpression(v);
  };

  const onConfirm = () => {
    if (expError) {
      return;
    }
    let exp = expression.trim();
    try {
      exp = expressionTransform(expression, { fieldMap, fieldPermissionMap }, 'id');
    } catch (e) {
      console.error(e);
      Message.error((e as any).message);
      return;
    }

    onSave && onSave(exp);
  };

  const insertText = (text: string, start: number, length = 0) => {
    let textNode = formulaInputEleRef.current!.childNodes[activeNodeIndex];
    if (!textNode) {
      formulaInputEleRef.current!.innerText = text;
      start = 0;
      length = text.length;
      textNode = formulaInputEleRef.current!.childNodes[activeNodeIndex];
    }

    const Range = document.createRange();
    Range.setStart(textNode, start);
    Range.setEnd(textNode, start + length);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(Range);
    document.execCommand('insertHTML', false, text);

    if (text[text.length - 1] === ')') {
      const len = text.length;
      Range.setStart(textNode, start + len - 1);
      Range.setEnd(textNode, start + len - 1);
      sel.removeAllRanges();
      sel.addRange(Range);
    }
  };

  const onItemClick = (key: string, type: 'field' | 'func') => {
    key = type === 'field' ? key.replace(/(\{|\})/g, '\\$0') : key;
    if (activeToken) {
      const activeTokenLength = activeToken.value.length;
      const start = activeNodeIndex > 0 ? cursorOffset - activeTokenLength : activeToken.index;
      insertText(type === 'field' ? `{${key}}` : `${key}()`, start, activeTokenLength);
    } else {
      insertText(type === 'field' ? `{${key}}` : `${key}()`, cursorOffset);
    }
  };

  const onScroll = () => {
    formulaColorantEleRef.current!.scrollTop = formulaInputEleRef.current!.scrollTop;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, suggestItem: ISuggestItem) => {
    if (!e.shiftKey && e.keyCode === KeyCode.Enter) {
      const { name, type } = suggestItem;
      e.preventDefault();
      name && onItemClick(name, type);
    }
  };

  const findTokenByIndex = (index: number): Token | undefined => {
    if (!tokens) {
      return;
    }
    return tokens.find(token => token.index < index && token.index + token.value.length >= index);
  };

  const onSelectStart = () => {
    const selection = document.getSelection();
    if (!selection) {
      return;
    }

    let { anchorNode, anchorOffset } = selection;
    let finalAnchorOffset = anchorOffset; // 光标所在当前节点的位置偏移量
    let anchorNodeIndex = 0; // 当前节点在所有节点中的索引
    const originAnchorOffset = anchorOffset; // 光标原始位置偏移量

    while (anchorNode?.previousSibling && anchorNode?.previousSibling?.nodeName !== 'H2') {
      anchorNodeIndex++;
      if (anchorNodeIndex === 1) {
        finalAnchorOffset = anchorNode.nodeName === 'BR' ? originAnchorOffset : anchorOffset;
      }
      anchorNode = anchorNode.previousSibling;
      anchorOffset += anchorNode.textContent?.length || 0;
      anchorNode.nodeName === 'BR' && (anchorOffset += 1);
    }

    const token = findTokenByIndex(anchorOffset);

    if (
      token &&
      (token.type === TokenType.Value || token.type === TokenType.PureValue || token.type === TokenType.Call || token.type === TokenType.Number)
    ) {
      setActiveToken(findTokenByIndex(anchorOffset));
    } else {
      setActiveToken(undefined);
    }
    setActiveNodeIndex(anchorNodeIndex);
    setCursorOffset(finalAnchorOffset);
  };

  const filteredFields = useMemo(() => {
    const fieldColumns = columns.map(column => fieldMap[column.fieldId]);
    const fuse = new Fuse(fieldColumns, {
      findAllMatches: true,
      keys: ['name'],
    });
    let searchValue = (activeToken && activeToken.value) || '';
    searchValue = searchValue[0] === '{' ? searchValue.slice(1) : searchValue;
    searchValue = searchValue[searchValue.length - 1] === '}' ? searchValue.slice(0, -1) : searchValue;

    return searchValue ? fuse.search(searchValue) : fieldColumns.map((c, i) => ({ item: c, refIndex: i }));
  }, [columns, fieldMap, activeToken]);

  const filteredFunctions = useMemo(() => {
    const fuse = new Fuse(FunctionsArray, {
      findAllMatches: true,
      keys: ['name'],
    });
    let searchValue = (activeToken && activeToken.value) || '';
    searchValue = searchValue[0] === '{' ? searchValue.slice(1) : searchValue;
    searchValue = searchValue[searchValue.length - 1] === '}' ? searchValue.slice(0, -1) : searchValue;

    const FunctionsMap: IFunctionMap = {
      [FormulaFuncType.Numeric]: { title: t(Strings.numeric_functions), list: [], prevCount: 0, sortIdx: -1 },
      [FormulaFuncType.Text]: { title: t(Strings.text_functions), list: [], prevCount: 0, sortIdx: -1 },
      [FormulaFuncType.Logical]: { title: t(Strings.logical_functions), list: [], prevCount: 0, sortIdx: -1 },
      [FormulaFuncType.DateTime]: { title: t(Strings.date_functions), list: [], prevCount: 0, sortIdx: -1 },
      [FormulaFuncType.Array]: { title: t(Strings.array_functions), list: [], prevCount: 0, sortIdx: -1 },
      [FormulaFuncType.Record]: { title: t(Strings.record_functions), list: [], prevCount: 0, sortIdx: -1 },
    };
    // 经过筛选后的 Function List
    const filteredList = searchValue ? fuse.search(searchValue) : FunctionsArray.map((c, i) => ({ item: c, refIndex: i }));
    // 符合最终顺序的 Function List
    const finalFilteredList: any = [];
    filteredList.forEach((res, index) => {
      const funcType = res.item.func.type;
      FunctionsMap[funcType].list.push(res.item);
      if (FunctionsMap[funcType].sortIdx === -1) {
        FunctionsMap[funcType].sortIdx = index;
      }
    });
    // 经过格式化过后的 Function List (需要按照原本的排序进行格式化)
    let formatList: IFunctionItem[] = Object.values(FunctionsMap)
      .filter(item => item.list.length)
      .sort((prev, next) => prev.sortIdx - next.sortIdx);
    formatList = formatList.map((item, index) => {
      if (index > 0) {
        const prevItem = formatList[index - 1];
        item.prevCount = prevItem.list.length + prevItem.prevCount;
      }
      item.list.forEach(fn => finalFilteredList.push(fn));
      return item;
    });
    return { filteredList: finalFilteredList, formatList };
  }, [activeToken]);

  const totalItemCount = filteredFields.length + filteredFunctions.filteredList.length;

  const getSuggestItem = (index: number): ISuggestItem => {
    if (index < 0 || index > totalItemCount - 1) {
      return { type: 'func', id: '', name: '' };
    }
    if (index > filteredFields.length - 1) {
      const realIndex = index - filteredFields.length;
      const name = filteredFunctions.filteredList[realIndex]?.name;
      return {
        type: 'func',
        id: name,
        name,
      };
    }
    // FIXME:TYPE
    return {
      type: 'field',
      id: (filteredFields[index] as any)?.item.id,
      name: (filteredFields[index] as any)?.item.name,
    };
  };

  const { index: currentIndex, setIndex: setCurrentIndex } = useSelectIndex({
    inputRef,
    listContainerRef: leftPaneRef,
    listLength: totalItemCount,
    activeItemClass: '.active',
  });

  const onInputChange = () => {
    onExpressionChange(formulaInputEleRef.current!.innerText);
  };

  useEffect(() => {
    if (activeToken) {
      setCurrentIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeToken]);

  const { type: suggestType, id: suggestId, name: suggestName } = getSuggestItem(currentIndex);

  return (
    <div className={styles.formulaModal}>
      <ComponentDisplay minWidthCompatible={ScreenSize.md}>
        <h2 className={styles.title}>{t(Strings.input_formula)}</h2>
      </ComponentDisplay>
      <div
        id={FORMULA_TEXTAREA_ELEMENT}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className={'code ' + styles.formulaInput}
        placeholder={t(Strings.input_formula)}
        contentEditable
        onKeyDown={e => onKeyDown(e, { type: suggestType, id: suggestId, name: suggestName })}
        onInput={onInputChange}
        onScroll={onScroll}
        onSelect={onSelectStart}
        ref={inputRef}
      />
      <div id={FORMULA_COLORANT_ELEMENT} className={'code ' + styles.formulaColorant}>
        <ExpressionColorant expression={expression} />
      </div>
      <p className={styles.error}>{expError}</p>
      <h2 className={styles.title}>{t(Strings.pick_field_or_function)}</h2>
      <div className={styles.pickerContainer}>
        <div className={styles.leftPane} ref={leftPaneRef}>
          {!filteredFields.length && !filteredFunctions.filteredList.length && (
            <div className={styles.listGroup}>
              <h3>{t(Strings.no_search_result)}</h3>
            </div>
          )}
          {filteredFields.length > 0 && (
            <div className={styles.listGroup}>
              <h3>{t(Strings.field)}</h3>
              {(filteredFields as any).map((result, index) => {
                const fld = result.item;
                const active = suggestId === fld.id && suggestType === 'field';
                return (
                  <div
                    key={fld.id}
                    onMouseEnter={() => setCurrentIndex(index)}
                    onClick={() => onItemClick(fld.name, 'field')}
                    className={classNames(styles.listItem, active && styles.active, active && 'active')}
                  >
                    {<ValueTypeIcon valueType={Field.bindModel(fld).basicValueType} />}
                    <span className={styles.fieldName}>{fld.name}</span>
                    {<FieldPermissionLock fieldId={fld.id} />}
                  </div>
                );
              })}
            </div>
          )}
          {filteredFunctions.filteredList.length > 0 && (
            <div className={styles.listGroup}>
              {filteredFunctions.formatList.map(result => {
                return (
                  <div key={result.title}>
                    <h3>{result.title}</h3>
                    {result.list.map((fn, index) => {
                      const name = fn.name;
                      const active = suggestId === name && suggestType === 'func';
                      return (
                        <div
                          key={name}
                          // 设置 currentIndex 值为从 维格列名 开始到当前 Function 的索引值
                          onMouseEnter={() => setCurrentIndex(filteredFields.length + result.prevCount + index)}
                          onClick={() => onItemClick(name, 'func')}
                          className={classNames(styles.listItem, active && styles.active, active && 'active')}
                        >
                          {<ValueTypeIcon valueType={fn.func.getReturnType()} />}
                          <span className={styles.fieldName}>{name}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={styles.rightPane}>
          {suggestType === 'func' ? (
            <FormulaGuiding type={'func'} item={(Functions.get(suggestId) || FunctionExample) as IFunction} />
          ) : (
            <FormulaGuiding type={'field'} item={fieldMap[suggestId]} />
          )}
        </div>
      </div>
      <div className={styles.btnGroup}>
        <div className={styles.tips}>
          <a href={t(Strings.formula_learn_more_url)} target="_blank" rel="noreferrer">
            {t(Strings.formula_learn_more)}
          </a>
        </div>
        <TextButton style={{ color: colors.thirdLevelText }} onClick={onClose} size="small">
          {t(Strings.cancel)}
        </TextButton>
        <Button onClick={onConfirm} size="small" disabled={Boolean(expError)} color="primary">
          {t(Strings.confirm)}
        </Button>
      </div>
    </div>
  );
};
