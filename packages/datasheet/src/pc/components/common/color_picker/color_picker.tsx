import { ISelectFieldOption, Selectors } from '@vikadata/core';
import classNames from 'classnames';
import { setColor } from 'pc/components/multi_grid/format';
import RcTrigger from 'rc-trigger';
import { forwardRef, useImperativeHandle, useState } from 'react';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { stopPropagation } from '../../../utils/dom';
import { ComponentDisplay, ScreenSize } from '../component_display/component_display';
import { ColorPickerMobile } from './color_picker_mobile';
import { ColorPickerPane } from './color_picker_pane';
import styles from './style.module.less';

export enum OptionSetting {
  DELETE,
  RENAME,
  SETCOLOR,
}

export interface IColorPicker {
  showRenameInput?: boolean;
  onChange?: (type: OptionSetting, id: string, value: string | number) => void;
  option: ISelectFieldOption;
  mask?: boolean;
  triggerComponent?: React.ReactElement;
}

export interface IColorPickerRef {
  open(): void;
  close(): void;
}

const ColorPickerBase: React.ForwardRefRenderFunction<IColorPickerRef, IColorPicker> = (props, ref) => {
  const {
    showRenameInput,
    onChange,
    option,
    mask,
    triggerComponent,
  } = props;

  const cacheTheme = useSelector(Selectors.getTheme);

  useImperativeHandle(ref, (): IColorPickerRef => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));

  const PICKER_PANE_WIDTH = 292;
  const PICKER_PANE_HEIGHT = showRenameInput ? 357 : 292;
  const MARGIN_BOTTOM = 40;
  const MARGIN_TOP = 8;

  // 判断当前是否将要在 X 轴方向溢出，以此控制选色板 小箭头/三角 展示在左边还是右边
  const [adjustX, setAdjustX] = useState(false);

  // 小箭头 Y 轴方向上的大致偏移量
  const [arrowOffsetY, setArrowOffsetY] = useState(0);

  const manageable = useSelector(state => Selectors.getPermissions(state).manageable);
  const fieldEditable = manageable;

  const onClick = (e: React.MouseEvent) => {
    stopPropagation(e);
    if (!fieldEditable) {
      return;
    }

    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    if (rect.left - 10 <= PICKER_PANE_WIDTH) {
      setAdjustX(true);
    }
    const overflowBottom = rect.top + (PICKER_PANE_HEIGHT + MARGIN_BOTTOM) / 2 - window.innerHeight;
    if (overflowBottom >= 0) {
      setArrowOffsetY(overflowBottom);
    }

    const overflowTop = rect.top - PICKER_PANE_HEIGHT / 2;
    if (overflowTop < 0) {
      setArrowOffsetY(overflowTop);
    }
    setVisible(!visible);
  };

  const computedPaneHeight = PICKER_PANE_HEIGHT + (arrowOffsetY > 0 ? MARGIN_BOTTOM : 0);

  const optionColor = setColor(option.color, cacheTheme);

  const [visible, setVisible] = useState(false);

  const onClose = () => {
    setVisible(false);
  };

  const TriggerComponent = triggerComponent || (
    <div
      className={styles.trigger}
      style={{ background: optionColor }}
      onClick={onClick}
    />
  );

  const offsetY = arrowOffsetY && (arrowOffsetY > 0 ? arrowOffsetY + 25 : arrowOffsetY + 5 - MARGIN_TOP);

  const PopupComponent = (
    <div
      className={styles.wrapper}
      style={{
        marginTop: arrowOffsetY < 0 ? MARGIN_TOP : 0,
      }}
      // 兼容性处理，防止看板视图下在不正确的时机关闭
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
    >
      <div
        className={classNames({
          [styles.arrowDisplayLeft]: adjustX,
          [styles.arrowDisplayRight]: !adjustX,
        })}
        style={{ top: PICKER_PANE_HEIGHT / 2 + offsetY }}
      />

      <ColorPickerPane
        showRenameInput={showRenameInput}
        onChange={onChange}
        option={option}
        onClose={onClose}
      />
    </div>
  );

  return (
    <>
      <ComponentDisplay minWidthCompatible={ScreenSize.md}>
        {visible && mask &&
          ReactDOM.createPortal(
            <div
              className={styles.mask}
              onMouseDown={stopPropagation}
              onClick={(e) => {
                stopPropagation(e);
                onClose();
              }}
            />,
            document.body,
          )
        }
        <RcTrigger
          popup={PopupComponent}
          destroyPopupOnHide
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: [-PICKER_PANE_WIDTH - 10, -computedPaneHeight / 2 - 10],
            overflow: { adjustX: true, adjustY: true },
          }}
          popupStyle={{
            width: PICKER_PANE_WIDTH,
            height: computedPaneHeight,
            pointerEvents: 'none',
            position: 'absolute',
          }}
          popupVisible={visible}
          onPopupVisibleChange={visible => setVisible(visible)}
          zIndex={1000}
        >
          {TriggerComponent}
        </RcTrigger>
      </ComponentDisplay>

      <ComponentDisplay maxWidthCompatible={ScreenSize.md}>
        <div onClick={stopPropagation}>
          {TriggerComponent}
          <ColorPickerMobile
            showRenameInput={showRenameInput}
            onChange={onChange}
            option={option}
            onClose={onClose}
            visible={visible}
          />
        </div>
      </ComponentDisplay>
    </>
  );
};

export const ColorPicker = React.memo(forwardRef(ColorPickerBase));
