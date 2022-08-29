import { useCallback, useMemo, useState, FC, useEffect, useRef } from 'react';
import * as React from 'react';
import { Editable, withReact, Slate, ReactEditor } from 'slate-react';
import { createEditor, Editor, Transforms, Text, Node } from 'slate';
import { withHistory, HistoryEditor } from 'slate-history';
import isEqual from 'lodash/isEqual';
import clx from 'classnames';
import { isMac, isWxWork } from 'pc/utils/os';
import { IS_QQBROWSER } from 'pc/utils/env';

import { useDebounceFn } from 'ahooks';

import { EditorContext } from './context';

import { LeafRender, ElementRender, GENERATOR } from './elements';
import { Toolbar } from './components/toolbar';
import { HoveringToolbar } from './components/hovering_toolbar';
import { InsertPanel } from './components/insert_panel';
import { MentionPanel } from './components/mention_panel';
import { hotkeyHandle } from './hotkeys';
import { getValidSelection } from './helpers/utils';
import { IS_FIREFOX } from './helpers/browser';
import * as API from './api';

import { ISlateEditorProps, EditorValue, IEditorData } from './interface/editor';
import { withVika } from './plugins/withVika';
import { withEventBus, BUILT_IN_EVENTS } from './plugins/withEventBus';
import { withMeta } from './plugins/withMeta';
// 暂时隐藏代码高亮功能
// import { getDecorate } from './plugins/codeBlock';
import i18nText from './strings';
import { normalize } from './normalize';

import styles from './styles/editor.module.less';

export const fixImeInputBug = (e: React.CompositionEvent, editor: ReactEditor): boolean => {
  const text = e.data;
  if (!text) {
    return false;
  }
  if (isMac() && isWxWork()) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  // 火狐、QQ 浏览器手动加文本加入到 editor 数据结构中
  if (IS_QQBROWSER || IS_FIREFOX) {
    Editor.insertText(editor, text);
    return false;
  }
  return false;
};

const defaultValue = [
  GENERATOR.paragraph({}),
] as unknown as EditorValue;

const SlateEditorBase: FC<ISlateEditorProps> = ((props) => {

  const {
    onChange: propsOnChange,
    height: propsEditorHeight,
    headerToolbarEnabled,
    hoveringToolbarEnabled = true,
    mode = 'full',
    operationAble = false,
    value: propsValue,
    placeholder = '',
    imageUploadApi,
    useMention = true,
    sectionSpacing = 'large',
    autoFocus,
    className,
    readOnly,
    ...otherProps
  } = props;

  const editor = useMemo(() => withVika(withMeta(withEventBus(withHistory(withReact(createEditor() as ReactEditor))))), []);
  editor.mode = mode;
  const [value, setValue] = useState(defaultValue);
  const imeInputText = useRef('');

  // 同步更新编辑器用到的api
  API.setApi(editor, API.ApiKeys.ImageUpload, imageUploadApi);

  const editorStyle = useMemo(() => {
    const style = {} as React.CSSProperties;
    if (propsEditorHeight) {
      style.height = propsEditorHeight;
      style.overflow = 'auto';
    }
    return style;
  }, [propsEditorHeight]);

  const fixFirefoxImeInputRepeatWordBug = () => {
    if (imeInputText.current && IS_FIREFOX) {
      const imeText = imeInputText.current;
      imeInputText.current = '';
      const [match] = Editor.nodes(editor, { match: (n) => Text.isText(n) });
      if (match) {
        const [node, path] = match;
        const lastLevel = path.pop();
        const nodeText = Node.string(node);
        if (!lastLevel) {
          // 修复firefox在一行开头混合输入文字重复
          const firstPath = [...path, 0];
          if (nodeText === imeText) {
            Transforms.removeNodes(editor, { at: firstPath });
            requestAnimationFrame(() => {
              Transforms.select(editor, firstPath);
              Transforms.collapse(editor, { edge: 'end' });
              Transforms.insertNodes(editor, { text: nodeText }, { at: firstPath });
              Transforms.delete(editor, { unit: 'character', distance: nodeText.length, reverse: true });
            });
          }
        }
      }
    }
  };

  const handleChange = (nextState) => {
    if (readOnly) return;
    setValue(nextState);
    propsOnChange?.({ document: nextState, meta: editor.meta });
    fixFirefoxImeInputRepeatWordBug();
  };

  const handleWrapClick = useCallback(() => {
    const selection = getValidSelection(editor);
    ReactEditor.focus(editor);
    Transforms.select(editor, selection);
  }, [editor]);

  const handleEditorMouseMove = useCallback((e: React.MouseEvent) => {
    editor.dispatch(BUILT_IN_EVENTS.EDITOR_MOUSE_MOVE, { x: e.pageX, y: e.pageY });
  }, [editor]);

  const handleEditorMouseLeave = useCallback((e: React.MouseEvent) => {
    editor.dispatch(BUILT_IN_EVENTS.EDITOR_MOUSE_LEAVE, { x: e.pageX, y: e.pageY });
  }, [editor]);

  const handleEditorMouseUp = useCallback((e: React.MouseEvent) => {
    editor.dispatch(BUILT_IN_EVENTS.EDITOR_MOUSE_UP, { x: e.pageX, y: e.pageY });
  }, [editor]);

  const handleScroll = useCallback(() => {
    editor.dispatch(BUILT_IN_EVENTS.EDITOR_SCROLL);
  }, [editor]);

  const clearEditorHistory = useCallback(() => {
    (editor as unknown as HistoryEditor).history.redos.length = 0;
    (editor as unknown as HistoryEditor).history.undos.length = 0;
  }, [editor]);

  const { run: forcedNormalizeNode, cancel: cancelForcedNormalizeNode } = useDebounceFn(() => {
    Editor.normalize(editor, { force: true });
  }, { wait: 300 });

  useEffect(() => {

    if (!propsValue) {
      if (value !== defaultValue) {
        setValue(defaultValue);
      }
      editor.resetMeta();
      clearEditorHistory();
      return;
    }

    const propsMeta = (propsValue as IEditorData).meta;
    let nextValue = propsMeta ? (propsValue as IEditorData).document : propsValue;
    if (!Array.isArray(nextValue)) {
      nextValue = defaultValue;
    }
    if (isEqual(propsMeta, editor.meta) && nextValue === value) {
      return;
    }
    clearEditorHistory();
    setValue(normalize(nextValue));
    if (propsMeta) {
      editor.setMeta(propsMeta);
    } else {
      editor.resetMeta();
    }
    cancelForcedNormalizeNode();
    forcedNormalizeNode();
    // 确定只需要外部传入的value改变才触发此effect
    // eslint-disable-next-line
  }, [propsValue]);

  useEffect(() => {
    if (autoFocus && !readOnly) {
      // 用slate自带的autoFocus参数，可能不能自动获得焦点
      const selection = getValidSelection(editor);
      ReactEditor.focus(editor);
      Transforms.select(editor, selection);
    }
    // eslint-disable-next-line
  }, [autoFocus]);

  return <EditorContext.Provider value={{ i18nText, operationAble, placeholder, mode }}>
    <div className={styles.editorWrap} data-section-spacing={sectionSpacing} onClick={handleWrapClick}>
      <Slate editor={editor} value={value} onChange={handleChange}>
        {
          headerToolbarEnabled && <div className={styles.header}> <Toolbar /> </div>
        }
        {
          hoveringToolbarEnabled && <HoveringToolbar />
        }
        {
          useMention && <MentionPanel />
        }
        <InsertPanel />
        <Editable
          {...otherProps}
          readOnly={readOnly}
          // decorate={getDecorate(editor)}
          data-has-operation={operationAble}
          className={clx(styles.editor, className)}
          style={editorStyle}
          onMouseMove={handleEditorMouseMove}
          onMouseLeave={handleEditorMouseLeave}
          onMouseUp={handleEditorMouseUp}
          onScroll={handleScroll}
          renderElement={useCallback((props) => <ElementRender {...props} />, [])}
          renderLeaf={useCallback((props) => <LeafRender {...props} />, [])}
          onKeyDown={useCallback((e) => { hotkeyHandle(e, editor); }, [editor])}
          onCompositionStart={useCallback(() => {
            editor.dispatch(BUILT_IN_EVENTS.IME_INPUT_START);
          }, [editor])}
          onCompositionUpdate={useCallback(() => {
            editor.isComposing = true;
          }, [editor])}
          onCompositionEnd={useCallback((e: React.CompositionEvent) => {
            const text = e.data;
            imeInputText.current = text;
            editor.isComposing = false;
            editor.dispatch(BUILT_IN_EVENTS.IME_INPUT_END, text);
            return fixImeInputBug(e, editor);
          }, [editor])}
        />
      </Slate>
    </div>
  </EditorContext.Provider>;
});

export const SlateEditor = React.memo(SlateEditorBase);