import { readInstallationWidgets } from 'api/widget_api';
import { Events, Player } from 'player';
import { batchActions } from 'redux-batched-actions';
import { Selectors } from 'store';
import { RECEIVE_INSTALLATIONS_WIDGET, RESET_WIDGET } from 'store/action_constants';
import { IUnMountWidget, IWidget } from 'store/interface';

export const fetchWidgetsByWidgetIds = (
  widgetIds: string[],
  successCb?: (props: { responseBody: any; dispatch: any, getState: any }) => void
) => {
  return (dispatch, getState) => {
    // dispatch(setWidgetPanelLoading(true));
    const state = getState();
    const linkId = Selectors.getLinkId(state);

    readInstallationWidgets(widgetIds, linkId).then(res => {
      return Promise.resolve({ responseBody: res.data, dispatch, getState });
    }).catch(e => {
      // dispatch(setWidgetPanelLoading(false));
      Player.doTrigger(Events.app_error_logger, {
        error: new Error(`widgetMap request error ${widgetIds.join(',')}`),
        metaData: { widgetIds: widgetIds.join(',') },
      });
      throw e;
    }).then(props => {
      fetchInstallationWidgetSuccess(props);
      successCb?.(props);
    });
  };
};

export const receiveInstallationWidget = (widgetId: string, widget: IWidget) => {
  return {
    type: RECEIVE_INSTALLATIONS_WIDGET,
    payload: widget,
    widgetId: widgetId,
  };
};

export const fetchInstallationWidgetSuccess = ({ responseBody, dispatch }) => {
  const { data, success } = responseBody;
  // dispatch(setWidgetPanelLoading(false));
  if (success) {
    const _batchActions: any[] = [];

    for (const v of data) {
      _batchActions.push(
        receiveInstallationWidget(v.id, v)
      );
    }
    dispatch(
      batchActions(_batchActions)
    );
  } else {
    Player.doTrigger(Events.app_error_logger, {
      error: new Error('widgetMap error'),
      metaData: {},
    });
  }
};

export const resetWidget = (widgetIds: string[]): IUnMountWidget => {
  return {
    type: RESET_WIDGET,
    payload: widgetIds,
  };
};
