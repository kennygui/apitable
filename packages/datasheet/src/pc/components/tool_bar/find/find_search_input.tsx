import { getArrayLoopIndex, Selectors, StoreActions, Strings, t, ViewType } from '@vikadata/core';
import { useDebounce } from 'ahooks';
import { ButtonPlus, Tooltip } from 'pc/components/common';
import { Loading, useThemeColors } from '@vikadata/components';
import { KeyCode } from 'pc/utils';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import IconNext from 'static/icon/common/common_icon_pulldown_line.svg';
import IconPrev from 'static/icon/common/common_icon_up_line.svg';
import styles from './styles.module.less';
import { CancelFilled, SearchOutlined } from '@vikadata/icons';
import { useClickAway } from 'ahooks';
import classNames from 'classnames';
import { dispatch } from 'pc/worker/store';
interface ISearchPanelProps {
  setVisible(visible: boolean): void;
  keyword: string;
  setKeyword(keyword: string): void;
}

interface ISearchInputRef {
  select(): void
}
const wrapperClassName = styles.findSearchInput;
export const SearchInputBase: React.ForwardRefRenderFunction<ISearchInputRef, ISearchPanelProps> = (props, ref) => {
  const { setVisible, keyword, setKeyword } = props;
  const colors = useThemeColors();
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const _keyword = useDebounce(keyword, { wait: 300 });
  const datasheetId = useSelector(Selectors.getActiveDatasheetId)!;
  const searchKeyword = useSelector(Selectors.getSearchKeyword);
  const currentView = useSelector(Selectors.getCurrentView);
  const searchResultCursorIndex = useSelector(Selectors.getSearchResultCursorIndex);
  const searchResultArray = useSelector((state) => Selectors.getSearchResultArray(state, searchKeyword || ''));
  const calcSearching = useSelector(Selectors.getComputedStatus)?.computing;
  const searchResultItemCount = searchResultArray && searchResultArray.length;
  const lock = useRef(false);
  const [refreshIndex, setRefreshIndex] = useState(0);
  useClickAway(() => {
    if (!keyword) {
      setVisible(false);
    }
  }, () => document.querySelector('.' + wrapperClassName));
  useImperativeHandle(ref, () => ({
    select: () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    },
  }));

  useEffect(() => {
    if (lock.current) return;
    setIsSearching(true);
    dispatch(StoreActions.setSearchKeyword(datasheetId, _keyword.trim()));
    setIsSearching(false);
  }, [_keyword, refreshIndex, datasheetId]);

  useEffect(() => {
    dispatch(StoreActions.setSearchResultCursorIndex(datasheetId, 0));
  }, [searchKeyword, datasheetId]);

  const setCursorIndex2Pre = () => {
    inputRef.current?.focus();
    if (searchResultCursorIndex != null) {
      const newIndex = getArrayLoopIndex(searchResultItemCount, searchResultCursorIndex, -1);
      dispatch(StoreActions.setSearchResultCursorIndex(datasheetId, newIndex));
    }
  };

  const setCursorIndex2Next = () => {
    inputRef.current?.focus();
    if (searchResultCursorIndex != null) {
      const newIndex = getArrayLoopIndex(searchResultItemCount, searchResultCursorIndex, +1);
      dispatch(StoreActions.setSearchResultCursorIndex(datasheetId, newIndex));
    }
  };

  const close = () => {
    setKeyword('');
    setVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === KeyCode.Enter) {
      if (e.shiftKey) return setCursorIndex2Pre();
      return setCursorIndex2Next();
    }
    return;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.CompositionEvent) => {
    // 参见：https://zhuanlan.zhihu.com/p/106805657
    if (e.type === 'compositionstart') {
      lock.current = true;
      return;
    }
    if (e.type === 'compositionend') {
      lock.current = false;
      // chrome: compositionstart --> input --> compositionend
      // firefox: compositionstart --> compositionend --> input
      setKeyword((e as React.ChangeEvent<HTMLInputElement>).target.value);
      // 结束中文输入时，主动触发一次搜索。
      setRefreshIndex(refreshIndex + 1);
      return;
    }
    setKeyword((e as React.ChangeEvent<HTMLInputElement>).target.value);
  };

  const shouldShowFoundText = Boolean(!isSearching && searchKeyword);
  const shouldBanPrevNextButton = !shouldShowFoundText || searchResultItemCount < 1;

  const countText = calcSearching ? <Loading /> : searchResultCursorIndex != null ?
    `${searchResultItemCount > 0 ? searchResultCursorIndex + 1 : 0} / ${searchResultItemCount}` : '';
  return (
    <div
      className={classNames(wrapperClassName, {
        [styles.darkBg]: currentView && (currentView.type === ViewType.Kanban || currentView.type === ViewType.OrgChart),
      })}
    >
      <span className={styles.searchIcon}>
        <SearchOutlined size={16} />
      </span>
      <div className={styles.inputTextGroup}>
        <span className={styles.searchInputWrap}>
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleChange}
            onCompositionEnd={handleChange}
            placeholder={t(Strings.find)}
            autoFocus
          />
        </span>

        {
          shouldShowFoundText && searchResultCursorIndex != null &&
          <span className={styles.searchCountText}>
            {countText}
          </span>
        }
      </div>
      {
        !calcSearching && keyword &&
        <div className={styles.iconGroup}>
          <div className={styles.slash} />
          <ButtonPlus.Icon
            disabled={shouldBanPrevNextButton}
            onClick={setCursorIndex2Pre}
            className={styles.prevBtn}
            icon={
              <Tooltip
                title={t(Strings.find_prev)}
                placement="top"
              >
                <span><IconPrev width={16} height={16} fill={colors.secondLevelText} /></span>
              </Tooltip>
            }
          />
          <ButtonPlus.Icon
            disabled={shouldBanPrevNextButton}
            onClick={setCursorIndex2Next}
            className={styles.nextBtn}
            icon={
              <Tooltip
                title={t(Strings.find_next)}
                placement="top"
              >
                <span><IconNext width={16} height={16} fill={colors.secondLevelText} /></span>
              </Tooltip>
            }
          />
          <span className={styles.closeButton} onClick={close}>
            <CancelFilled size={16} />
          </span>
        </div>
      }
    </div>
  );
};
export const FindSearchInput = forwardRef(SearchInputBase);
