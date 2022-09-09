import { useState } from 'react';
import * as React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Selectors, t, Strings, IFormProps, CollaCommandName, DATASHEET_ID } from '@vikadata/core';
import Trigger from 'rc-trigger';
import classNames from 'classnames';
import { useThemeColors } from '@vikadata/components';
import styles from './style.module.less';
import { SettingPanel } from './setting_panel';
import { ShareModal } from './share_modal';
import { ToolItem } from '../../../tool_bar/tool_item';
import SettingIcon from 'static/icon/datasheet/gallery/datasheet_icon_setting.svg';
import ShareIcon from 'static/icon/datasheet/viewtoolbar/datasheet_icon_share_normal.svg';
import { useResponsive } from 'pc/hooks';
import { ScreenSize } from 'pc/components/common/component_display';
import { resourceService } from 'pc/resource_service';
interface IToolBarProps {
  nodeShared: boolean;
  showLabel?: boolean;
}

export const ToolBar: React.FC<IToolBarProps> = props => {
  const { nodeShared, showLabel = true } = props;
  const colors = useThemeColors();
  const [isPanelShow, setPanelShow] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const { screenIsAtMost } = useResponsive();
  const isMobile = screenIsAtMost(ScreenSize.md);
  const { formId, formProps, manageable } = useSelector(state => {
    const { id, snapshot, permissions } = Selectors.getForm(state)!;
    const { manageable } = permissions;
    return {
      formProps: snapshot.formProps,
      formId: id,
      manageable,
    };
  }, shallowEqual);

  const updateProps = (partProps: Partial<IFormProps>) => {
    resourceService.instance!.commandManager.execute({
      cmd: CollaCommandName.UpdateFormProps,
      formId,
      partialProps: partProps,
    });
    if (partProps.coverVisible != null || partProps.logoVisible != null) {
      // 当用户滚动到页面底部改变设置项时，提醒用户设置项生效
      const formContainer = document.querySelector('.vikaFormContainer');
      formContainer?.scrollTo(0, 0);
    }
  };

  const commonProps = {
    formId,
    formProps,
    updateProps,
  };

  return (
    <>
      {!isMobile && manageable && (
        <Trigger
          action={['click']}
          popup={<SettingPanel {...commonProps} />}
          destroyPopupOnHide
          popupAlign={{ points: ['tr', 'br'], offset: [-8, 10], overflow: { adjustX: true, adjustY: true }}}
          popupStyle={{ width: 240 }}
          popupVisible={isPanelShow}
          onPopupVisibleChange={visible => setPanelShow(visible)}
          zIndex={1000}
        >
          <ToolItem
            className={classNames(styles.toolbarItem, isPanelShow && styles.active)}
            text={t(Strings.form_tab_setting)}
            id={DATASHEET_ID.FORM_CONTAINER_SETTING}
            icon={
              <SettingIcon width={16} height={16} fill={isPanelShow ? colors.primaryColor : colors.secondLevelText} className={styles.toolIcon} />
            }
            onClick={() => setPanelShow(true)}
            showLabel={showLabel}
          />
        </Trigger>
      )}
      <ToolItem
        icon={<ShareIcon width={16} height={16} fill={nodeShared ? colors.primaryColor : colors.secondLevelText} className={styles.toolIcon} />}
        text={t(Strings.form_tab_share)}
        isActive={nodeShared}
        className={styles.toolbarItem}
        onClick={() => setVisible(true)}
        showLabel={showLabel}
      />
      {<ShareModal formId={formId} visible={visible} onClose={() => setVisible(false)} />}
    </>
  );
};
