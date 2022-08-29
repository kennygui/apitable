import { ConfigConstant, ResourceType, Selectors, Strings, t } from '@vikadata/core';
import { ChevronLeftOutlined, CloseLargeOutlined } from '@vikadata/icons';
import RcTrigger from 'rc-trigger';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import IconAdd from 'static/icon/common/common_icon_add_content.svg';
import IconArrow from 'static/icon/common/common_icon_pulldown_line.svg';
import { expandWidgetCenter, InstallPosition } from '../../widget_center/widget_center';
import styles from './style.module.less';
import { WidgetPanelList } from './widget_panel_list';
import { getStorage, setStorage, StorageName } from 'pc/utils/storage/storage';
import { IconButton, useThemeColors } from '@vikadata/components';
import { Tooltip } from 'antd';
import { ComponentDisplay, ScreenSize } from 'pc/components/common/component_display/component_display';
import { Popup } from 'pc/components/common/mobile/popup';

const ReactIconAdd = () => {
  const colors = useThemeColors();
  return <IconAdd width={16} height={16} fill={colors.thirdLevelText} />;
};

interface IWrapperTooltip {
  wrapper: boolean;
  tip: string;
  style?: React.CSSProperties;
}

export const installedWidgetHandle = (widgetId: string, isFocus = true) => {
  const widgetDom = document.querySelector(`div[data-widget-id=${widgetId}]`);
  if (!widgetDom) {
    return;
  }
  widgetDom.scrollIntoView({ block: 'nearest' });
  isFocus && (widgetDom as HTMLDivElement).classList.add(styles.newInstalledWidget);
  isFocus && (widgetDom as HTMLDivElement).focus();
};

export const WrapperTooltip: React.FC<IWrapperTooltip> = (props) => {
  const { tip, wrapper, children, style } = props;

  if (wrapper) {
    return <Tooltip title={tip}>
      <span style={{ display: 'inline-block', ...style }}>
        {children}
      </span>
    </Tooltip>;
  }
  return <Fragment>
    {children}
  </Fragment>;
};

export const WidgetPanelHeader = (props: { onClosePanel: () => void }) => {
  const colors = useThemeColors();
  const triggerRef = useRef<any>(null);
  const [openPanelList, setOpenPanelList] = useState(false);
  const { datasheetId, mirrorId } = useSelector(state => state.pageParams);
  const activeWidgetPanel = useSelector(state => {
    const resourceId = mirrorId || datasheetId;
    const resourceType = mirrorId ? ResourceType.Mirror : ResourceType.Datasheet;
    return Selectors.getResourceActiveWidgetPanel(state, resourceId!, resourceType);
  })!;
  const spaceId = useSelector(state => state.space.activeId);
  const linkId = useSelector(Selectors.getLinkId);

  const { activePanelName, widgetCount } = useMemo(() => {
    return {
      activePanelName: activeWidgetPanel!.name,
      widgetCount: activeWidgetPanel!.widgets.length,
    };
  }, [activeWidgetPanel]);

  const reachLimitInstalledCount = Boolean(widgetCount >= ConfigConstant.WIDGET_PANEL_MAX_WIDGET_COUNT);

  useEffect(() => {
    const widgetPanelStatusMap = getStorage(StorageName.WidgetPanelStatusMap)!;
    if (!widgetPanelStatusMap) {
      return;
    }
    const storageId = mirrorId || datasheetId;
    const status = widgetPanelStatusMap[`${spaceId},${storageId}`];
    setStorage(StorageName.WidgetPanelStatusMap, {
      [`${spaceId},${storageId}`]: {
        width: status ? status.width : 200,
        opening: true,
        activePanelId: activeWidgetPanel.id,
      },
    });
  }, [activeWidgetPanel, datasheetId, spaceId, mirrorId]);

  const openWidgetCenter = () => {
    expandWidgetCenter(
      InstallPosition.WidgetPanel,
      { installedWidgetHandle });
  };

  const onMenuVisibleChange = (status) => {
    setOpenPanelList(status);
  };

  return <div className={styles.panelHeader}>
    {/* pc 端的显示 */}
    <ComponentDisplay minWidthCompatible={ScreenSize.md}>
      <WrapperTooltip wrapper tip={reachLimitInstalledCount ? t(Strings.reach_limit_installed_widget) : t(Strings.add_widget)}>
        <IconButton
          component={'button'}
          onClick={openWidgetCenter}
          disabled={reachLimitInstalledCount || Boolean(linkId)}
          icon={ReactIconAdd}
        />
      </WrapperTooltip>
      <RcTrigger
        action={'click'}
        popup={
          <WidgetPanelList />
        }
        destroyPopupOnHide
        popupAlign={{
          points: ['tc', 'bc'],
          offset: [-70, 0],
          overflow: { adjustX: true, adjustY: true },
        }}
        popupStyle={{ width: 400 }}
        ref={triggerRef}
        popupVisible={openPanelList}
        onPopupVisibleChange={onMenuVisibleChange}
        zIndex={12}
      >
        <span
          onClick={() => {
            setOpenPanelList(true);
          }}
          className={styles.triggerContainer}
        >
          {activePanelName}
          <span
            style={{
              transform: openPanelList ? 'rotate(180deg)' : '',
            }}
          >
            <IconArrow
              width={16}
              height={16}
              style={{ verticalAlign: '-0.125em' }}
              fill={colors.thirdLevelText}
            />
          </span>
        </span>
      </RcTrigger>
      <IconButton
        onClick={props.onClosePanel}
        icon={CloseLargeOutlined}
      />
    </ComponentDisplay>
    {/** 移动端 */}
    <ComponentDisplay maxWidthCompatible={ScreenSize.md}>
      <div className={styles.navBar}>
        <IconButton
          className={styles.closeButton}
          onClick={props.onClosePanel}
          icon={() => <ChevronLeftOutlined color={colors.firstLevelText} />}
        />
        <span
          onClick={() => {
            setOpenPanelList(true);
          }}
          className={styles.triggerContainer}
        >
          {activePanelName}
          <span
            style={{
              transform: openPanelList ? 'rotate(180deg)' : '',
            }}
          >
            <IconArrow
              width={16}
              height={16}
              style={{ verticalAlign: '-0.125em' }}
              fill={colors.thirdLevelText}
            />
          </span>
        </span>
      </div>
      <Popup className={styles.mobilePanelList} visible={openPanelList} height={'90vh'} onClose={() => setOpenPanelList(false)}>
        <WidgetPanelList onClickItem={() => setOpenPanelList(false)}/>
      </Popup>
    </ComponentDisplay>
  </div>;
};
