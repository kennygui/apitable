import { Avatar, LinkButton, Typography, useThemeColors } from '@vikadata/components';
import { Strings, t } from '@vikadata/core';
import { Logo } from 'pc/components/common';
import { showOrderContactUs } from 'pc/components/subscribe_system/order_modal/pay_order_success';
import styles from 'pc/components/subscribe_system/styles.module.less';
import { useSelector } from 'react-redux';

export const SubscribeBar = (props) => {
  const colors = useThemeColors();
  const userInfo = useSelector(state => state.user.info);

  return <div className={styles.navBar}>
    <div style={{ margin: '0 auto', width: 976 }} className={styles.navBarInner}>
      <div className={styles.logo} onClick={() => location.href = '/workbench'}>
        {/* 这里的色值是根据设计的要求，不考虑主题切换，固定的色值 */}
        <Logo size="small" />
      </div>
      <div style={{ flex: 1 }} />
      <Typography variant={'body2'} style={{ marginRight: 32 }}>
        <LinkButton underline={false} onClick={showOrderContactUs} color={colors.fc1}>
          {t(Strings.contact_us)}
        </LinkButton>
      </Typography>
      <Avatar src={userInfo?.avatar || undefined} size={'xs'}>
        {userInfo?.nickName[0]}
      </Avatar>
      <Typography variant={'body2'} style={{ marginLeft: 8 }}>
        {userInfo?.memberName}
      </Typography>
    </div>
  </div>;
};
