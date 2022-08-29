import { Strings, t } from 'i18n';
import { ViewType } from 'store/constants';
import { IGridViewProperty, ISnapshot, IViewColumn, IViewProperty } from '../../store/interface';
import { getViewById } from '../../store/selector';
import { DatasheetActions } from '../datasheet';
import { View } from './views';
import { Settings } from 'config';
import { integrateCdnHost } from 'utils';

export class GridView extends View {
  get recordShowName() {
    return t(Strings.row);
  }

  get recordShowUnit() {
    return '';
  }

  static generateDefaultProperty(snapshot: ISnapshot, activeViewId: string | null | undefined): IGridViewProperty {
    const views = snapshot.meta.views;
    let srcView: IViewProperty | undefined;
    if (activeViewId) {
      srcView = getViewById(snapshot, activeViewId);
    }

    if (!srcView) {
      srcView = views[0];
    }
    let columns: IViewColumn[];

    if (srcView) {
      if (srcView.type === ViewType.Grid) {
        columns = srcView.columns.map(item => {
          return { fieldId: item.fieldId, width: item.width };
        });
      } else {
        columns = (srcView.columns as any).map(item => {
          return { fieldId: item.fieldId };
        });
      }
    } else {
      throw Error(t(Strings.error_not_found_the_source_of_view));
    }

    return {
      id: DatasheetActions.getNewViewId(views),
      name: DatasheetActions.getDefaultViewName(views, ViewType.Grid),
      type: ViewType.Grid,
      rowHeightLevel: 1,
      columns,
      rows: this.defaultRows(srcView),
      frozenColumnCount: 1,
    };
  }

  static getViewIntroduce() {
    return {
      title: t(Strings.grid_view),
      desc: t(Strings.grid_guide_desc),
      videoGuide: integrateCdnHost(Settings.grid_guide_video.value),
    };
  }
}
