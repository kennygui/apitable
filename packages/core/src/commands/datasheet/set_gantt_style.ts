import { CollaCommandName } from 'commands';
import { ExecuteResult, ICollaCommandDef } from 'command_manager';
import { IJOTAction } from 'engine';
import { Strings, t } from 'i18n';
import { GanttView } from 'model';
import { ISetGanttStyle } from 'store';
import { getActiveDatasheetId, getDatasheet } from 'store/selector';
import { ResourceType } from 'types';

export type ISetGanttStyleOptions = {
  cmd: CollaCommandName.SetGanttStyle;
  viewId: string;
  data: ISetGanttStyle[];
};

export const setGanttStyle: ICollaCommandDef<ISetGanttStyleOptions> = {
  undoable: true,

  execute: (context, options) => {
    const { model: state } = context;
    const { viewId } = options;
    const datasheetId = getActiveDatasheetId(state)!;
    const datasheet = getDatasheet(state, datasheetId);
    if (!state || !datasheet) {
      return null;
    }

    // 判断当前操作的view是否是激活的view
    if (datasheet.activeView !== viewId) {
      throw new Error(t(Strings.error_modify_column_failed_wrong_target_view));
    }

    const actions: IJOTAction[] = [];
    const setGanttStyleAction = GanttView.setGanttStyle2Action(datasheet.snapshot, options);
    setGanttStyleAction && actions.push(...setGanttStyleAction);
    if (actions.length === 0) {
      return null;
    }
    return {
      result: ExecuteResult.Success,
      resourceId: datasheetId,
      resourceType: ResourceType.Datasheet,
      actions,
    };
  },
};

