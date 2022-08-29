import { FC, useState, useEffect } from 'react';
import * as React from 'react';
import { SearchMemberList, Message } from 'pc/components/common';
import { Form } from 'antd';
import { useSelector } from 'react-redux';
import { t, Strings, Api, ISearchMemberData, IReduxState, hiddenMobile } from '@vikadata/core';
import styles from './style.module.less';
import { TextInput, Button, LinkButton } from '@vikadata/components';

interface IVerifyAdminProps {
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
}
export const SelectAdmin: FC<IVerifyAdminProps> = props => {
  const userInfo = useSelector((state: IReduxState) => state.user.info);
  const [keyword, setKeyword] = useState('');
  const [searchMember, setSearchMember] = useState<ISearchMemberData[]>([]);
  const [selectMemberInfo, setSelectMemberInfo] = useState<ISearchMemberData | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    keyword && Api.searchMember(keyword, true).then(res => {
      const { success, data } = res.data;
      if (success) {
        setSearchMember(data.filter(item => item.memberId !== userInfo!.memberId));
      }
    });
  }, [keyword, userInfo]);
  const keywordChange = (value: string) => {
    setKeyword(value);
    setSelectMemberInfo(null);
  };
  const cardClick = (info: ISearchMemberData) => {
    setSelectMemberInfo(info);
  };
  const confirmChange = () => {
    setLoading(true);
    selectMemberInfo && Api.changeMainAdmin(selectMemberInfo.memberId).then(res => {
      const { success, message } = res.data;
      setLoading(false);
      if (success) {
        props.setCurrent(2);
      } else {
        Message.error({ content: message });
      }
    });
  };
  return (
    <div className={styles.selectAdmin}>
      <Form>
        <div className={styles.label}>{t(Strings.primary_admin_new_nickname)}：</div>
        <SearchMemberList
          onChange={keywordChange}
          initInputText={''}
          searchResult={searchMember}
          onClick={cardClick}
          placehodler={t(Strings.search_new_admin)}
        />
        {
          selectMemberInfo &&
          (
            <div className={styles.selectedInfo}>
              {selectMemberInfo.mobile &&
                (
                  <>
                    <div className={styles.label}>{t(Strings.primary_admin_new_phone)}：</div>
                    <TextInput value={hiddenMobile(selectMemberInfo.mobile)} disabled block />
                  </>
                )
              }
              <div className={styles.label}>{t(Strings.handed_over_workspace)}：</div>
              <TextInput value={selectMemberInfo.team} disabled block />
            </div>
          )
        }
        <div className={styles.btnWrapper}>
          <LinkButton
            className={styles.prevBtn}
            onClick={() => props.setCurrent(0)}
            underline={false}
            component="button"
          >
            {t(Strings.last_step)}
          </LinkButton>
          <Button
            className={styles.confirmBtn}
            disabled={!selectMemberInfo || loading}
            onClick={confirmChange}
            loading={loading}
            color="primary"
            size="large"
          >
            {t(Strings.chose_new_primary_admin_button)}
          </Button>
        </div>

      </Form>
    </div>
  );
};
