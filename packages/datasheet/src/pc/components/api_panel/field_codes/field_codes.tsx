import { Field, FieldType, Selectors, Strings, t } from '@vikadata/core';
// import { Field, FieldType, Selectors } from '@vikadata/core';
import classNames from 'classnames';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { getFieldDocs } from '../field_docs/api_panel_config';
import styles from './styles.module.less';
import { store } from 'pc/store';
import githubIcon from 'static/icon/common/github_octopus.png';
import { Loading } from 'pc/components/common';
import { LinkButton, ButtonGroup } from '@vikadata/components';
import dynamic from 'next/dynamic';

const DocInnerHtml = dynamic(() => import('./doc_inner_html'), {
  ssr: false,
  loading: () => <Loading className={styles.loading} />
});

export type IFieldValueBase = number | string | boolean | { [key: string]: any };

// 单元格 value 值类型
export type IFieldValue = IFieldValueBase | IFieldValueBase[] | null;

export type IFieldValueMap = { [fieldKey: string]: IFieldValue };

export interface IRecord {
  recordId: string;

  /**
   * record 中的数据
   * 只有当 record 某一列存在内容时，data 中才会有这一列的fieldId key
   */
  fields: IFieldValueMap;
}

export enum CodeType {
  Get,
  Delete,
  Add,
  Update,
  Upload,
}

export enum CodeLanguage {
  Curl,
  Js,
  Python,
}

interface IFieldCode {
  language: CodeLanguage;
  setLanguage: (lang: CodeLanguage) => void;
  token: string;
  codeType: CodeType;
  byFieldId?: boolean;
  showApiToken?: boolean;
}

enum RecordType {
  Response,
  Update,
  Add,
}

const API_BASE = 'https://api.vika.cn';
const MORE_SDK_URL = 'https://github.com/vikadata/awesome-vikadata';
const VARIABLE_REG = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
const INVALID_FIELD_NAME_TIPS = `
存在不符合变量规则的字段名，请开启「使用 FieldId」，否则下方的代码示例可能无法运行！[字段映射](https://github.com/vikadata/vika.py#字段映射)可以帮助你解决这个问题。
`;

export const FieldCode: React.FC<IFieldCode> = props => {
  const { codeType, byFieldId, token, language, setLanguage, showApiToken } = props;
  const datasheetId = useSelector(Selectors.getActiveDatasheetId)!;
  const viewId = useSelector(Selectors.getActiveView)!;
  const columns = useSelector(Selectors.getVisibleColumns)!;
  const fieldMap = useSelector(state => Selectors.getFieldMap(state, state.pageParams.datasheetId!))!;
  const rows = useSelector(state => Selectors.getVisibleRows(state))!;
  const snapshot = useSelector(Selectors.getSnapshot)!;
  // const uploadTip = codeType === CodeType.Upload ? t(Strings.api_upload_tip) : null;

  const getAttachmentFieldName = () => {
    const attachmentColumn = columns.find(field => fieldMap[field.fieldId].type === FieldType.Attachment);
    if (attachmentColumn) {
      const attachmentField = fieldMap[attachmentColumn.fieldId];
      return byFieldId ? attachmentField.id : attachmentField.name;
    }
    return '<附件字段>';
  };

  const getInvalidFieldNames = () => {
    const invalidFieldNames = columns.filter(field => !VARIABLE_REG.test(fieldMap[field.fieldId].name)).map(
      field => fieldMap[field.fieldId].name
    );
    return invalidFieldNames;
  };
  const hasInvalidFieldNames = () => {
    return Boolean(getInvalidFieldNames().length);
  };

  const getExampleRecords = (type: RecordType): Partial<IRecord>[] => {
    return rows.slice(0, 10).map(row => {
      const fields = {};
      columns.forEach(column => {
        const field = fieldMap[column.fieldId];
        const cellValue = Selectors.getCellValue(store.getState(), snapshot, row.recordId, field.id);
        const apiValue = Field.bindModel(field).cellValueToApiStandardValue(cellValue);
        if (apiValue != null) {
          switch (type) {
            case RecordType.Add:
            case RecordType.Update:
              // 字段可编辑时才能写入。
              if (Field.bindModel(field).recordEditable()) {
                // 空值不显示
                fields[byFieldId ? field.id : field.name] = apiValue;
              }
              break;
            default:
              fields[byFieldId ? field.id : field.name] = apiValue;
              break;
          }
        }
      });
      if (type === RecordType.Add) {
        return { fields };
      }
      return {
        recordId: row.recordId,
        fields,
      };
    }).filter(record => Object.keys(record.fields).length).slice(0, 2);
  };

  const exampleResponseRecords = getExampleRecords(RecordType.Response) as IRecord[];
  const exampleAddRecords = getExampleRecords(RecordType.Add) as IRecord[];
  const exampleUpdateRecords = getExampleRecords(RecordType.Update);
  const exampleDeleteRecords = exampleResponseRecords.map(r => r.recordId);

  const getExampleRecordKV = (isWriteMode?: boolean) => {
    const exampleRecords = isWriteMode ? exampleAddRecords : exampleResponseRecords;
    if (!exampleRecords.length) return {
      oneRecord: {
        recordId: 'null',
        fields: {},
      },
      oneFieldKey: 'null',
      oneFieldValue: 'null',
    };
    const oneRecord = exampleRecords[0];
    const oneFieldKey = Object.keys(oneRecord.fields)[0];
    const oneFieldValue = oneRecord.fields[oneFieldKey];

    return {
      oneRecord,
      oneFieldKey,
      oneFieldValue,
    };
  };
  // 组装查询条件
  const getSearchParams = (type?: 'get' | 'add' | 'update' | 'bulk_add') => {
    const { oneFieldKey, oneFieldValue, oneRecord } = getExampleRecordKV(true);

    switch (type) {
      case 'get':
        return `${oneFieldKey}=${JSON.stringify(oneFieldValue, null, 2)}`;
      case 'add':
        return JSON.stringify(exampleAddRecords[0]?.fields, null, 2);
      case 'bulk_add':
        return JSON.stringify(exampleAddRecords.map(record => record.fields), null, 2);
      case 'update':
        return JSON.stringify(oneRecord.fields, null, 2);
      default:
        return '';
    }
  };

  const recordsWithResBody = (records: IRecord[], withPagination?: boolean) => {
    let data: any = { records };
    if (withPagination) {
      data = {
        total: rows.length,
        pageNum: 1,
        pageSize: rows.length > 100 ? 100 : rows.length,
        records,
      };
    }
    return {
      code: 200,
      success: true,
      message: '请求成功',
      data: data,
    };
  };

  const getExampleConfig = () => {
    const commonContext = {
      apiToken: token,
      githubIcon: githubIcon,
      datasheetId,
      res: '',
      tips: '',
      fieldKey: byFieldId ? 'id' : 'name',
      apiBase: window.location.origin.includes('vika.cn') ? API_BASE : window.location.origin,
      viewId,
      pyGetParams: getSearchParams('get'),
      fieldNameTips: !byFieldId && hasInvalidFieldNames() ? INVALID_FIELD_NAME_TIPS : '',
    };

    switch (codeType) {
      case CodeType.Get: {
        return {
          ...commonContext,
          method: 'GET',
          response: JSON.stringify(recordsWithResBody(exampleResponseRecords, true), null, 2),
        };
      }

      case CodeType.Add: {
        return {
          ...commonContext,
          method: 'POST',
          records: JSON.stringify(exampleAddRecords, null, 2),
          response: JSON.stringify(recordsWithResBody(exampleResponseRecords), null, 2),
          addParams: getSearchParams('add'),
          bulkAddParams: getSearchParams('bulk_add'),
          exampleRecords: exampleAddRecords,
        };
      }
      case CodeType.Update: {
        const { oneFieldKey, oneFieldValue } = getExampleRecordKV();
        return {
          ...commonContext,
          method: 'PATCH',
          records: JSON.stringify(exampleUpdateRecords, null, 2),
          response: JSON.stringify(recordsWithResBody(exampleResponseRecords), null, 2),
          updateParams: getSearchParams('update'),
          oneFieldKey,
          oneFieldValue: JSON.stringify(oneFieldValue, null, 2),
          oneRecordId: exampleUpdateRecords[0] ? exampleUpdateRecords[0].recordId : null,
          exampleRecords: exampleUpdateRecords,
        };
      }
      case CodeType.Delete: {
        return {
          ...commonContext,
          method: 'DELETE',
          recordIds: JSON.stringify(exampleDeleteRecords, null, 2),
          response: true,
          deleteParams: exampleDeleteRecords.map(recordId => `recordIds=${recordId}`).join('&'),
          exampleRecords: exampleDeleteRecords,
        };
      }
      case CodeType.Upload:
      default: {
        const defaultExampleId = getFieldDocs(FieldType.Attachment).defaultExampleId;
        return {
          ...commonContext,
          method: 'UPLOAD',
          data: '{你的 文件路径}',
          response: JSON.parse(defaultExampleId ? t(Strings[defaultExampleId]) : '{}'),
          attachFieldName: getAttachmentFieldName(),
        };
      }
    }
  };

  const exampleConfig = getExampleConfig();
  return (
    <div className={styles.fieldCodes}>
      <ButtonGroup className={styles.radioGroup}>
        <LinkButton
          underline={false}
          component="button"
          className={classNames({ [styles.radioActive]: CodeLanguage.Curl === language })}
          onClick={() => setLanguage(CodeLanguage.Curl)}
        >
          cURL
        </LinkButton>
        <LinkButton
          underline={false}
          component="button"
          className={classNames({ [styles.radioActive]: CodeLanguage.Js === language })}
          onClick={() => setLanguage(CodeLanguage.Js)}
        >
          JavaScript
        </LinkButton>
        <LinkButton
          underline={false}
          component="button"
          className={classNames({ [styles.radioActive]: CodeLanguage.Python === language })}
          onClick={() => setLanguage(CodeLanguage.Python)}
        >
          Python
        </LinkButton>
        <LinkButton
          underline={false}
          component="button"
          onClick={() => {
            window.open(MORE_SDK_URL, '_blank');
          }}
        >
          More
        </LinkButton>
      </ButtonGroup>
      <DocInnerHtml showApiToken={showApiToken} exampleConfig={exampleConfig} language={language} />
    </div>
  );
};
