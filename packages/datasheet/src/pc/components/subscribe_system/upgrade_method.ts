import { Settings } from '@apitable/core';
import { IDingTalkModalType, showModalInDingTalk, showModalInFeiShu, showModalInWecom } from 'pc/components/economy/upgrade_modal';
import { navigationToUrl } from 'pc/components/route_manager/navigation_to_url';
import { showOrderContactUs } from 'pc/components/subscribe_system/order_modal/pay_order_success';
import { store } from 'pc/store';

export const goToUpgrade = () => {
  const state = store.getState();
  const spaceInfo = state.space.curSpaceInfo;
  const spaceId = state.space.activeId;
  const subscription = state.billing.subscription;
  const social = spaceInfo?.social;
  const user = state.user.info;

  if (social?.appType == null && subscription?.product !== 'Bronze') {
    window.open(`/space/${spaceId}/upgrade?pageType=2`, '_blank', 'noopener,noreferrer');
    return;
  }

  // Self-built applications - Contact Customer Service
  if (social?.appType === 1) {
    return showOrderContactUs();
  }

  // Third-party applications
  if (social?.appType === 2 && social.enabled) {
    // Wecom
    if (social.platform === 1) {
      return showModalInWecom();
    }
    // Dingtalk
    if (social.platform === 2) {
      showModalInDingTalk(IDingTalkModalType.Upgrade);
      return;
    }
    // Feishu
    if (social.platform === 3) {
      if (user?.isAdmin) {
        return navigationToUrl(Settings.feishu_upgrade_url.value);
      }
      return showModalInFeiShu();
    }
  }
  window.open(`/space/${spaceId}/upgrade`, '_blank', 'noopener,noreferrer');
};
