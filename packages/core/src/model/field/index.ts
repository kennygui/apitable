import { TextField } from './text_field';
import { AttachmentField } from './attachment_field';
import { DateTimeField } from './date_time_field';
import { CreatedTimeField } from './created_time_field';
import { LastModifiedTimeField } from './last_modified_time_field';
import { NumberField } from './number_field';
import { CurrencyField } from './currency_field';
import { PercentField } from './percent_field';
import { AutoNumberField } from './auto_number_field';
import {
  SingleSelectField,
  MultiSelectField,
} from './select_field';
import { LinkField } from './link_field';
import { URLField } from './url_field';
import { NotSupportField, DeniedField } from './virtual_field';
import {
  ISingleSelectField,
  IMultiSelectField,
  INumberField,
  IAutoNumberField,
  ICurrencyField,
  IPercentField,
  ITextField,
  IDateTimeField,
  ICreatedTimeField,
  ILastModifiedTimeField,
  IAttacheField,
  ILinkField,
  IField,
  FieldType,
  IURLField,
  IEmailField,
  IPhoneField,
  IRatingField,
  ICheckboxField,
  IFormulaField,
  ILookUpField,
  IMemberField,
  ICreatedByField,
  ILastModifiedByField,
  ISingleTextField,
  IDeniedField,
  INotSupportField,
} from 'types/field_types';
import { Field } from './field';
import { EmailField } from './email_field';
import { PhoneField } from './phone_field';
import { RatingField } from './rating_field';
import { CheckboxField } from './checkbox_field';
import { FormulaField } from './formula_field';
import { LookUpField } from './lookup_field';
import { MemberField } from './member_field';
import { CreatedByField } from './created_by_field';
import { LastModifiedByField } from './last_modified_by_field';
import { SingleTextField } from './single_text_field';
import { IReduxState } from 'store';
import { Store } from 'redux';

export * from './field';
export * from './stat';
export * from './text_field';
export * from './number_field';
export * from './select_field';
export * from './date_time_field';
export * from './virtual_field';
export * from './attachment_field';
export * from './link_field';
export * from './url_field';
export * from './email_field';
export * from './phone_field';
export * from './rating_field';
export * from './member_field';
export * from './formula_field';
export * from './lookup_field';
export * from './currency_field';
export * from './single_text_field';
export * from './created_time_field';
export * from './last_modified_time_field';
export * from './created_by_field';
export * from './last_modified_by_field';
export * from './text_base_field';
export { numberThresholdValue } from './number_base_field';
export { OtherTypeUnitId } from './member_base_field';

export interface IBindFieldModel {
  (field: ISingleSelectField, state?: IReduxState, newInstance?: boolean): SingleSelectField;
  (field: IMultiSelectField, state?: IReduxState, newInstance?: boolean): MultiSelectField;
  (field: INumberField, state?: IReduxState, newInstance?: boolean): NumberField;
  (field: ICurrencyField, state?: IReduxState, newInstance?: boolean): CurrencyField;
  (field: IPercentField, state?: IReduxState, newInstance?: boolean): PercentField;
  (field: ITextField, state?: IReduxState, newInstance?: boolean): TextField;
  (field: IDateTimeField, state?: IReduxState, newInstance?: boolean): DateTimeField;
  (field: IAttacheField, state?: IReduxState, newInstance?: boolean): AttachmentField;
  (field: ILinkField, state?: IReduxState, newInstance?: boolean): LinkField;
  (field: IURLField, state?: IReduxState, newInstance?: boolean): URLField;
  (field: IEmailField, state?: IReduxState, newInstance?: boolean): EmailField;
  (field: IRatingField, state?: IReduxState, newInstance?: boolean): RatingField;
  (field: ICheckboxField, state?: IReduxState, newInstance?: boolean): CheckboxField;
  (field: IPhoneField, state?: IReduxState, newInstance?: boolean): PhoneField;
  (field: IFormulaField, state?: IReduxState, newInstance?: boolean): FormulaField;
  (field: ILookUpField, state?: IReduxState, newInstance?: boolean): LookUpField;
  (field: IMemberField, state?: IReduxState, newInstance?: boolean): MemberField;
  (field: ISingleTextField, state?: IReduxState, newInstance?: boolean): SingleTextField;
  (field: IAutoNumberField, state?: IReduxState, newInstance?: boolean): AutoNumberField;
  (field: ICreatedTimeField, state?: IReduxState, newInstance?: boolean): CreatedTimeField;
  (field: ILastModifiedTimeField, state?: IReduxState, newInstance?: boolean): LastModifiedTimeField;
  (field: ICreatedByField, state?: IReduxState, newInstance?: boolean): CreatedByField;
  (field: ILastModifiedByField, state?: IReduxState, newInstance?: boolean): LastModifiedByField;
  (field: IDeniedField, state?: IReduxState, newInstance?: boolean): DeniedField;
  (field: INotSupportField, state?: IReduxState, newInstance?: boolean): NotSupportField;
  (field: IField, state?: IReduxState, newInstance?: boolean): Field;
}

export interface IBindFieldContext {
  (field: ISingleSelectField, state: IReduxState): SingleSelectField;
  (field: IMultiSelectField, state: IReduxState): MultiSelectField;
  (field: INumberField, state: IReduxState): NumberField;
  (field: ICurrencyField, state: IReduxState): CurrencyField;
  (field: IPercentField, state: IReduxState): PercentField;
  (field: ITextField, state: IReduxState): TextField;
  (field: IDateTimeField, state: IReduxState): DateTimeField;
  (field: IAttacheField, state: IReduxState): AttachmentField;
  (field: ILinkField, state: IReduxState): LinkField;
  (field: IURLField, state: IReduxState): URLField;
  (field: IEmailField, state: IReduxState): EmailField;
  (field: IRatingField, state: IReduxState): RatingField;
  (field: ICheckboxField, state: IReduxState): CheckboxField;
  (field: IPhoneField, state: IReduxState): PhoneField;
  (field: IFormulaField, state: IReduxState): FormulaField;
  (field: ILookUpField, state: IReduxState): LookUpField;
  (field: IMemberField, state: IReduxState): MemberField;
  (field: ISingleTextField, state: IReduxState): SingleTextField;
  (field: IAutoNumberField, state: IReduxState): AutoNumberField;
  (field: ICreatedTimeField, state: IReduxState): CreatedTimeField;
  (field: ILastModifiedTimeField, state: IReduxState): LastModifiedTimeField;
  (field: ICreatedByField, state: IReduxState): CreatedByField;
  (field: ILastModifiedByField, state: IReduxState): LastModifiedByField;
  (field: IDeniedField, state: IReduxState): DeniedField;
  (field: INotSupportField, state: IReduxState): NotSupportField;
  (field: IField, state: IReduxState): Field;
}

export type IAutomaticallyField = CreatedTimeField | LastModifiedTimeField | CreatedByField | LastModifiedByField;
export type IAutoIncreamentField = AutoNumberField;

export const getFieldClass = (type: FieldType) => {
  switch (type) {
    case FieldType.Text: {
      return TextField;
    }
    case FieldType.Number: {
      return NumberField;
    }
    case FieldType.Currency: {
      return CurrencyField;
    }
    case FieldType.Percent: {
      return PercentField;
    }
    case FieldType.AutoNumber: {
      return AutoNumberField;
    }
    case FieldType.SingleSelect: {
      return SingleSelectField;
    }
    case FieldType.MultiSelect: {
      return MultiSelectField;
    }
    case FieldType.DateTime: {
      return DateTimeField;
    }
    case FieldType.CreatedTime: {
      return CreatedTimeField;
    }
    case FieldType.LastModifiedTime: {
      return LastModifiedTimeField;
    }
    case FieldType.Attachment: {
      return AttachmentField;
    }
    case FieldType.Link: {
      return LinkField;
    }
    case FieldType.URL: {
      return URLField;
    }
    case FieldType.Email: {
      return EmailField;
    }
    case FieldType.Phone: {
      return PhoneField;
    }
    case FieldType.Rating: {
      return RatingField;
    }
    case FieldType.Checkbox: {
      return CheckboxField;
    }
    case FieldType.Member: {
      return MemberField;
    }
    case FieldType.CreatedBy: {
      return CreatedByField;
    }
    case FieldType.LastModifiedBy: {
      return LastModifiedByField;
    }
    case FieldType.LookUp: {
      return LookUpField;
    }
    case FieldType.Formula: {
      return FormulaField;
    }
    case FieldType.SingleText: {
      return SingleTextField;
    }
    case FieldType.DeniedField: {
      return DeniedField;
    }
    default: {
      return NotSupportField;
    }
  }
};

/**
 * 静态 store，用于给外部调用者(web端)注入。
 * web 端调用 Field 之间，先注入好 store 实例，则每次 bindModel 的时候不需要再次传入 store
 */
let storeCache: Store;
export const injectStore = (store: Store) => { storeCache = store; };

/**
 * 绑定 field model 数据，获得 field 计算方法实例。
 * 这里做了一次缓存。防止频繁调用时 new 实例造成的没必要的内存消耗。
 */
export const bindModel = (() => {
  const cache: { [key: number]: Field } = {};
  return (field: IField, inState?: IReduxState, newInstance?: boolean) => {
    if (!inState && !storeCache) {
      throw new Error('请传入 store 数据源');
    }
    const state = inState || storeCache.getState();
    // 强制初始化新的实例
    if (newInstance) {
      const FieldClass = getFieldClass(field.type);
      return new FieldClass(field as any, state);
    }

    if (cache[field.type]) {
      // 当实例已经存在的时候，只需要修改  this.field 属性就可以满足数据初始化需求。
      cache[field.type].field = field;
      cache[field.type].state = state;
      return cache[field.type];
    }

    const FieldClass = getFieldClass(field.type);
    const fieldInstance = new FieldClass(field as any, state);
    cache[field.type] = fieldInstance;
    return fieldInstance;
  };
})();

export const bindContext = (field: IField, state: IReduxState) => {
  const FieldClass = getFieldClass(field.type);
  return new FieldClass(field as any, state);
};

Field.bindModel = bindModel as IBindFieldModel;
// bindContext 与 bindModel 不同之处在于，bindContext 每次创建新的 Field 对象，并且强制要求传入 store。
Field.bindContext = bindContext as IBindFieldContext;
