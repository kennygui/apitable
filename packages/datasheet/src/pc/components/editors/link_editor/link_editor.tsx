import { ConfigConstant, ILinkField, ILinkIds, Selectors, Strings, t } from '@vikadata/core';
import classNames from 'classnames';
import { JumpIconMode, LinkJump } from 'pc/components/common';
import { ScreenSize } from 'pc/components/common/component_display/component_display';
import { Popup } from 'pc/components/common/mobile/popup';
import { useResponsive } from 'pc/hooks';
import { useThemeColors, Skeleton } from '@vikadata/components';
import { stopPropagation, KeyCode } from 'pc/utils';

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import * as React from 'react';
import ReactDOM from 'react-dom';
import { shallowEqual, useSelector } from 'react-redux';
import IconNarrow from 'static/icon/datasheet/datasheet_icon_narrow_record.svg';
import CloseIcon from 'static/icon/datasheet/datasheet_icon_tagdelete.svg';
import { SearchControl } from '../../common/search_control/search_control';
import { TComponent } from '../../common/t_component/t_component';
import { FocusHolder } from '../focus_holder';
import { useCellEditorVisibleStyle } from '../hooks';
import { IBaseEditorProps, IEditor } from '../interface';
import { SearchContent } from './search_content';
import style from './style.module.less';
import { Align } from '@vikadata/react-window';
import { Divider } from 'antd';

export enum LinkEditorModalLayout {
  Center = 'Center', // 居中
  CenterRight = 'CenterRight' // 中间靠右
}

export interface ILinkEditorProps extends IBaseEditorProps {
  field: ILinkField;
  recordId: string;
  style: React.CSSProperties;
  editable: boolean;
  editing: boolean;
  cellValue: ILinkIds;
  gridCellEditor?: boolean;
  loading?: boolean;
  toggleEditing?: (next?: boolean) => void;
  layout?: LinkEditorModalLayout
}

interface ISearchContentRefProps {
  getFilteredRows(): { recordId: string }[];
  scrollToItem(index: number, align?: Align): void;
  saveValue(recordId: string): void;
}

const LinkEditorBase: React.ForwardRefRenderFunction<IEditor, ILinkEditorProps> = (props, ref) => {
  const {
    editing, datasheetId, recordId, field, cellValue, toggleEditing: _toggleEditing, onSave, loading, layout = LinkEditorModalLayout.Center
  } = props;
  const colors = useThemeColors();
  useImperativeHandle(ref, (): IEditor => ({
    focus: () => { focus(); },
    onEndEdit: () => { onEndEdit(); },
    onStartEdit: () => { return; },
    setValue: () => { return; },
    saveValue: () => { return; },
  }));

  const editorRef = useRef<{ focus() }>(null);
  const searchContentRef = useRef<ISearchContentRefProps>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [onlyShowSelected, setOnlyShowSelected] = useState<boolean>(false);
  const offsetStyle = useCellEditorVisibleStyle({ editing });
  const { screenIsAtMost } = useResponsive();
  const isMobile = screenIsAtMost(ScreenSize.md);
  const [focusIndex, setFocusIndex] = useState(-1);

  const { foreignDatasheetId, foreignDatasheetName } = useSelector(state => {
    const foreignDatasheet = Selectors.getDatasheet(state, field.property.foreignDatasheetId);
    return { foreignDatasheetId: foreignDatasheet?.id, foreignDatasheetName: foreignDatasheet?.name };
  }, shallowEqual);

  const focus = () => {
    editorRef.current && editorRef.current.focus();
  };

  const toggleEditing = () => {
    // 出错的情况下，禁止编辑
    if (!foreignDatasheetId && !loading) {
      return;
    }
    _toggleEditing && _toggleEditing();
    if (isMobile) {
      return;
    }
    focus();
  };

  const onClickPortalContainer = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    stopPropagation(e);
    if (e.target === e.currentTarget) {
      toggleEditing();
    }
  };

  const onValueChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const onSwitcherChange = useCallback((checked: boolean) => {
    setOnlyShowSelected(checked);
  }, []);

  const onCancelClick = useCallback(() => {
    setSearchValue('');
  }, []);

  const saveValue = useCallback((value: string[] | null) => {
    onSave && onSave(value);
    if ((field as ILinkField).property.limitSingleRecord) {
      _toggleEditing && _toggleEditing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, datasheetId, recordId, editing]);

  // TODO: 结束编辑的时候，如果不是 cancel 的状态下。并且 rows 里面只有一个元素，需要进行选中操作
  // 目前因为编辑器的调用逻辑问题，暂未实现，重构后再搞
  const onEndEdit = () => {
    // const rows = searchContentRef.current && searchContentRef.current.getFilteredRows();
    // console.log('onSearchSubmit', rows);
  };

  useEffect(() => {
    if (!editing) {
      return setSearchValue('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, datasheetId]);

  useEffect(() => {
    // 重置 focusIndex
    if (!searchValue) {
      setFocusIndex(-1);
    }
  }, [datasheetId, recordId, editing, searchValue]);

  if (!foreignDatasheetId && !loading) {
    return <FocusHolder ref={editorRef} />;
  }

  const onKeydown = (e: React.KeyboardEvent) => {
    if (!editing) {
      return;
    }
    if (e.keyCode === KeyCode.Esc) {
      return;
    }
    stopPropagation(e);

    // 搜索状态下，支持键盘操作
    const rows = searchContentRef.current && searchContentRef.current.getFilteredRows();
    if (searchValue && rows) {
      const maxLength = rows.length;
      switch (e.keyCode) {
        case KeyCode.Up:
          const prevIndex = focusIndex <= 0 ? maxLength - 1 : focusIndex - 1;
          setFocusIndex(prevIndex);
          searchContentRef.current && searchContentRef.current.scrollToItem(prevIndex, 'smart');
          return;
        case KeyCode.Down:
          const nextIndex = focusIndex >= maxLength - 1 ? 0 : focusIndex + 1;
          setFocusIndex(nextIndex);
          searchContentRef.current && searchContentRef.current.scrollToItem(nextIndex, 'smart');
          return;
        case KeyCode.Enter:
          const realFocusIndex = focusIndex === -1 ? 0 : focusIndex;
          const recordId = rows[realFocusIndex]?.recordId;
          searchContentRef.current && recordId && searchContentRef.current.saveValue(recordId);
          return;
      }
    }
  };

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    // 防止利用键盘上下移动选项时，出现光标同时移动的情况
    if ([KeyCode.Up, KeyCode.Down].includes(e.keyCode)) {
      e.preventDefault();
    }
  };

  const IconClose = isMobile ? CloseIcon : IconNarrow;
  const PortalChild = (
    <div
      className={classNames(style.linkCard, { [style.rightLayout]: layout === LinkEditorModalLayout.CenterRight })}
      onKeyDown={onKeydown}
    >
      <IconClose
        className={style.iconClose}
        width={24}
        height={24}
        fill={colors.thirdLevelText}
        onClick={toggleEditing}
      />
      {
        loading
          ? <div className={style.loadingWrap}>
            <Skeleton />
            <Divider />
            <Skeleton count={2} />
            <Skeleton count={1} width="61%"/>
            <Divider />
            <Skeleton count={2} />
            <Skeleton count={1} width="61%"/>
          </div>
          : <>
            <h2
              className={style.linkCardTitle}
            >
              {
                foreignDatasheetId &&
              <TComponent
                tkey={t(Strings.function_associate_sheet)}
                params={{
                  datasheetname: <>
                      「{<span className={style.linkTitle}>{foreignDatasheetName}</span>}」
                    <LinkJump mode={JumpIconMode.Badge} foreignDatasheetId={foreignDatasheetId} />
                  </>,
                }}
              />
              }
            </h2>
            <SearchControl
              ref={editorRef}
              onValueChange={onValueChange}
              onSwitcherChange={onSwitcherChange}
              onCancelClick={onCancelClick}
              onkeyDown={onSearchKeyDown}
              placeholder={t(Strings.search_associate_record)}
              checkboxText={t(Strings.check_selected_record)}
              checked={onlyShowSelected}
              value={searchValue}
            />
            {editing && <SearchContent
              ref={searchContentRef}
              field={field}
              cellValue={cellValue}
              searchValue={searchValue}
              onlyShowSelected={onlyShowSelected}
              focusIndex={focusIndex}
              onChange={saveValue}
              datasheetId={datasheetId}
            />}
          </>
      }
    </div>
  );

  if (isMobile) {
    return (
      <>
        {editing &&
          <Popup
            width='100%'
            height='90%'
            visible={editing}
            onClose={toggleEditing}
            closable={false}
            className={style.drawerPopup}
          >
            {PortalChild}
          </Popup>}
      </>
    );
  }

  return ReactDOM.createPortal((
    <div
      style={{
        ...offsetStyle,
        zIndex: document.querySelector('.centerExpandRecord') ? undefined : 1001, // 设置比预览附件弹窗的 z-index 大一点的值
      }}
      onMouseDown={e => e.nativeEvent.stopImmediatePropagation()}
      onWheel={stopPropagation}
      onClick={onClickPortalContainer}
      onMouseMove={stopPropagation}
      className={classNames(
        style.linkEditorPortalContainer,
        /**
           * 由于 link editor 是渲染在dom 根节点的，所以需要增加一个 gridCellEditor 标致位。
           * 是用来给快捷键模块判断是否应该响应快捷键操作，只有在组件作为gridView单元格编辑组件使用的时候，才会生效。
           */
        { [ConfigConstant.GIRD_CELL_EDITOR]: props.gridCellEditor },
      )}
      tabIndex={-1}
    >
      {PortalChild}
    </div>
  ),
  document.body);
};

export const LinkEditor = memo(forwardRef(LinkEditorBase));
