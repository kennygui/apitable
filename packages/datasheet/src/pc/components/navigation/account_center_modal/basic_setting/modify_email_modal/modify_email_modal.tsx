import { FC, useState, useEffect } from 'react';
import * as React from 'react';
import { Form } from 'antd';
import styles from './style.module.less';
import { useDispatch } from 'react-redux';
import {
  StoreActions,
  Api,
  ConfigConstant,
  Strings,
  t,
} from '@vikadata/core';
import {
  Message,
  NormalModal,
  WithTipWrapper,
  IdentifyingCodeInput,
} from 'pc/components/common';
import { addWizardNumberAndApiRun } from 'pc/common/guide/utils';
import { useSetState } from 'pc/hooks';
import { TextInput } from '@vikadata/components';
import { Verify } from '../modify_mobile_modal/verify';
import { usePlatform } from 'pc/hooks/use_platform';

export interface IModifyEmailModalProps {
  setEmailModal: React.Dispatch<React.SetStateAction<boolean>>;
  data: {
    email: string;
    mobile?: string;
    areaCode?: string;
  };
}

const defaultErrMsg = {
  accountErrMsg: '',
  identifyingCodeErrMsg: '',
};

export const ModifyEmailModal: FC<IModifyEmailModalProps> = (props) => {
  const { setEmailModal, data } = props;
  const [newEmail, setNewEmail] = useState('');
  const [identifyingCode, setIdentifyingCode] = useState('');
  // 表示操作是绑定邮箱还是修改邮箱
  const [isBindEmail, setIsBindEmail] = useState(true);
  const [errMsg, setErrMsg] = useSetState<{
    accountErrMsg: string;
    identifyingCodeErrMsg: string;
  }>();

  // 表示是否在加载中
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (data.email) {
      setIsBindEmail(false);
    }
  }, [data]);

  const handleCancel = () => {
    setEmailModal(false);
  };

  const handleEmailCheck = () => {
    if (newEmail === '') {
      setErrMsg({ accountErrMsg: t(Strings.error_email_empty) });
      return;
    }
    if (newEmail === data.email) {
      setErrMsg({ accountErrMsg: t(Strings.bind_email_same) });
      return;
    }
    setErrMsg(defaultErrMsg);
    bindEmail();
  };

  const handleMobileCheck = () => {
    smsCodeVerify();
  };

  const smsCodeVerify = () => {
    if (!data.areaCode || !data.mobile) return;
    setLoading(true);
    Api.emailCodeVerify(data.email, identifyingCode).then((res) => {
      const { success, message } = res.data;
      if (success) {
        setIsBindEmail(true);
        setLoading(false);
      } else {
        setErrMsg({ identifyingCodeErrMsg: message });
      }
      setLoading(false);
    });
  };

  const bindEmail = () => {
    setLoading(true);
    Api.bindEmail(newEmail, identifyingCode).then((res) => {
      const { code, success, message } = res.data;
      if (success) {
        dispatch(StoreActions.updateUserInfo({ email: newEmail }));
        if (isBindEmail) {
          addWizardNumberAndApiRun(ConfigConstant.WizardIdConstant.EMAIL_BIND);
        }
        Message.success({ content: t(Strings.message_bind_email_succeed) });
        setLoading(false);
        setEmailModal(false);
      } else {
        if (code == 500) {
          setErrMsg({ accountErrMsg: message });
        } else {
          setErrMsg({ identifyingCodeErrMsg: message });
        }

        setLoading(false);
      }
    });
  };

  const handleChange = (e) => {
    setNewEmail(e.target.value);
    setErrMsg(defaultErrMsg);
  };

  const handleIdentifyingCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (errMsg.identifyingCodeErrMsg) {
      setErrMsg({ identifyingCodeErrMsg: '' });
    }

    const value = e.target.value.trim();
    setIdentifyingCode(value);
  };

  // 绑定邮箱页面
  const bindEmailPage = () => {
    return (
      <div className={styles.modifyNameWrapper}>
        <Form onFinish={handleEmailCheck} key="bindEmailPage">
          <WithTipWrapper tip={errMsg.accountErrMsg}>
            <TextInput
              onChange={handleChange}
              placeholder={t(Strings.placeholder_input_email)}
              error={Boolean(errMsg.accountErrMsg)}
              autoFocus
              block
            />
          </WithTipWrapper>
          <WithTipWrapper tip={errMsg.identifyingCodeErrMsg} captchaVisible>
            <IdentifyingCodeInput
              data={{ account: newEmail }}
              mode={ConfigConstant.LoginMode.MAIL}
              emailType={ConfigConstant.EmailCodeType.BIND}
              onChange={handleIdentifyingCodeChange}
              setErrMsg={setErrMsg}
              error={Boolean(errMsg.identifyingCodeErrMsg)}
              disabled={Boolean(
                !newEmail ||
                errMsg.accountErrMsg ||
                errMsg.identifyingCodeErrMsg
              )}
            />
          </WithTipWrapper>
        </Form>
      </div>
    );
  };

  // 验证验证码页面
  const checkEmailPage = () => {
    if (!data.email) return;
    return (
      <Verify
        onVerify={smsCodeVerify}
        data={data}
        onInputChange={handleIdentifyingCodeChange}
        errMsg={errMsg}
        setErrMsg={setErrMsg}
        smsType={ConfigConstant.SmsTypes.MODIFY_EMAIL}
        emailType={ConfigConstant.EmailCodeType.COMMON}
        mode={ConfigConstant.LoginMode.MAIL}
      />
    );
  };
  const needSkipVerify = isBindEmail || !data.mobile;
  const { desktop } = usePlatform();

  return (
    <NormalModal
      title={
        needSkipVerify
          ? t(Strings.modal_title_bind_email)
          : t(Strings.modal_title_check_original_mail)
      }
      className={styles.modifyEmail}
      maskClosable={false}
      onCancel={handleCancel}
      visible
      centered={desktop}
      okText={needSkipVerify ? t(Strings.bind_email) : t(Strings.next_step)}
      onOk={needSkipVerify ? handleEmailCheck : handleMobileCheck}
      okButtonProps={{
        loading,
        disabled: Boolean(!identifyingCode || errMsg.accountErrMsg || errMsg.identifyingCodeErrMsg),
      }}
    >
      {needSkipVerify? bindEmailPage() : checkEmailPage()}
    </NormalModal>
  );
};
