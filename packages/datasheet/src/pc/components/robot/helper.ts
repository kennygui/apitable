import {
  ACTION_INPUT_PARSER_BASE_FUNCTIONS, ACTION_INPUT_PARSER_PASS_THROUGH_FUNCTIONS, ConfigConstant, Field, IField, IFieldPermissionMap, InputParser,
  integrateCdnHost, MagicVariableParser, Selectors, Strings, t
} from '@apitable/core';
import { createElement } from 'react';
import { isWecomFunc } from '../home/social_platform';
import {
  IActionType, IJsonSchema, INodeOutputSchema, INodeType, IRobotAction, IRobotBaseInfo, IRobotCardInfo, IRobotTrigger, ITriggerType
} from './interface';

/**
 * The client parses the expression without context, skipping dynamic parameters.
 */
export const operand2PureValue = (operand: any) => {
  const parser = new MagicVariableParser(ACTION_INPUT_PARSER_BASE_FUNCTIONS, ACTION_INPUT_PARSER_PASS_THROUGH_FUNCTIONS);
  const inputParser = new InputParser(parser);
  const res = inputParser.render(operand, {});
  return res;
};

export const getNodeTypeOptions = (nodeTypes: INodeType[]) => {
  return nodeTypes.map(nodeType => {
    return {
      value: 'triggerTypeId' in nodeType ? nodeType.triggerTypeId : nodeType.actionTypeId,
      label: nodeType.name,
      prefixIcon: createElement('img', {
        src: integrateCdnHost(nodeType.service.logo),
        style: {
          width: '16px',
          height: '16px',
        }
      }, null)
    };
  });
};

export const getNodeOutputSchemaList = (props: {
  actionList: IRobotAction[],
  trigger?: IRobotTrigger,
  triggerTypes: ITriggerType[],
  actionTypes: IActionType[]
}) => {
  const { actionList, triggerTypes, actionTypes, trigger } = props;
  const triggerType = trigger && triggerTypes.find(triggerType => triggerType.triggerTypeId === trigger?.triggerTypeId);
  const schemaList: INodeOutputSchema[] = [];
  if (triggerType) {
    schemaList.push({
      id: trigger?.triggerId!,
      title: triggerType.name,
      schema: triggerType.outputJsonSchema,
    });
  }
  actionList.forEach(action => {
    const actionType = actionTypes.find(actionType => actionType.actionTypeId === action.typeId);

    if (actionType) {
      schemaList.push({
        id: action.id,
        title: actionType.name,
        // TODO: After integration, remove the judgement here, the three actions that send IM messages do not have outputJsonSchema.
        schema: ['sendWecomMsg', 'sendLarkMsg', 'sendDingtalkMsg'].includes(actionType?.endpoint) ? undefined : actionType.outputJsonSchema
      });
    }
  });
  return schemaList;
};

export const makeRobotCardInfo = (robot: IRobotBaseInfo, triggerTypes: ITriggerType[], actionTypes: IActionType[]) => {
  const robotCardInfo: IRobotCardInfo = {
    robotId: robot.robotId,
    name: robot.name,
    description: robot.description,
    isActive: robot.isActive,
    nodeTypeList: []
  };
  robot.nodes.forEach((node, index) => {
    if (index === 0) {
      const triggerType = triggerTypes.find(triggerType => triggerType.triggerTypeId === node.triggerTypeId);
      if (triggerType) {
        robotCardInfo.nodeTypeList.push({
          nodeTypeId: node.triggerTypeId,
          service: triggerType.service
        });
      }
    } else {
      const actionType = actionTypes.find(actionType => actionType.actionTypeId === node.actionTypeId);
      if (actionType) {
        robotCardInfo.nodeTypeList.push({
          nodeTypeId: node.actionTypeId,
          service: actionType.service
        });
      }
    }
  });
  return robotCardInfo;
};

export const fields2Schema = (fields: IField[], fieldPermissionMap: IFieldPermissionMap): IJsonSchema => {
  // Extract all fields from fields and convert to json schema
  const fieldsSchema = {
    title: '列属性',
    type: 'object',
    properties: {}
  };
  const getFieldCommonSchema = (field: IField) => {
    const isCryptoField = Selectors.getFieldRoleByFieldId(fieldPermissionMap, field.id) === ConfigConstant.Role.None;
    return {
      title: isCryptoField ? t(Strings.robot_variables_cant_view_field) : field.name,
      disabled: isCryptoField
    };
  };
  fields.forEach(field => {
    const fieldOpenValueJsonSchema = Field.bindModel(field).openValueJsonSchema;
    fieldsSchema.properties[field.id] = {
      ...fieldOpenValueJsonSchema,
      ...getFieldCommonSchema(field),
    };
  });
  return fieldsSchema;
};

// TODO(kailang): Currently it is to pass the enterprise micro acceptance, the follow-up to change back
export const getFilterActionTypes = (actionTypes: IActionType[], ignoreActionId?: string) => {
  let tmpActionTypes = actionTypes;
  // Enterprise Web Browser blocks Feishu and Dingtalk
  if (isWecomFunc() && tmpActionTypes) {
    tmpActionTypes = tmpActionTypes.filter(ad =>
      !['sendLarkMsg', 'sendDingtalkMsg'].includes(ad.endpoint) || ad.actionTypeId === ignoreActionId
    );
  }
  return tmpActionTypes;
};
