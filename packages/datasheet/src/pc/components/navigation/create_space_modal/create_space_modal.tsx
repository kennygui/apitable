import { Button, useThemeColors } from '@vikadata/components';
import { Api, IReduxState, Navigation, StatusCode, StoreActions, Strings, t } from '@apitable/core';
import { Drawer, Form, Input } from 'antd';
import cls from 'classnames';
import Image from 'next/image';
import { Modal } from 'pc/components/common/modal/modal/modal';
import { isSocialDomain } from 'pc/components/home/social_platform';
import { Method } from 'pc/components/route_manager/const';
import { navigationToUrl } from 'pc/components/route_manager/navigation_to_url';
import { Router } from 'pc/components/route_manager/router';
import { useRequest } from 'pc/hooks';
import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import spaceNameImg from 'static/icon/account/account_img_createspace@2x.png';
import CloseIcon from 'static/icon/common/common_icon_close_small.svg';
import styles from './style.module.less';

export interface ICreateSpaceModalProps {
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
}

export const CreateSpaceModal: FC<ICreateSpaceModalProps> = props => {
  const { isMobile } = props;
  const [spaceName, setSpaceName] = useState('');
  const dispatch = useDispatch();
  const err = useSelector((state: IReduxState) => state.space.err);
  const colors = useThemeColors();

  const { run: toGetUser } = useRequest((spaceId) => Api.getUserMe({ spaceId }).then(res => {
    const { data, success } = res.data;
    if (success) {
      navigationToUrl(`${window.location.protocol}//${data.spaceDomain}/space/${data.spaceId}`, { method: Method.Redirect });
    }
  }), { manual: true });
  const { run: createSpace, loading } = useRequest((spaceName: string) => {
    return Api.createSpace(spaceName).then(res => {
      const { data, code, success, message } = res.data;
      if (success) {
        // Compatible with corporate domain name creation space station jump
        if (isSocialDomain()) {
          toGetUser(data.spaceId);
          return;
        }
        dispatch(StoreActions.updateUserInfo({ needCreate: false }));
        Router.redirect(Navigation.SPACE, { params: { spaceId: data.spaceId }});
      } else {
        dispatch(StoreActions.setSpaceErr({
          code,
          msg: message,
        }));
      }
    });
  }, { manual: true });

  useEffect(() => {
    return () => {
      dispatch(StoreActions.setSpaceErr(null));
    };
  }, [dispatch]);

  useEffect(() => {
    if (err && err.code === StatusCode.STATUS_OK) {
      props.setShowCreateModal(false);
    }
  }, [err, props]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (err) {
      dispatch(StoreActions.setSpaceErr(null));
    }
    const value = e.target.value;
    setSpaceName(value);
  };

  const handleSubmit = () => {
    createSpace(spaceName);
  };

  const renderContent = () => {
    return (
      <div>
        <div className={styles.spaceNameImg}>
          <Image src={spaceNameImg} alt='createSpace Logo' width={366} height={275} />
        </div>
        {!isMobile && <div className={styles.title}>{t(Strings.new_space)}</div>}
        <div className={styles.subTitle}>{t(Strings.new_space_tips)}</div>
        <Form>
          <Input
            className={err && err.code !== StatusCode.STATUS_OK ? 'error' : ''}
            placeholder={t(Strings.placeholder_input_workspace_name, {
              minCount: 2,
              maxCount: 100,
            })}
            onChange={handleChange}
            autoFocus
          />
          <div className={styles.errorMsg}>
            {err && err.code !== StatusCode.STATUS_OK ? err.msg : ''}
          </div>
          <Button
            color='primary'
            className={styles.submit}
            disabled={!spaceName || loading}
            loading={loading}
            size='large'
            block
            onClick={handleSubmit}
          >
            {t(Strings.submit)}
          </Button>
        </Form>
        <p className={styles.tip}>{t(Strings.change_space_name_tip)}</p>
      </div>
    );
  };

  if (isMobile) {
    return (
      <Drawer
        title={t(Strings.new_space)}
        placement='bottom'
        visible
        onClose={() => !loading && props.setShowCreateModal(false)}
        height={566}
        className={cls(styles.createSpaceWrapper, { [styles.createSpaceWrapperMobile]: isMobile })}
        headerStyle={{ borderBottom: 'none' }}
        closeIcon={<CloseIcon width={16} height={16} fill={colors.thirdLevelText} />}
      >
        {renderContent()}
      </Drawer>
    );
  }

  return (
    <Modal
      width={'90%'}
      visible
      footer={null}
      wrapClassName={styles.createSpaceWrapper}
      bodyStyle={{
        width: '370px',
        height: '720px',
        margin: '0 auto',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
      }}
      style={{ maxWidth: '1170px', minWidth: '800px' }}
      maskClosable
      onCancel={() => !loading && props.setShowCreateModal(false)}
      centered
    >
      {renderContent()}
    </Modal>
  );
};
