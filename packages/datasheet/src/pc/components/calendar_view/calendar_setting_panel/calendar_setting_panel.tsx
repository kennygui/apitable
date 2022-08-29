import { FC, useContext, useMemo } from 'react';
import { black, IOption, Select, Tooltip, Typography, useThemeColors } from '@vikadata/components';
import { AddOutlined, ChevronRightOutlined, ClassroomOutlined, CloseMiddleOutlined, InformationSmallOutlined } from '@vikadata/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  BasicValueType, CalendarColorType, CalendarStyleKeyType, CollaCommandName, ConfigConstant, DateTimeField, ExecuteResult, Field, FieldType, getNewId,
  getUniqName, ICalendarViewColumn, ICalendarViewProperty, ICalendarViewStyle, IDPrefix, Settings, StoreActions, Strings, t
} from '@vikadata/core';
import { ColorPicker, OptionSetting } from 'pc/components/common/color_picker';
import { setStorage, StorageName } from 'pc/utils/storage';
import { getFieldTypeIcon } from 'pc/components/multi_grid/field_setting';
import { resourceService } from 'pc/resource_service';
import { setColor } from 'pc/components/multi_grid/format';
import { CalendarContext } from '../calendar_context';
import styles from './styles.module.less';
import { batchActions } from 'redux-batched-actions';
import { notify } from 'pc/components/common/notify';
import { NotifyKey } from 'pc/components/common/notify/notify.interface';
import { FieldPermissionLock } from 'pc/components/field_permission';
import { TriggerCommands } from 'pc/common/apphook/trigger_commands';
import { executeCommandWithMirror } from 'pc/utils/execute_command_with_mirror';

const UNUSED_END_DATE = 'unusedEndDate';

interface ICalendarSettingPanel {
  calendarStyle: ICalendarViewStyle
}

export const CalendarSettingPanel: FC<ICalendarSettingPanel> = ({ calendarStyle }) => {
  const colors = useThemeColors();
  const { startFieldId, endFieldId, colorOption } = calendarStyle;
  const { color } = colorOption;
  const { fieldMap, view, calendarViewStatus, permissions, isCryptoStartField, isCryptoEndField } = useContext(CalendarContext);
  const noRequiredField = !startFieldId && !endFieldId;
  const exitFieldNames = Object.values(fieldMap).map(field => field.name);
  const isStartFieldDeleted = startFieldId && !isCryptoStartField && !fieldMap[startFieldId];
  const isEndFieldDeleted = endFieldId && !isCryptoEndField && !fieldMap[endFieldId];
  const columns = view.columns as ICalendarViewColumn[];
  const {
    spaceId,
    viewId,
    datasheetId,
    cacheTheme,
  } = useSelector(state => {
    const { datasheetId: dstId, viewId: vId } = state.pageParams;
    return {
      datasheetId: dstId,
      viewId: vId,
      spaceId: state.space.activeId!,
      cacheTheme: state.theme,
    };
  }, shallowEqual);
  const fieldOptions = useMemo(() => {
    const options = columns.map(({ fieldId }) => {
      const field = fieldMap[fieldId];
      if ([Field.bindModel(field).basicValueType, Field.bindModel(field).innerBasicValueType].includes(BasicValueType.DateTime)) {
        return {
          label: field.name,
          value: fieldId,
          prefixIcon: getFieldTypeIcon(field.type),
        };
      }
      return null;
    }).filter(v => v) as IOption[];
    if (isCryptoStartField) {
      options.push({
        value: startFieldId,
        label: t(Strings.crypto_field),
        disabled: true,
        suffixIcon: <FieldPermissionLock fieldId={startFieldId} tooltip={t(Strings.field_permission_lock_tips)} />
      });
    }
    if (isCryptoEndField) {
      options.push({
        value: endFieldId,
        label: t(Strings.crypto_field),
        disabled: true,
        suffixIcon: <FieldPermissionLock fieldId={endFieldId} tooltip={t(Strings.field_permission_lock_tips)} />
      });
    }
    options.push({
      label: t(Strings.calendar_add_date_time_field),
      value: 'add',
      disabled: !permissions.manageable,
      prefixIcon: <AddOutlined color={colors.thirdLevelText} />,
    });
    return options;
  }, [columns, endFieldId, fieldMap, isCryptoEndField, isCryptoStartField, permissions.manageable, startFieldId, colors]);

  const dispatch = useDispatch();
  const onClose = () => {
    const { guideStatus } = calendarViewStatus;
    if (guideStatus) {
      dispatch(StoreActions.toggleCalendarSettingPanel(false, datasheetId!));
    } else {
      dispatch(
        batchActions([
          StoreActions.toggleCalendarSettingPanel(false, datasheetId!),
          StoreActions.toggleCalendarGuideStatus(true, datasheetId!),
          StoreActions.toggleCalendarGrid(true, datasheetId!),
        ])
      );
    }
    const restStatus = guideStatus ? {} : { guideStatus: true, guideWidth: true };
    setStorage(StorageName.CalendarStatusMap, {
      [`${spaceId}_${datasheetId}_${viewId}`]: {
        ...calendarViewStatus,
        settingPanelVisible: false,
        ...restStatus,
      },
    });
  };

  const handleAddField = (styleKey) => {
    if (!permissions.manageable) {
      return;
    }
    const newFieldId = getNewId(IDPrefix.Field);
    const newFieldName = styleKey === CalendarStyleKeyType.StartFieldId ? t(Strings.calendar_start_field_name) : t(Strings.calendar_end_field_name);
    const result = resourceService.instance!.commandManager.execute({
      cmd: CollaCommandName.AddFields,
      data: [{
        data: {
          id: newFieldId,
          name: getUniqName(newFieldName, exitFieldNames),
          type: FieldType.DateTime,
          property: DateTimeField.defaultProperty(),
        },
        viewId,
        index: columns.length,
      }],
    });
    if (ExecuteResult.Success === result.result) {
      notify.open({
        message: t(Strings.toast_add_field_success),
        key: NotifyKey.AddField,
      });
      handleStyleChange(styleKey, newFieldId);
    }
  };

  const handleStyleChange = (styleKey, styleValue) => {
    executeCommandWithMirror(() => {
      resourceService.instance!.commandManager.execute({
        cmd: CollaCommandName.SetCalendarStyle,
        viewId: viewId!,
        isClear: styleValue === UNUSED_END_DATE,
        data: [{
          styleKey,
          styleValue,
        }]
      });
    }, {
      style: {
        ...(view as ICalendarViewProperty).style,
        [styleKey]: styleValue
      }
    });
  };

  const onColorPick = (type: OptionSetting, id: string, value: string | number) => {
    if (type === OptionSetting.SETCOLOR) {
      handleStyleChange(CalendarStyleKeyType.ColorOption, {
        ...colorOption,
        type: CalendarColorType.Custom,
        color: Number(value),
      });
    }
  };

  const onPlayGuideVideo = () => {
    TriggerCommands.open_guide_wizard(ConfigConstant.WizardIdConstant.REPLAY_CALENDAR_VIDEO);
  };

  return (
    <div className={styles.settingPanelContainer}>
      <header className={styles.header}>
        <div className={styles.title}>
          <Typography variant="h6">
            {t(Strings.calendar_setting)}
          </Typography>
          <Tooltip content={t(Strings.calendar_setting_help_tips)}>
            <a
              href={Settings.calendar_setting_help_url.value}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.helpIcon}
            >
              <InformationSmallOutlined color={colors.thirdLevelText} />
            </a>
          </Tooltip>
        </div>
        <CloseMiddleOutlined
          className={styles.closeIcon}
          size={16}
          color={black[500]}
          onClick={onClose}
        />
      </header>
      <div className={styles.guideWrap} onClick={onPlayGuideVideo}>
        <span className={styles.left}>
          <ClassroomOutlined size={16} color={colors.primaryColor} />
          <Typography variant="body3" color={colors.secondLevelText}>
            {t(Strings.calendar_play_guide_video_title)}
          </Typography>
        </span>
        <ChevronRightOutlined size={16} color={colors.thirdLevelText} />
      </div>
      <div className={styles.setting}>
        <Typography className={styles.settingTitle} variant="h7">
          {t(Strings.calendar_date_time_setting)}
        </Typography>
        <div className={styles.settingLayout}>
          {[
            [startFieldId, isStartFieldDeleted],
            [endFieldId || UNUSED_END_DATE, isEndFieldDeleted]
          ].map((fieldContent, fieldIdx) => {
            const [fieldId, isFieldDeleted] = fieldContent as [string, boolean];
            const isStart = fieldIdx === 0;
            return (
              <div key={fieldIdx} className={styles.selectField}>
                <Select
                  value={fieldId}
                  onSelected={
                    (option) => {
                      const handleKey = isStart ? CalendarStyleKeyType.StartFieldId : CalendarStyleKeyType.EndFieldId;
                      if (option.value === 'add') {
                        handleAddField(handleKey);
                      } else {
                        handleStyleChange(handleKey, option.value);
                      }
                    }
                  }
                  placeholder={isStart ? t(Strings.calendar_pick_start_time) : t(Strings.calendar_pick_end_time)}
                  dropdownMatchSelectWidth
                  triggerStyle={{
                    border: isFieldDeleted ? `1px solid ${colors.rc08}` : 'none'
                  }}
                >
                  {
                    (isStart ? fieldOptions.filter(f => f.value !== endFieldId) : [
                      {
                        label: t(Strings.calendar_setting_clear_end_time),
                        value: UNUSED_END_DATE,
                        disabled: !permissions.editable || !endFieldId,
                      },
                      ...fieldOptions.filter(f => f.value !== startFieldId),
                    ]).map((option, index) => {
                      return (
                        <Select.Option
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                          currentIndex={index}
                          prefixIcon={option.prefixIcon}
                        >
                          {option.label}
                        </Select.Option>
                      );
                    })
                  }
                </Select>
                {isFieldDeleted && (
                  <span className={styles.errorText}>
                    {t(Strings.calendar_setting_field_deleted)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {noRequiredField && <span className={styles.errorText}>{t(Strings.must_one_date)}</span>}
      </div>
      {false && <div className={styles.color}>
        <div className={styles.outer}>
          <div
            className={styles.inner}
            style={{
              backgroundColor: color === -1 ? colors.defaultBg : setColor(color, cacheTheme),
            }}
          />
        </div>
        <ColorPicker
          onChange={onColorPick}
          option={{
            id: '',
            name: '',
            color: colorOption.color,
          }}
          mask
          triggerComponent={
            <Typography variant="body3" className={styles.more} component={'span'}>
              {t(Strings.calendar_color_more)}
            </Typography>
          }
        />
      </div>}
    </div>
  );
};
