import { useImperativeHandle, useRef, useState, useMemo, useLayoutEffect, useEffect } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { ICellValue, Selectors } from '@vikadata/core';
import classNames from 'classnames';
import styles from './style.module.less';
import { useClickAway } from 'ahooks';
import { useResponsive } from 'pc/hooks';
import { printableKey, KeyCode } from 'pc/utils';
import { CellMember } from './cell_member';
import { IBaseEditorProps, IEditor } from 'pc/components/editors/interface';
import { IExpandFieldEditRef } from 'pc/components/expand_record/field_editor';
import { MemberEditor } from 'pc/components/editors/member_editor/member_editor';
import { ComponentDisplay, ScreenSize } from 'pc/components/common/component_display/component_display';

export interface IMemberFieldEditorProps extends IBaseEditorProps {
  style: React.CSSProperties;
  editable: boolean;
  editing: boolean;
  isFocus: boolean;
  cellValue: ICellValue;
  onClose?: (...args: any) => void;
}

export const MemberFieldEditor: React.FC<IMemberFieldEditorProps> = React.forwardRef((props, ref) => {
  const { field, cellValue, editable, isFocus, onSave, onClose } = props;
  const editorRef = useRef<IEditor>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editing, _setEditing] = useState(false);
  const [height, setHeight] = useState(0);
  const { screenIsAtMost } = useResponsive();
  const isMobile = screenIsAtMost(ScreenSize.md);
  const unitMap = useSelector(state => Selectors.getUnitMap(state));
  const { shareId } = useSelector(state => state.pageParams);

  const setEditing = (status: boolean) => {
    if (!editable) {
      return;
    }
    _setEditing(status);
    if (isMobile) {
      return;
    }
    editorRef.current?.focus();
  };

  useEffect(() => {
    if (!editing && onClose){
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setHeight(containerRef.current.clientHeight);
    }
  }, [editing, cellValue]);

  useClickAway(() => {
    if (isMobile) {
      return;
    }
    editing && isFocus && setEditing(false);
  }, containerRef, 'mousedown');

  useMemo(() => {
    if (!isFocus) {
      setEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocus]);

  useImperativeHandle(ref, (): IExpandFieldEditRef => {
    const editor = editorRef.current;
    if (!editor) {
      return {
        focus: () => { return; },
        setValue: () => { return; },
        saveValue: () => { return; },
      };
    }

    return {
      focus: editor.focus,
      setValue: editor.setValue,
      saveValue: () => { return; },
    };
  });

  const setEditingByKeyDown = (event: React.KeyboardEvent) => {
    if (editing) {
      return;
    }
    const { metaKey, ctrlKey } = event;
    if (metaKey || ctrlKey) {
      return;
    }
    if (printableKey(event.nativeEvent)) {
      setEditing(true);
    }
    if (event.keyCode === KeyCode.Esc) {
      setEditing(false);
    }
  };

  const onChange = (cellValue) => {
    onSave && onSave(cellValue);
  };

  const commonCellStyle = { height: 40, alignItems: 'center', alignContent: 'center', cursor: 'pointer' };

  return (
    <>
      <ComponentDisplay minWidthCompatible={ScreenSize.md}>
        <div onKeyDown={setEditingByKeyDown} ref={containerRef}>
          <div onClick={() => setEditing(!editing)}>
            <CellMember
              field={field}
              cellValue={cellValue}
              unitMap={unitMap}
              isActive
              onChange={onChange}
              readonly={!editable}
              style={commonCellStyle}
            />
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0 }}>
            {
              editing && <MemberEditor
                ref={editorRef}
                {...props}
                unitMap={unitMap}
                height={height || 0}
                editing={editing}
                linkId={shareId}
                toggleEditing={() => setEditing(!editing)}
                style={{
                  width: editing && editable ? 160 : 0,
                  overflow: editing && editable ? '' : 'hidden',
                  zIndex: 1000,
                }}
              />
            }
          </div>
        </div>
      </ComponentDisplay>

      <ComponentDisplay maxWidthCompatible={ScreenSize.md}>
        <div
          className={classNames(styles.displayBox, styles.option)}
          onClick={() => editable && setEditing(!editing)}
          ref={containerRef}
        >
          <CellMember
            field={field}
            cellValue={cellValue}
            unitMap={unitMap}
            readonly={!editable}
            isActive
            deletable={false}
            style={commonCellStyle}
            onChange={onChange}
          />
        </div>
        {editing &&
        <MemberEditor
          ref={editorRef}
          {...props}
          unitMap={unitMap}
          editing={editing}
          linkId={shareId}
          toggleEditing={() => setEditing(false)}
        />
        }
      </ComponentDisplay>
    </>
  );
});
