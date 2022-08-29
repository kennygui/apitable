import { useThemeColors } from '@vikadata/components';
import { Events, IReduxState, NAV_ID, Player, Settings, StoreActions, Strings, t } from '@vikadata/core';
import { ManageOutlined } from '@vikadata/icons';
import { useToggle } from 'ahooks';
import { Badge } from 'antd';
import classNames from 'classnames';
import { AnimationItem } from 'lottie-web/index';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Avatar, AvatarSize, AvatarType, Message, Tooltip } from 'pc/components/common';
import {
  IDingTalkModalType, showModalInDingTalk, showModalInFeiShu, showModalInWecom, UpgradeInDDContent, UpgradeInFeiShuContent, UpgradeInWecomContent
} from 'pc/components/economy/upgrade_modal';
import { inSocialApp, isSocialDingTalk, isSocialFeiShu, isSocialWecom } from 'pc/components/home/social_platform';
import { Notification } from 'pc/components/notification';
import { useNotificationRequest, useRequest, useResponsive } from 'pc/hooks';
import { isMobileApp } from 'pc/utils/env';
import * as React from 'react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import HomeDown from 'static/icon/common/common_icon_pulldown_line.svg';
import NotificationIcon from 'static/icon/datasheet/datasheet_icon_notification.svg';
import AddressIcon from 'static/icon/workbench/workbench_tab_icon_address_normal.svg';
import TemplateIcon from 'static/icon/workbench/workbench_tab_icon_template_normal.svg';
import WorkplaceIcon from 'static/icon/workbench/workbench_tab_icon_workingtable_normal.svg';
import AnimationJson from 'static/json/notification_new.json';
import { ComponentDisplay, ScreenSize } from '../common/component_display/component_display';
import { Popup } from '../common/mobile/popup';
import { openEruda } from '../development/dev_tools_panel';
import { navigationToUrl } from '../route_manager/use_navigation';
import { CreateSpaceModal } from './create_space_modal';
import { Help } from './help';
import { NavigationContext } from './navigation_context';
import { SpaceListDrawer } from './space_list_drawer';
import styles from './style.module.less';
import { UpgradeBtn } from './upgrade_btn';
// import { NavigationItem } from './navigation_item';
import { User } from './user';

enum NavKey {
  SpaceManagement = 'management',
  Org = 'org',
  Workbench = 'workbench',
  Template = 'template',
}

export const Navigation: FC = () => {
  const colors = useThemeColors();
  /* 是否显示空间列表抽屉  */
  const [spaceListDrawerVisible, { toggle: toggleSpaceListDrawerVisible, set: setSpaceListDrawerVisible }] = useToggle(false);
  /* 是否打开创建空间模态框 */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [notice, { toggle: toggleNotice, set: setNotice }] = useToggle(false);
  const [upgradePopup, { set: setUpgradePopup }] = useToggle(false);
  const dispatch = useDispatch();
  const { user, space, unReadCount, newNoticeListFromWs } = useSelector((state: IReduxState) => ({
    user: state.user.info,
    space: state.space.curSpaceInfo,
    unReadCount: state.notification.unReadCount,
    newNoticeListFromWs: state.notification.newNoticeListFromWs,
    spaceInfo: state.space.curSpaceInfo,
  }), shallowEqual);
  const { notificationStatistics, getNotificationList } = useNotificationRequest();
  // const location = useLocation();
  const router = useRouter();
  const search = location.search;
  const [unReadMsgCount, setUnReadMsgCount] = useState(0);
  const [noticeIcon, { set: setNoticeIcon }] = useToggle(true);
  const lottieAnimate = useRef<AnimationItem>();
  const { screenIsAtMost } = useResponsive();
  const isMobile = screenIsAtMost(ScreenSize.md);
  const [clickCount, setClickCount] = useState(0);

  // 请求消息总数
  useRequest(notificationStatistics);
  // 查看是否有系统横幅通知需要显示
  useRequest(getNotificationList);

  // 监听ws推送过来的消息，改变图标上的数量显示
  useEffect(() => {
    if (notice) {
      return;
    }
    if (newNoticeListFromWs.length === 0) {
      setUnReadMsgCount(unReadCount);
    } else {
      setUnReadMsgCount(unReadCount + newNoticeListFromWs.length);
      if (!window.location.pathname.includes('notify')) {
        renderLottie();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newNoticeListFromWs, unReadCount]);

  useEffect(() => {
    if (notice) {
      setUnReadMsgCount(0);
    }
  }, [notice]);

  useEffect(() => {
    if (clickCount >= 5 && clickCount < 10) {
      Message.info({ content: t(Strings.dev_tools_opening_tip, { count: 10 - clickCount }) });
    }
    if (clickCount === 10) {
      openEruda();
    }
  }, [clickCount]);

  useEffect(() => {
    setClickCount(0);
  }, []);

  const destroyLottie = useCallback(() => {
    setNoticeIcon(true);
    if (lottieAnimate.current) {
      lottieAnimate.current.destroy();
    }
  }, [setNoticeIcon]);
  const renderLottie = () => {
    const noticeEle = document.querySelector('#' + NAV_ID.ICON_NOTIFICATION)!;
    if (!isMobile && noticeEle && !noticeEle.hasChildNodes()) {
      import('lottie-web/build/player/lottie_svg').then(module => {
        const lottie = module.default;
        lottieAnimate.current = lottie.loadAnimation({
          container: noticeEle,
          renderer: 'svg',
          loop: 2,
          autoplay: true,
          animationData: AnimationJson,
        });
        lottieAnimate.current.addEventListener('DOMLoaded', () => {
          setNoticeIcon(false);
        });
        lottieAnimate.current.addEventListener('complete', destroyLottie);
      });
    }
  };

  const lastTime = useRef(Date.now());

  const throttleClickCount = () => {
    const now = Date.now();
    if (now - lastTime.current < 1000) {
      setClickCount(clickCount + 1);
    }
    lastTime.current = now;
  };

  const hiddenUserMenu = () => {
    throttleClickCount();
    showUserMenu && setShowUserMenu(false);
    notice && setNotice(false);
    showHelpCenter && setShowHelpCenter(false);
  };

  // 打开空间菜单
  const openSpaceMenu = () => {
    hiddenUserMenu();
    toggleSpaceListDrawerVisible();
  };
  // 点击通知图标
  const noticeIconClick = useCallback(() => {
    isMobile && toggleNotice();
    dispatch(StoreActions.getNewMsgFromWsAndLook(false));
    destroyLottie();
  }, [destroyLottie, dispatch, isMobile, toggleNotice]);
  const navList = Player.applyFilters(Events.get_nav_list, [
    {
      routeAddress: '/workbench' + search,
      icon: WorkplaceIcon,
      text: t(Strings.nav_workbench), // '工作台',
      key: NavKey.Workbench,
      domId: NAV_ID.ICON_WORKBENCH,
    }, {
      routeAddress: '/org' + search,
      icon: AddressIcon,
      text: t(Strings.nav_team), // '通讯录',
      key: NavKey.Org,
      domId: NAV_ID.ICON_ADDRESS,
    }, {
      routeAddress: '/template' + search,
      icon: TemplateIcon,
      // icon: <NavigationItem animationData={TemplateAnimationJSON} style={{ width: '24px', height: '24px' }} />,
      text: t(Strings.nav_templates), // '模板',
      key: NavKey.Template,
      domId: NAV_ID.ICON_TEMPLATE,
    }, {
      routeAddress: '/management' + search,
      icon: ManageOutlined,
      text: t(Strings.nav_space_settings), // '空间管理',
      key: NavKey.SpaceManagement,
      domId: NAV_ID.ICON_SPACE_MANAGE,
    },
  ]);

  const NotificationNav = React.useMemo((): React.ReactElement => {
    const dom = (
      <Badge
        count={unReadMsgCount}
        overflowCount={99}
        className={classNames(styles.notificationIcon, {
          [styles.navActiveItem]: notice,
        })}
      >
        <NotificationIcon className={classNames(styles.notice, styles.navIcon)} style={{ visibility: noticeIcon ? 'visible' : 'hidden' }} />
      </Badge>
    );
    return (
      <>
        <ComponentDisplay minWidthCompatible={ScreenSize.md}>
          <Link
            href={'/notify' + search}
            onClick={noticeIconClick}
          >
            <a
              className={classNames(
                styles.notificationNavLink,
                {
                  [styles.navActiveItem]: router.pathname.includes('notify')
                }
              )}
            >
              {dom}
            </a>
          </Link>
        </ComponentDisplay>
        <ComponentDisplay maxWidthCompatible={ScreenSize.md}>
          <div
            onClick={noticeIconClick}
            className={styles.notificationNavLink}
          >
            {dom}
          </div>
        </ComponentDisplay>
      </>
    );
  }, [notice, noticeIcon, unReadMsgCount, noticeIconClick, search, router.pathname]);

  const onNoticeClose = () => {
    setNotice(false);
    setUnReadMsgCount(0);
  };

  const templateActive = window.location.pathname.includes('template');

  const isDingTalkSpace = isSocialDingTalk(space);
  const isFeiShuSpace = isSocialFeiShu(space);
  const isWecomSpace = isSocialWecom(space);

  const handleClickUpgradeBtn = () => {
    //  钉钉：点击左侧升级按钮。弹出升级弹窗（移动端和PC端用的弹窗组件不同）。点击弹窗跳转到应用详情页面（让用户去支付）
    if (isDingTalkSpace) {
      isMobile ? setUpgradePopup(true) : showModalInDingTalk(IDingTalkModalType.Upgrade);
    }
    //  飞书：
    //    移动端：点击左侧升级按钮，弹窗提示：”到 PC 端购买“
    //    PC 端：
    //      管理员：直接打开应用详情页（让用户支付）
    //      非管理员：弹窗提示：“去找管理员”
    else if (isFeiShuSpace) {
      if (isMobile) {
        setUpgradePopup(true);
      } else {
        if (user?.isAdmin) {
          navigationToUrl(Settings.feishu_upgrade_url.value);
        } else {
          showModalInFeiShu();
        }
      }
    } else if (isWecomSpace) {
      isMobile ? setUpgradePopup(true) : showModalInWecom();
    }
  };

  if (!user) {
    return <></>;
  }
  return (
    <NavigationContext.Provider
      value={{
        openCreateSpaceModal: () => setShowCreateModal(true),
        closeSpaceListDrawer: () => setSpaceListDrawerVisible(false),
      }}
    >
      <div
        className={classNames(styles.navigation,
          templateActive && styles.templateActived, notice && styles.noticeOpend)
        }
      >
        <div className={styles.spaceLogo} onClick={openSpaceMenu} data-sensors-click>
          <div
            className={styles.spaceImg}
          >
            <Avatar
              type={AvatarType.Space}
              title={user!.spaceName}
              id={user!.spaceId}
              src={user!.spaceLogo}
              size={AvatarSize.Size32}
            />
          </div>
          <div
            className={styles.spaceDown}
          >
            <Tooltip
              title={t(Strings.workspace_list)}
              placement="bottom"
            >
              <div><HomeDown className={styles.spaceIcon} /></div>
            </Tooltip>
          </div>
        </div>
        <div className={styles.navWrapper} onClick={hiddenUserMenu}>
          {navList.map(item => {
            if (user && !user!.isAdmin && item.key === NavKey.SpaceManagement) {
              return null;
            }
            if (user && user.isDelSpace && item.key !== NavKey.SpaceManagement) {
              return null;
            }

            let NavIcon = item.icon;
            if (typeof item.icon === 'string') {
              NavIcon = WorkplaceIcon;
            }
            const isActive = router.pathname.includes(item.key);
            const NavItem = (): React.ReactElement => (
              <Link
                href={item.routeAddress}
              >
                <a
                  id={item.domId}
                  className={classNames(styles.navItem, {
                    [styles.navActiveItem]: isActive,
                    [styles.templateActiveItem]: router.pathname.includes('template') && item.routeAddress.includes('template')
                  })}
                >
                  <NavIcon className={styles.navIcon} />
                </a>
                {/* {item.icon} */}
              </Link>
            );

            return (
              <div key={item.key}>
                <Tooltip
                  title={item.text}
                  placement="right"
                >
                  <span>{NavItem()}</span>
                </Tooltip>
              </div>
            );
          })}
          {(isDingTalkSpace || isFeiShuSpace || isWecomSpace) && <UpgradeBtn onClick={() => handleClickUpgradeBtn()} />}
          <ComponentDisplay maxWidthCompatible={ScreenSize.md}>
            <Popup
              title={t(Strings.upgrade_guide)}
              visible={upgradePopup}
              onClose={() => setUpgradePopup(false)}
              height={'500'}
              style={{ backgroundColor: colors.defaultBg }}
            >
              {isDingTalkSpace && <UpgradeInDDContent onClick={() => setUpgradePopup(false)} />}
              {
                isFeiShuSpace &&
                <UpgradeInFeiShuContent content={t(Strings.lark_can_not_upgrade)} onClick={() => setUpgradePopup(false)} />
              }
              {isWecomSpace && <UpgradeInWecomContent onClick={() => setUpgradePopup(false)} />}
            </Popup>
          </ComponentDisplay>
        </div>
        <Tooltip
          title={t(Strings.notification_center)}
          placement="right"
          key="notification_center"
        >
          <span className={styles.notification}>
            {NotificationNav}
            <span
              id={NAV_ID.ICON_NOTIFICATION}
              className={styles.noticeAnimate}
            />
          </span>
        </Tooltip>
        {
          !inSocialApp() && !isMobileApp() && <div className={styles.help}><Help templateActived={templateActive} /></div>
        }
        <div className={styles.userIcon}><User /></div>
        {showCreateModal && <CreateSpaceModal isMobile={isMobile} setShowCreateModal={setShowCreateModal} />}
      </div>
      <ComponentDisplay maxWidthCompatible={ScreenSize.md}>
        <Popup
          title={t(Strings.notification_center)}
          visible={notice}
          onClose={onNoticeClose}
          height={'90%'}
          className={classNames(styles.drawer, styles.notificationDrawer)}
          style={{ backgroundColor: colors.defaultBg }}
        >
          <Notification />
        </Popup>
      </ComponentDisplay>
      <SpaceListDrawer visible={spaceListDrawerVisible} onClose={setSpaceListDrawerVisible} />
    </NavigationContext.Provider>
  );
};
