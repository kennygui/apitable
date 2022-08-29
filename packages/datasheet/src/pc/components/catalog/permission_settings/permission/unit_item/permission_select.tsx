import * as React from 'react';
import { Select, Tooltip, useThemeColors } from '@vikadata/components';
import { IRoleOption, IUnitInfo } from 'pc/components/catalog/permission_settings/permission/unit_item/interface';
import styles from './style.module.less';
import classNames from 'classnames';
import classnames from 'classnames';
import { CheckOutlined, WarnFilled } from '@vikadata/icons';
import { ConfigConstant, Strings, t } from '@vikadata/core';
import { ComponentDisplay, ScreenSize } from 'pc/components/common/component_display/component_display';
import { MobileSelect } from 'pc/components/common';
import PulldownIcon from 'static/icon/common/common_icon_pulldown_line.svg';
import { WrapperTooltip } from 'pc/components/widget/widget_panel/widget_panel_header';

const Option = Select.Option!;

interface IPermissionSelectProps {
  role: string;
  roleOptions: IRoleOption[];
  onChange?: (unitId: string, role: string) => void;
  unit: IUnitInfo;
  allowRemove?: boolean;
  onRemove?: (unitId: string) => void;
  roleInvalid?: boolean
}

export const PermissionSelect: React.FC<IPermissionSelectProps> = (props) => {
  const { roleOptions, role, onChange, unit, allowRemove = true, onRemove, roleInvalid } = props;
  const colors = useThemeColors();
  return <>
    <ComponentDisplay minWidthCompatible={ScreenSize.md}>
      <div className={styles.selectWrapper}>
        <Select
          value={role}
          onSelected={(option, index) => {
            if (option.value === 'remove') {
              onRemove?.(unit.id);
              return;
            }
            onChange?.(unit.id, option.value as string);
          }}
          dropdownMatchSelectWidth={false}
          triggerStyle={{
            border: 'none'
          }}
          triggerCls={styles.hoverBg}
          suffixIcon={roleInvalid ? <Tooltip content={t(Strings.field_permission_role_valid)}>
            <span><WarnFilled /></span>
          </Tooltip> : null
          }
        >
          {
            roleOptions.map((option, index) => {
              return <Option key={option.value} value={option.value} disabled={option.disabled} currentIndex={index}>
                <WrapperTooltip wrapper={Boolean(option.disabled && option.disabledTip)} tip={option.disabledTip || ''}>
                  <span>{option.label}</span>
                </WrapperTooltip>
              </Option>;
            })
          }
          <Option
            value={'remove'}
            disabled={!allowRemove}
            currentIndex={roleOptions.length}
            className={
              classNames({
                [styles.delete]: true,
                [styles.disabled]: !allowRemove,
              })}
          >
            {t(Strings.remove_role)}
          </Option>;
        </Select>
      </div>
    </ComponentDisplay>
    <ComponentDisplay maxWidthCompatible={ScreenSize.md}>

      {
        <MobileSelect
          triggerComponent={
            <div
              className={styles.mobileRoleSelect}
            >
              {ConfigConstant.permissionText[role!]}
              {
                <PulldownIcon className={styles.arrowIcon} width={16} height={16} fill={colors.fourthLevelText} />
              }
            </div>
          }
          renderList={({ setVisible }) => {
            return <>
              <div className={styles.mobileWrapper}>
                {
                  roleOptions.map(item => (
                    <div
                      className={classNames(styles.mobileOption)}
                      key={item.value}
                      onClick={() => {
                        onChange?.(unit.id, item.value);
                        setVisible(false);
                      }}
                    >
                      {item.label}
                      {item.value === role && <CheckOutlined color={colors.primaryColor} />}
                    </div>
                  ))
                }
              </div>
              {
                onRemove &&
                <div className={classnames(styles.deleteItem, styles.group)} onClick={() => {onRemove(unit.id);}}>{t(Strings.delete)}</div>
              }
            </>;
          }}
        />
      }
    </ComponentDisplay>
  </>
  ;
};
