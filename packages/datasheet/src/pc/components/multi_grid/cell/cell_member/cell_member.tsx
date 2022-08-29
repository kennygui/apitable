import { Button, useThemeColors } from '@vikadata/components';
import {
  Api, IMemberField, IReduxState, IUnitIds, MemberField, MemberType, OtherTypeUnitId, RowHeightLevel, Selectors, StoreActions, Strings, t
} from '@vikadata/core';
import { AddOutlined, CloseSmallOutlined } from '@vikadata/icons';
import { difference } from 'lodash';
import keyBy from 'lodash/keyBy';
import { ButtonPlus } from 'pc/components/common';
import { MouseDownType } from 'pc/components/selection_wrapper';
import { store } from 'pc/store';
import { stopPropagation } from 'pc/utils';
import { useEffect, useMemo } from 'react';
import * as React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { ICellComponentProps } from '../cell_value/interface';
import { OptionalCellContainer } from '../optional_cell_container/optional_cell_container';
import optionalStyle from '../optional_cell_container/style.module.less';
import { MemberItem } from './member_item';
import styles from './styles.module.less';

interface ICellMember extends ICellComponentProps {
  field: IMemberField;
  keyPrefix?: string;
  rowHeightLevel?: RowHeightLevel;
  deletable?: boolean
}

export const CellMember: React.FC<ICellMember> = props => {
  const {
    cellValue: cellValueIncludeOldData, field: propsField, isActive, onChange, toggleEdit, readonly, className, rowHeightLevel, deletable = true,
  } = props;
  const colors = useThemeColors();
  const {
    datasheetId,
    unitMap,
    userInfo,
    field,
  } = useSelector((state: IReduxState) => ( {
    datasheetId: Selectors.getActiveDatasheetId(state)!,
    unitMap: Selectors.getUnitMap(state)!,
    userInfo: state.user.info!,
    field: propsField && Selectors.findRealField(state, propsField)
  }), shallowEqual);
  const isMulti = field?.property.isMulti;
  const cellValue = useMemo(() => {
    const unitIds = MemberField.polyfillOldData((cellValueIncludeOldData as IUnitIds));
    // https://sentry.vika.ltd/organizations/vika/issues/6939/events/348bdf36c4c4437c8984d55f23c2d2bc/?project=7
    return Array.isArray(unitIds) ? unitIds.flat() : null;
  }, [cellValueIncludeOldData]);

  useEffect(() => {
    // 处理数据协同导致的成员信息缺失处理
    if (!cellValue) {
      return;
    }
    const unitMap = Selectors.getUnitMap(store.getState());
    const exitUnitIds = unitMap ? Object.keys(unitMap) : [];
    const unitIds = MemberField.polyfillOldData(cellValue as IUnitIds);
    const missInfoUnitIds: string[] = difference(unitIds, exitUnitIds);
    const realMissUnitIds = missInfoUnitIds.filter(unitId => {
      return !([OtherTypeUnitId.Self, OtherTypeUnitId.Alien] as string[]).includes(unitId);
    });
    if (!realMissUnitIds.length) {
      return;
    }
    const { shareId, templateId } = store.getState().pageParams;
    const linkId = shareId || templateId;
    Api.loadOrSearch({ unitIds: realMissUnitIds.join(','), linkId }).then(res => {
      const { data: { data: resData, success }} = res;
      if (!resData.length || !success) {
        return;
      }
      store.dispatch(StoreActions.updateUnitMap(keyBy(resData, 'unitId')));
    });
  }, [cellValue, field, datasheetId]);

  function deleteItem(e: React.MouseEvent, index?: number) {
    stopPropagation(e);
    onChange && onChange(cellValue && (cellValue as IUnitIds).filter((cv, idx) => idx !== index));
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button === MouseDownType.Right) {
      return;
    }
    isActive && !readonly && toggleEdit && toggleEdit();
  }

  const showAddIcon = (isActive && !readonly) && (isMulti || (!isMulti && !cellValue));

  const showDeleteIcon = () => {
    if (!deletable) return false;
    return isActive && !readonly;
  };

  const MainLayout = () => {
    return (
      <OptionalCellContainer
        onMouseDown={onMouseDown}
        className={className}
        displayMinWidth={Boolean(isActive && !readonly && isMulti)}
        viewRowHeight={rowHeightLevel}
      >
        {
          showAddIcon &&
          <ButtonPlus.Icon
            size={'x-small'}
            className={optionalStyle.iconAdd}
            icon={<AddOutlined color={colors.fourthLevelText} />}
          />
        }
        {
          cellValue ? (cellValue as IUnitIds)
            .map((item, index) => {
              let unitInfo;

              // 仅筛选时会出现 -> 当前用户标记
              if (item === OtherTypeUnitId.Self) {
                const { uuid, unitId, memberName, nickName } = userInfo;
                const currentUnit = {
                  type: MemberType.Member,
                  userId: uuid,
                  unitId,
                  avatar: '',
                  name: `${t(Strings.add_sort_current_user)}（${memberName || nickName}）`,
                  isActive: true,
                  isDelete: false,
                  isSelf: true,
                };
                unitInfo = currentUnit;
              } else {
                if (!unitMap || !unitMap[item]) {
                  return <></>;
                }
                unitInfo = unitMap[item];
              }
              return (
                <MemberItem unitInfo={unitInfo} key={index}>
                  {
                    showDeleteIcon() ?
                      <Button
                        onClick={e => deleteItem(e, index)}
                        onMouseDown={stopPropagation}
                        className={styles.close}
                        style={{
                          width: 16,
                          height: 16,
                          padding: 0,
                          borderRadius: 2,
                          marginLeft: 4
                        }}
                        variant="fill"
                        color={colors.defaultTag}
                      >
                        <CloseSmallOutlined size={16} color={colors.fc2} />
                      </Button> :
                      <></>
                  }
                </MemberItem>
              );
            }) :
            <></>
        }
      </OptionalCellContainer>
    );
  };

  // Tooltip 只在必要的时候 render 以提升性能
  return MainLayout();
};
