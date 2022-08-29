import get from 'lodash/get';
import { GanttRowHeight, NotSupportFieldInstance, PREVIEW_DATASHEET_ID, RowHeightLevel } from 'store/constants';
import { IFieldPermissionMap, INetworking, INodeDescription, IReduxState, ISnapshot, Role } from 'store/interface';
import { gridViewActiveFieldStateDefault, gridViewDragStateDefault } from 'store/reducers/resource';

export const getDatasheetPrimaryField = (snapshot: ISnapshot) => {
  const firstView = snapshot.meta.views[0];
  const firstColumn = firstView.columns[0];
  const fieldMap = snapshot.meta.fieldMap;
  return fieldMap[firstColumn.fieldId];
};

// 获取一个数表pack，一个数表pack包含数表的状态信息（loading等）、基本快照数据以及经过计算后的计算信息
export const getDatasheetPack = (state: IReduxState, id?: string) => {
  const datasheetId = id || state.pageParams.datasheetId;
  if (!datasheetId) {
    return;
  }
  // 没有指定数表id 并且有时光机预览数据时先取预览数据用于渲染
  if (!id && state.datasheetMap[PREVIEW_DATASHEET_ID]) {
    return state.datasheetMap[PREVIEW_DATASHEET_ID];
  }

  return state.datasheetMap[datasheetId];
};

// 获取数表的快照信息
export const getDatasheet = (state: IReduxState, id?: string) => {
  const datasheetPack = getDatasheetPack(state, id);
  return datasheetPack && datasheetPack.datasheet;
};

export const getRecordHistoryStatus = (state: IReduxState, id?: string): boolean => {
  const datasheetId = id || state.pageParams.datasheetId;
  if (!datasheetId) {
    return false;
  }

  return get(state, `datasheetMap.${datasheetId}.datasheet.extra.showRecordHistory`, false);
};

export const getDatasheetRole = (state: IReduxState, id?: string): string | undefined => {
  const datasheetId = id || state.pageParams.datasheetId;
  if (!datasheetId) {
    return;
  }

  return get(state, `datasheetMap.${datasheetId}.datasheet.role`);
};

export const getDatasheetNetworking = (state: IReduxState, id?: string): INetworking | undefined => {
  const datasheetPack = getDatasheetPack(state, id);
  if (!datasheetPack) {
    return;
  }
  return {
    loading: datasheetPack.loading,
    connected: datasheetPack.connected,
    syncing: datasheetPack.syncing,
    errorCode: datasheetPack.errorCode,
  };
};

export const getDatasheetLoading = (state: IReduxState, id?: string) => {
  return getDatasheetNetworking(state, id)?.loading;
};

export const getDatasheetErrorCode = (state: IReduxState, id?: string) => {
  return getDatasheetNetworking(state, id)?.errorCode;
};

export const getDatasheetConnected = (state: IReduxState, id?: string) => {
  return getDatasheetNetworking(state, id)?.connected;
};

export const getDatasheetClient = (state: IReduxState, id?: string) => {
  const datasheetPack = getDatasheetPack(state, id);
  return datasheetPack?.client;
};

export const getSnapshot = (state: IReduxState, id?: string) => {
  const datasheet = getDatasheet(state, id);
  return datasheet?.snapshot;
};

export const getActiveDatasheetId = (state: IReduxState) => {
  return state.pageParams.datasheetId;
};

export const getHighlightFieldId = (state: IReduxState, id?: string) => {
  const datasheetPack = getDatasheetPack(state, id);
  return datasheetPack?.client?.highlightFiledId;
};

// 获取当前数表设置的列权限信息
export const getFieldPermissionMap = (state: IReduxState, id?: string) => {
  const datasheetPack = getDatasheetPack(state, id);
  return datasheetPack?.fieldPermissionMap;
};

export const getFieldRoleByFieldId = (fieldPermissionMap: IFieldPermissionMap | undefined, fieldId: string): null | Role => {
  if (!fieldPermissionMap || !fieldPermissionMap[fieldId]) {
    return null;
  }
  const role = fieldPermissionMap[fieldId].role;
  return role || Role.None;
};

export const getFormSheetAccessibleByFieldId = (fieldPermissionMap: IFieldPermissionMap | undefined, fieldId: string) => {
  if (!fieldPermissionMap || !fieldPermissionMap[fieldId]) {
    return true;
  }
  return fieldPermissionMap[fieldId].setting.formSheetAccessible;
};

export const getSearchKeyword = (state: IReduxState, dstId?: string): string | undefined => {
  const dstClient = getDatasheetClient(state, dstId);
  return dstClient?.searchKeyword;
};

export const getActiveRowInfo = (state: IReduxState, dstId?: string) => {
  const dstClient = getDatasheetClient(state, dstId);
  return dstClient?.activeRowInfo;
};

export const getIsSearching = (state: IReduxState, dstId?: string): boolean => {
  const dstClient = getDatasheetClient(state, dstId);
  return Boolean(dstClient?.searchKeyword);
};

export const getActiveCell = (state: IReduxState, datasheetId?: string) => {
  const client = getDatasheetClient(state, datasheetId);
  const activeCell = client && client.selection && client.selection.activeCell;
  return activeCell ? activeCell : null;
};

export const getActiveRecordId = (state: IReduxState) => {
  const activeCell = getActiveCell(state);
  return activeCell?.recordId;
};

export const getSearchResultCursorIndex = (state: IReduxState, dstId?: string): number | undefined => {
  const dstClient = getDatasheetClient(state, dstId);
  return dstClient?.searchResultCursorIndex;
};

export const getGridViewDragState = (state: IReduxState, id?: string) => {
  const client = getDatasheetClient(state, id);
  return client ? client.gridViewDragState : gridViewDragStateDefault;
};

export const getGridViewHoverFieldId = (state: IReduxState, id?: string) => {
  const client = getDatasheetClient(state, id);
  return client ? client.gridViewHoverFieldId : null;
};

export const gridViewActiveFieldState = (state: IReduxState, id?: string) => {
  const client = getDatasheetClient(state, id);
  return client ? client.gridViewActiveFieldState : gridViewActiveFieldStateDefault;
};

export const getGroupingCollapseIds = (state: IReduxState) => {
  const client = getDatasheetClient(state);
  return client && client.groupingCollapseIds;
};

export const getKanbanGroupCollapse = (state: IReduxState) => {
  const client = getDatasheetClient(state);
  if (!client || !client.kanbanGroupCollapse) {
    return [];
  }
  return client.kanbanGroupCollapse;
};

export const getEditingCell = (state: IReduxState) => {
  const client = getDatasheetClient(state);
  if (!client || !client.isEditingCell) {
    return null;
  }
  return client.isEditingCell;
};

export const getNodeDesc = (state: IReduxState, dsId?: string): null | INodeDescription => {
  const datasheet = getDatasheet(state, dsId);
  if (!datasheet || !datasheet.description) {
    return null;
  }
  return JSON.parse(datasheet.description);
};

export const getRecord = (state: IReduxState, recordId: string, datasheetId?: string) => {
  const snapshot = getSnapshot(state, datasheetId)!;
  return snapshot.recordMap[recordId];
};

export const getField = (state: IReduxState, fieldId: string, datasheetId?: string) => {
  const snapshot = getSnapshot(state, datasheetId);
  if (!snapshot) {
    return NotSupportFieldInstance;
  }
  return snapshot.meta.fieldMap[fieldId] || NotSupportFieldInstance;
};

export const getViewsList = (state: IReduxState, dsId?: string) => {
  const snapshot = getSnapshot(state, dsId)!;
  return snapshot.meta.views;
};

export const getNodeId = (state: IReduxState) => {
  const { datasheetId, folderId, formId, dashboardId, mirrorId } = state.pageParams;
  // mirror 比较特殊，url 会同时存在 mirrorId 和 datasheetId，因此 mirrorId 需要提前判断
  if (mirrorId) {
    return mirrorId;
  }
  if (datasheetId) {
    return datasheetId;
  }
  if (folderId) {
    return folderId;
  }
  if (formId) {
    return formId;
  }
  if (dashboardId) {
    return dashboardId;
  }
  return '';
};

export const getToolbarMenuCardState = (state: IReduxState) => {
  return state.toolbar.menuCardState;
};

export const getLinkId = (state: IReduxState) => {
  const pageParams = state.pageParams;
  return pageParams.templateId || pageParams.shareId;
};

export const allowShowCommentPane = (state: IReduxState) => {
  const spaceId = state.space.activeId;
  const linkId = getLinkId(state);
  return Boolean(spaceId && !linkId);
};

export const getDatasheetParentId = (state: IReduxState, id?: string) => {
  const tree = state.catalogTree.treeNodesMap;
  const datasheet = getDatasheet(state, id);
  if (!datasheet) {
    return;
  }
  return tree[datasheet.id]?.parentId || datasheet.parentId;
};

export const getWidgetPanels = (state: IReduxState, datasheetId?: string) => {
  const snapshot = getSnapshot(state, datasheetId);
  return snapshot && snapshot.meta.widgetPanels;
};

export const getWidgetPanelStatus = (state: IReduxState, datasheetId?: string) => {
  const client = getDatasheetClient(state, datasheetId);
  return client?.widgetPanelStatus;
};

export const getGanttRowHeightFromLevel = (level?: RowHeightLevel): number => {
  return level == null ? GanttRowHeight.Short : GanttRowHeight[RowHeightLevel[level]];
};

export const getGanttViewStatus = (state: IReduxState, datasheetId?: string) => {
  const client = getDatasheetClient(state, datasheetId);
  return client?.ganttViewStatus;
};

export const getGanttSettingPanelVisible = (state: IReduxState, datasheetId?: string) => {
  const ganttViewStatus = getGanttViewStatus(state, datasheetId)!;
  return ganttViewStatus.settingPanelVisible;
};

export const getActiveViewId = (state: IReduxState, dsId?: string) => {
  return getDatasheet(state, dsId)?.activeView;
};

export const getCloseSyncViewIds = (state: IReduxState, dsId: string) => {
  const client = getDatasheetClient(state, dsId);
  return client?.closeSyncViewIds;
};
