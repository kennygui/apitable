import { Button, LinkButton, ThemeProvider, Typography, useThemeColors } from '@vikadata/components';
import { integrateCdnHost, Navigation, Selectors, Settings, Strings, t } from '@vikadata/core';
import { Modal } from 'antd';
import Image from 'next/image';
import { TComponent } from 'pc/components/common/t_component';
import { navigatePath } from 'pc/components/route_manager/use_navigation';
import { store } from 'pc/store';
import * as React from 'react';
import { isMobile } from 'react-device-detect';
import ReactDOM from 'react-dom';
import { Provider, useSelector } from 'react-redux';
import CloseIcon from 'static/icon/common/common_icon_close_large.svg';
import QrCodePng from 'static/icon/datasheet/share/qrcode/datasheet_img_qr_bj.png';
import styles from './styles.module.less';

interface IOrderModalProps {
  onModalClose(): void;
  modalTitle: string | JSX.Element;
  modalSubTitle: string | ((cb: () => void) => JSX.Element) | JSX.Element;
  qrCodeUrl: string;
}

export const OrderModal: React.FC<IOrderModalProps> = ({ onModalClose, modalTitle, modalSubTitle, qrCodeUrl }) => {
  const isStringTitle = typeof modalTitle === 'string';
  const isStringSubTitle = typeof modalSubTitle === 'string';
  const isFunctionSubTitle = typeof modalSubTitle === 'function';
  const colors = useThemeColors();
  return <div className={styles.container}>
    {/* <IconButton icon={CloseMiddleOutlined} shape="square" className={styles.closeIcon} onClick={onModalClose} size={'large'} /> */}
    <div>
      {
        isStringTitle ? <Typography variant={'h5'}>
          {modalTitle}
        </Typography> : modalTitle
      }
    </div>
    {
      isStringSubTitle ? <Typography variant={'h6'} style={{ marginTop: 24 }}>
        {modalSubTitle}
      </Typography> : (isFunctionSubTitle ? (modalSubTitle as Function)(onModalClose) : modalSubTitle)
    }
    <div className={styles.qrCode}>
      <Image src={QrCodePng} alt="qrcode background" width={240} height={240} layout={'fill'}/>
      <Image src={qrCodeUrl} alt="" width={224} height={224} />
    </div>
    <Button color={colors.fc0} onClick={() => {onModalClose();}} style={{ width: 240, height: 40 }}>
      {t(Strings.player_contact_us_confirm_btn)}
    </Button>
  </div>;
};

export const OrderModalWithTheme = (props: IOrderModalProps) => {
  const cacheTheme = useSelector(Selectors.getTheme);
  return (
    <ThemeProvider theme={cacheTheme}>
      <OrderModal {...props} />
    </ThemeProvider>
  );
};

export const showOrderModal = (config: Omit<IOrderModalProps, 'onModalClose'>) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const onModalClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    container.parentElement!.removeChild(container);
  };

  ReactDOM.render((
    <Provider store={store}>
      <Modal
        visible
        wrapClassName={styles.modalWrapper}
        closeIcon={<CloseIcon />}
        onCancel={onModalClose}
        destroyOnClose
        width="520px"
        footer={null}
        centered
      >
        <OrderModalWithTheme onModalClose={onModalClose} {...config} />
      </Modal>
    </Provider>
  ),
  container,
  );
};

type IOrderType = 'BUY' | 'RENEW' | 'UPGRADE';

const getOrderType = (orderType: IOrderType) => {
  switch (orderType) {
    case 'UPGRADE': {
      return t(Strings.upgrade);
    }
    case 'RENEW': {
      return t(Strings.renewal);
    }
    default: {
      return t(Strings.subscribe);
    }
  }
};

export const showOrderModalAfterPay = (descColor: string, orderType: IOrderType) => {

  showOrderModal({
    modalTitle: t(Strings.upgrade_success_model, { orderType: getOrderType(orderType) }),
    modalSubTitle: (cb: () => void) => <>
      <div className={styles.desc1}>
        {
          <TComponent
            tkey={t(Strings.upgrade_success_1_desc)}
            params={{
              orderType: getOrderType(orderType),
              position:
                <LinkButton
                  className={styles.linkButton}
                  style={{
                    display: 'inline-block'
                  }}
                  onClick={() => {
                    cb();
                    if (isMobile) {
                      return;
                    }
                    navigatePath({ path: Navigation.SPACE_MANAGE, params: { pathInSpace: 'overview' }});
                  }}
                >
                  {t(Strings.space_overview)}
                </LinkButton>

            }}
          />
        }
      </div>
      <Typography className={styles.desc2} variant={'body2'} color={descColor}>
        {t(Strings.upgrade_success_2_desc)}
      </Typography>
    </>,
    qrCodeUrl: integrateCdnHost(Settings.pay_success_qr_code.value)
  });
};

export const showOrderContactUs = () => {
  showOrderModal({
    modalTitle: t(Strings.contact_model_title),
    modalSubTitle: t(Strings.contact_model_desc),
    qrCodeUrl: integrateCdnHost(Settings.pay_contact_us.value)
  });
};

export const showUpgradeContactUs = () => {
  showOrderModal({
    modalTitle: t(Strings.contact_model_title),
    modalSubTitle: t(Strings.space_dashboard_contact_desc),
    qrCodeUrl: integrateCdnHost(Settings.pay_success_qr_code.value)
  });
};
