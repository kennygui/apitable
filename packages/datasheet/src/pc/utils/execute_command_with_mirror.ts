import { store } from 'pc/store';
import { Events, isPrivateDeployment, ITemporaryView, IViewProperty, Player, Selectors, StoreActions, ViewPropertyFilter } from '@apitable/core';
import { showViewManualSaveInMobile } from 'pc/components/tab_bar/view_sync_switch/show_view_manual_save_in_mobile';
import { browser } from 'pc/common/browser';
import { ShowViewManualSaveAlert } from 'pc/components/tab_bar/view_sync_switch/show_view_manual_save_alert';
import { has, isEqual } from 'lodash';

export const executeCommandWithMirror = (commandFunc: Function, viewProperty: Partial<IViewProperty>, cb?: () => void) => {
  const state = store.getState();
  const { mirrorId, viewId, datasheetId } = state.pageParams;
  const { editable } = Selectors.getPermissions(state, datasheetId);

  if (!mirrorId) {
    const snapshot = Selectors.getSnapshot(state)!;
    const view = Selectors.getCurrentViewBase(snapshot, viewId, datasheetId);
    if ((!state.labs.includes('view_manual_save') && !state.share.featureViewManualSave) || Boolean(view?.autoSave)) {
      return commandFunc();
    }

    if (browser.is('mobile')) {
      showViewManualSaveInMobile();
    } else {
      Player.doTrigger(Events.view_notice_view_auto_false);
      // If you have not triggered the newbie guide for view configuration without collaboration, no save prompt will pop up after the operation
      (isPrivateDeployment() || state.user.info?.wizards.hasOwnProperty(51)) && editable && ShowViewManualSaveAlert();
    }
    store.dispatch(StoreActions.activeOperateViewId(viewId!, datasheetId!));
    return commandFunc();
  }

  const mirror = Selectors.getMirror(state, mirrorId)!;

  if (mirror.temporaryView) {
    // Mirror manual date changes, e.g. 2022/02/16 to 2022/02/1 will result in duplicate dispatch, 
    // determine if there are no values to update without dispatch
    if (has(viewProperty, 'filterInfo') && isEqual(mirror.temporaryView.filterInfo, viewProperty.filterInfo)) {
      return;
    }
    store.dispatch(StoreActions.cacheTemporaryView(viewProperty, mirrorId));
    return cb && cb();
  }

  const snapshot = Selectors.getSnapshot(state, mirror?.sourceInfo.datasheetId)!;
  const view = Selectors.getViewById(snapshot, mirror?.sourceInfo.viewId)!;
  const _view: ITemporaryView = {};

  for (const [key, value] of Object.entries(view)) {
    if ([...ViewPropertyFilter.ignoreViewProperty, 'autoSave'].includes(key)) {
      continue;
    }
    _view[key] = value;
  }

  store.dispatch(StoreActions.cacheTemporaryView({ ..._view, ...viewProperty }, mirrorId));

  return cb && cb();
};
