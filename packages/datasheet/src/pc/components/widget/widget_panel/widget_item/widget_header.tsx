import { IconButton, useContextMenu, useThemeColors } from '@vikadata/components';
import { CollaCommandName, ResourceType, Selectors, Strings, t, WidgetReleaseType } from '@vikadata/core';
import { DragOutlined, MoreOutlined, NarrowRecordOutlined } from '@vikadata/icons';
import { Input } from 'antd';
import classNames from 'classnames';
import { Tooltip } from 'pc/components/common';
import { resourceService } from 'pc/resource_service';
import { useSelector } from 'react-redux';
import { closeWidgetRoute, expandWidgetRoute } from '../../expand_widget';
import { IWidgetPropsBase } from './widget_item';
import styles from './style.module.less';
import { useCheckInput } from 'pc/hooks';

import IconExpand from 'static/icon/datasheet/datasheet_icon_expand_record.svg';
import { useRef, useState } from 'react';
import { WIDGET_MENU } from '../widget_list';

interface IWidgetHeaderProps extends IWidgetPropsBase {
  widgetId: string;
  className?: string;
  widgetPanelId?: string;
  displayMode?: 'hover' | 'always';
  dragging: boolean;
}

export const WidgetHeaderMobile: React.FC<IWidgetHeaderProps> = (props) => {
  const {
    className, widgetId, widgetPanelId, displayMode = 'always', dragging,
    config = {}
  } = props;
  const colors = useThemeColors();
  const inputRef = useRef<Input>(null);
  const [rename, setRename] = useState(false);
  const { errTip, setErrTip, onCheck } = useCheckInput({
    checkLength: { max: 30, min: 0, tip: t(Strings.widget_name_length_error), trim: true },
  });

  const { show, hideAll } = useContextMenu({ id: WIDGET_MENU });
  const widget = useSelector(state => {
    return Selectors.getWidget(state, widgetId);
  });
  const isExpandWidget = useSelector(state => state.pageParams.widgetId === widgetId);

  const triggerMenu = (e: React.MouseEvent<HTMLElement>) => {
    show(e, {
      props: {
        widgetId,
        widgetPanelId,
        widget
      },
    });
  };

  const saveWidgetName = (e) => {
    const value = e.target.value;
    setRename(false);
    setErrTip('');
    if (errTip || value === widget?.snapshot.widgetName) {
      return;
    }
    resourceService.instance!.commandManager.execute({
      cmd: CollaCommandName.SetWidgetName,
      resourceId: widgetId,
      resourceType: ResourceType.Widget,
      newWidgetName: e.target.value,
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onCheck(value);
  };

  const expand = () => {
    if (config.hideExpand) {
      return;
    }
    expandWidgetRoute(widgetId);
  };
  const ReactIconExpand = () => <IconExpand width={16} height={16} fill={colors.thirdLevelText} />;
  const ReactMoreOutlined = () => <MoreOutlined size={16} color={colors.thirdLevelText} className={styles.rotateIcon} />;

  const nameMouseUp = e => {
    if (!dragging && !config.hideEditName) {
      setRename(true);
    } else {
      e.stopPropagation();
    }
  };

  if (isExpandWidget) {
    return (
      <div className={classNames(
        styles.widgetExpandHeaderMobile
      )}>
        <NarrowRecordOutlined className={styles.closeIcon} color={colors.firstLevelText} onClick={() => closeWidgetRoute(widgetId)}/>
        <h2>{widget?.snapshot.widgetName}</h2>
      </div>
    );
  }

  return <div className={classNames(
    styles.widgetHeader,
    isExpandWidget && styles.widgetIsExpandHeader,
    className,
    !config.hideDrag && 'dragHandle',
    dragging && styles.dragging,
  )}>
    {
      !config.hideDrag && <span className={classNames(styles.dragHandle, styles.operateButton)}>
        <DragOutlined size={10} color={colors.thirdLevelText} />
      </span>
    }
    <span className={styles.widgetName}>
      {
        rename && !config.hideEditName ?
          <Tooltip title={errTip} visible={Boolean(errTip)}>
            <Input
              defaultValue={widget?.snapshot.widgetName}
              ref={inputRef}
              onPressEnter={saveWidgetName}
              size="small"
              style={{ height: 24, fontSize: '12px' }}
              onBlur={saveWidgetName}
              autoFocus
              onChange={onChange}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              className={classNames({
                [styles.error]: Boolean(errTip),
              })}
            />
          </Tooltip> :
          <>
            <span
              onMouseUp={nameMouseUp}
              onTouchEnd={nameMouseUp}
              className={styles.name}
            >
              {widget?.snapshot.widgetName}
            </span>
            {
              widget?.releaseType === WidgetReleaseType.Space &&
                  <span className={classNames(styles.tag, styles.tagPrimary)}>{t(Strings.widget_item_build)}</span>
            }
          </>
      }

    </span>

    {
      !config.hideExpand &&
      <span className={classNames({
        [styles.npOpacity]: displayMode === 'always' || config.isDevMode,
      }, styles.operateButton, 'dragHandleDisabled')} onClick={expand} onMouseDown={e => {
        hideAll();
      }}>
        <Tooltip
          title={isExpandWidget ? t(Strings.widget_collapse_tooltip) : t(Strings.widget_expand_tooltip)}
        >
          <IconButton icon={ReactIconExpand} />
        </Tooltip>
      </span>
    }
    {
      !config.hideMoreOperate &&
      <span data-guide-id="WIDGET_ITEM_MORE" className={classNames({
        [styles.npOpacity]: displayMode === 'always' || config.isDevMode || isExpandWidget,
      }, styles.operateButton, 'dragHandleDisabled')} onClick={triggerMenu}
      >
        <Tooltip
          title={t(Strings.widget_more_settings_tooltip)}
        >
          <IconButton icon={ReactMoreOutlined} />
        </Tooltip>
      </span>
    }
  </div>;
};