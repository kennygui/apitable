import {
  DateFormat, TimeFormat, IDateTimeBaseField, IField, t, Strings,
  FieldType, CollectType, ILastModifiedTimeFieldProperty, ILastModifiedTimeField,
} from '@vikadata/core';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import * as React from 'react';
import styles from '../styles.module.less';
import classNames from 'classnames';
import { Switch } from 'antd';
import settingStyles from '../../field_setting/styles.module.less';
import { CollectTypeSelect } from './collect_type_select';
import { FieldSelectModal } from './field_select_modal';
import { Divider } from 'pc/components/common/divider';
import { ComponentDisplay, ScreenSize } from 'pc/components/common/component_display/component_display';
import { MobileSelect } from 'pc/components/common';
import { Select } from '@vikadata/components';

interface IFormatDateTime {
  currentField: IDateTimeBaseField;
  setCurrentField: Dispatch<SetStateAction<IField>>;
}

const optionDateFormatData = [
  { value: DateFormat['YYYY/MM/DD'], label: t(Strings.label_format_year_month_and_day_split_by_slash) },
  { value: DateFormat['YYYY-MM-DD'], label: t(Strings.label_format_year_month_and_day_split_by_dash) },
  { value: DateFormat['DD/MM/YYYY'], label: t(Strings.label_format_day_month_and_year_split_by_slash) },
  { value: DateFormat['YYYY-MM'], label: t(Strings.label_format_year_and_month_split_by_dash) },
  { value: DateFormat['MM-DD'], label: t(Strings.label_format_month_and_day_split_by_dash) },

  { value: DateFormat['YYYY'], label: t(Strings.label_format_year) },
  { value: DateFormat['MM'], label: t(Strings.label_format_month) },
  { value: DateFormat['DD'], label: t(Strings.label_format_day) },
];

const optionTimeFormatData = [
  { value: TimeFormat['hh:mm'], label: t(Strings.twelve_hour_clock) },
  { value: TimeFormat['HH:mm'], label: t(Strings.twenty_four_hour_clock) },
];

export const FormatDateTime: React.FC<IFormatDateTime> = (props: IFormatDateTime) => {
  const { currentField, setCurrentField } = props;
  const [isModalShow, setModalShow] = useState(false);
  const handleDateFormatChange = ({ value }) => {
    setCurrentField({
      ...currentField,
      property: {
        ...currentField.property,
        dateFormat: value,
      } as any,
    });
  };

  const handleTimeFormatChange = ({ value }) => {
    setCurrentField({
      ...currentField,
      property: {
        ...currentField.property,
        timeFormat: value,
      } as any,
    });
  };

  const handleIncludeTimeChange = (checked: boolean) => {
    setCurrentField({
      ...currentField,
      property: {
        ...currentField.property,
        includeTime: checked,
      } as any,
    });
  };

  const handleFillChange = (checked: boolean) => {
    setCurrentField({
      ...currentField,
      property: {
        ...currentField.property,
        autoFill: checked,
      } as any,
    });
  };

  const handleCollectTypeChange = useCallback((type: number) => {
    setCurrentField({
      ...currentField,
      property: {
        ...currentField.property,
        collectType: type,
      } as any,
    });
  }, [currentField, setCurrentField]);

  const handleFieldIdCollectionChange = useCallback((collection: string[]) => {
    setCurrentField({
      ...currentField,
      property: {
        ...currentField.property,
        fieldIdCollection: collection,
      } as any,
    });
  }, [currentField, setCurrentField]);

  const handleCollectTypeSelectedChange = useCallback((type: number) => {
    if (type === CollectType.SpecifiedFields) {
      setModalShow(true);
    }
    handleCollectTypeChange(type);
  }, [handleCollectTypeChange]);

  const handleModalDataChange = useCallback((collection: string[]) => {
    setModalShow(false);
    handleFieldIdCollectionChange(collection);
  }, [handleFieldIdCollectionChange]);

  const handleModalDataCancel = useCallback(() => {
    setModalShow(false);
    if (!(currentField.property as ILastModifiedTimeFieldProperty).fieldIdCollection.length) {
      handleCollectTypeChange(CollectType.AllFields);
    }
  }, [handleCollectTypeChange, currentField]);

  const { includeTime, dateFormat, timeFormat } = currentField.property;

  const selectTriggerStyle: React.CSSProperties = {
    height: 40,
  };

  return (
    <div className={styles.section}>
      {
        currentField.type === FieldType.LastModifiedTime && (
          <CollectTypeSelect
            field={currentField as ILastModifiedTimeField}
            onChange={handleCollectTypeSelectedChange}
          />
        )
      }
      <div className={styles.sectionTitle}>{t(Strings.datetime_format)}</div>
      <ComponentDisplay minWidthCompatible={ScreenSize.md}>
        <Select
          triggerCls={styles.customSelect}
          dropdownMatchSelectWidth={false}
          value={dateFormat}
          onSelected={handleDateFormatChange}
          options={optionDateFormatData}
        />
      </ComponentDisplay>

      <ComponentDisplay maxWidthCompatible={ScreenSize.md}>
        <MobileSelect
          defaultValue={dateFormat}
          optionData={optionDateFormatData}
          onChange={value => handleDateFormatChange({ value })}
          style={selectTriggerStyle}
        />
      </ComponentDisplay>
      <section className={settingStyles.section} style={{ marginTop: 16 }}>
        <div className={classNames(settingStyles.sectionTitle, settingStyles.sub)}>
          {t(Strings.include_time)}
          <Switch
            size="small"
            checked={includeTime}
            onChange={handleIncludeTimeChange}
          />
        </div>
      </section>
      {
        currentField.type === FieldType.DateTime && <section className={settingStyles.section}>
          <div className={classNames(settingStyles.sectionTitle, settingStyles.sub)}>
            {t(Strings.autofill_createtime)}
            <Switch
              size="small"
              checked={currentField.property.autoFill}
              onChange={handleFillChange}
            />
          </div>
        </section>
      }
      {includeTime && <Divider />}
      {
        includeTime && <section className={settingStyles.section}>
          <div className={settingStyles.sectionTitle}>{t(Strings.time_format)}</div>
          <ComponentDisplay minWidthCompatible={ScreenSize.md}>
            <Select
              triggerCls={styles.customSelect}
              dropdownMatchSelectWidth={false}
              value={timeFormat}
              onSelected={handleTimeFormatChange}
              options={optionTimeFormatData}
            />
          </ComponentDisplay>

          <ComponentDisplay maxWidthCompatible={ScreenSize.md}>
            <MobileSelect
              defaultValue={timeFormat}
              optionData={optionTimeFormatData}
              onChange={value => handleTimeFormatChange({ value })}
              style={selectTriggerStyle}
            />
          </ComponentDisplay>
        </section>
      }
      {
        isModalShow && <FieldSelectModal
          field={currentField}
          onCancel={handleModalDataCancel}
          onOk={handleModalDataChange}
        />
      }
    </div>
  );
};
