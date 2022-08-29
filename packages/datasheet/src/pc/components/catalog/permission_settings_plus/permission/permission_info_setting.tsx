import { Box, LinkButton, TextButton, Typography, useThemeColors } from '@vikadata/components';
import { IRoleMember, Strings, t } from '@vikadata/core';
import { ChevronDownOutlined, ChevronUpOutlined, LockOutlined, MultiplemembersFilled } from '@vikadata/icons';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import { ScreenSize } from 'pc/components/common/component_display/component_display';
import { Popconfirm } from 'pc/components/common/popconfirm';
import { useResponsive } from 'pc/hooks';
import { useState } from 'react';
import { Menu, MenuItem } from './menu';
import styles from './style.module.less';
import { IRoleOption } from './unit_item/interface';
import { PermissionSelectMobile } from './unit_item/permission_select_mobile';

export const PermissionInfoSetting: React.FC<{
  isExtend?: boolean
  members: IRoleMember[];
  defaultRole: IRoleOption[];
  className?: string;
  readonly?: boolean;
  tipOptions: {
    extendTips: string;
    resetPopConfirmTitle: string;
    resetPopConfirmContent: string;
    resetPermissionDesc: string;
  }
  resetPermission: () => void;
  toggleIsMemberDetail: () => void;
  batchEditRole?: (role: string) => void;
  batchDeleteRole?: () => void;
}> = (props) => {
  const {
    isExtend, members, defaultRole, className, tipOptions, readonly,
    batchEditRole, resetPermission, toggleIsMemberDetail,
    batchDeleteRole
  } = props;
  const colors = useThemeColors();
  const [resetPermissionConfirm, setResetPermissionConfirm] = useState<boolean>();
  
  const { extendTips, resetPopConfirmContent, resetPopConfirmTitle, resetPermissionDesc } = tipOptions;

  return (
    <div className={classNames(styles.permissionInfoSetting, className)}>
      {/* 当前权限的描述 */}
      <div className={styles.tipContainer}>
        {isExtend ?
          <Box>
            <MultiplemembersFilled className={styles.tipIcon} color={colors.textCommonTertiary}/>
            <Typography variant="body3" className={styles.tip} color={colors.textCommonSecondary}>
              {extendTips}
            </Typography>
          </Box> :
          <div className={styles.hasSettingBox}>
            <LockOutlined className={styles.hasSettingIcon} color={colors.textBrandDefault} />
            <div>
              {resetPermissionDesc}
              {!readonly && <Popconfirm
                title={resetPopConfirmTitle}
                content={resetPopConfirmContent}
                visible={resetPermissionConfirm}
                onCancel={() => {
                  setResetPermissionConfirm(false);
                }}
                trigger={'click'}
                onOk={() => {
                  setResetPermissionConfirm(false);
                  resetPermission();
                }}
                type="warning"
                onVisibleChange={setResetPermissionConfirm}
              >
                <a id="resetPermissionButton">{t(Strings.reset_permission_default)}</a>
              </Popconfirm>}
            </div>
          </div>
        }
      </div>
      {/* 批量设置 */}
      <div className={styles.settingLine}>
        <div className={styles.viewByPersonBtn} onClick={() => toggleIsMemberDetail()}>
          <Typography variant="body3" color={colors.textCommonSecondary}>{t(Strings.share_and_permission_member_detail, {
            count: members.length
          })}</Typography>
        </div>
        {!readonly && <BatchSetting onClick={batchEditRole} onRemove={batchDeleteRole} defaultRole={defaultRole} />}
      </div>
    </div>
  );
};

const BatchSetting = (props: {
  defaultRole: IRoleOption[];
  onClick?: (role: string) => void;
  onRemove?: () => void;
}) => {
  const { onClick, onRemove, defaultRole } = props;
  const [batchSelectVisible, setBatchSelectVisible] = useState<boolean>();
  const { screenIsAtMost } = useResponsive();
  const isMobile = screenIsAtMost(ScreenSize.md);
  const colors = useThemeColors();

  const buttonIconColor = colors.black[500];

  if (isMobile) {
    return (
      <PermissionSelectMobile
        role={''}
        unitId={''}
        roleOptions={defaultRole}
        title={t(Strings.batch_edit_permission)}
        onChange={(unitId, value) => onClick && onClick(value)}
        onRemove={onRemove}
      >
        <LinkButton
          component="div"
          underline={false}
          suffixIcon={batchSelectVisible ? <ChevronUpOutlined color={buttonIconColor}/> : <ChevronDownOutlined color={buttonIconColor}/>}
          color={colors.black[1000]}
        >
          {t(Strings.batch_edit_permission)}
        </LinkButton>
      </PermissionSelectMobile>
    );
  }

  return (
    <Dropdown
      trigger={['click']}
      overlay={<Menu onClick={() => setBatchSelectVisible(false)}>
        {defaultRole.map(v => <MenuItem key={v.value} {...v} onClick={onClick} />)}
        {onRemove && <MenuItem
          className={styles.batchDeleteItem}
          label={t(Strings.remove_role)}
          value={'remove'}
          onClick={onRemove}
        >
          {t(Strings.remove_role)}
        </MenuItem>}
      </Menu>}
      visible={batchSelectVisible}
      onVisibleChange={setBatchSelectVisible}
    >
      <TextButton
        size="small"
        suffixIcon={batchSelectVisible ? <ChevronUpOutlined /> : <ChevronDownOutlined />}
      >
        {t(Strings.batch_edit_permission)}
      </TextButton>
    </Dropdown>
  );
};