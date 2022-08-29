import { FC, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Strings, t, Selectors, DATASHEET_ID, StoreActions } from '@vikadata/core';
import styles from './style.module.less';
import classnames from 'classnames';
import { useThemeColors } from '@vikadata/components';
import Trigger from 'rc-trigger';
import { ToolItem } from '../tool_item';
import { FormListPanel, IFormNodeItem } from './form_list_panel';
import FormIcon from 'static/icon/datasheet/toolbar_form.svg';
import { TComponent } from 'pc/components/common/t_component';
import { useEffect } from 'react';

interface IForeignFormProps {
  className: string;
  showLabel?: boolean;
  isHide?: boolean;
}

export const ForeignForm: FC<IForeignFormProps> = (props) => {
  const { className, showLabel = true, isHide } = props;
  const [loading, setLoading] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const spaceId = useSelector(state => state.space.activeId);
  const [formList, setFormList] = useState<IFormNodeItem[]>([]);
  const colors = useThemeColors();
  const {
    folderId,
    datasheetId,
    viewId,
    viewName,
  } = useSelector(state => {
    const datasheetId = Selectors.getActiveDatasheetId(state)!;
    const datasheet = Selectors.getDatasheet(state, datasheetId);
    const activeView = Selectors.getActiveView(state)!;
    const views = datasheet?.snapshot.meta.views || [];
    const viewName = views.find((item) => item.id === activeView)?.name;
    return {
      folderId: Selectors.getDatasheetParentId(state)!,
      datasheetId,
      viewId: activeView,
      viewName,
    };
  }, shallowEqual);
  const creatable = useSelector(state => {
    const { manageable } = state.catalogTree.treeNodesMap[folderId]?.permissions || {};
    const { editable } = Selectors.getPermissions(state);
    return manageable && editable;
  });

  /**
   * 复制表格时，viewId 是一致的
   * 此时需要结合 datasheetId 和 viewId 来标识唯一性
   */
  const uniqueId = `${datasheetId}-${viewId}`;

  const fetchForeignFormList = async() => {
    setLoading(true);
    const formList = await StoreActions.fetchForeignFormList(datasheetId, viewId);
    setFormList(formList || []);
    setLoading(false);
  };

  const onClick = () => {
    setPanelVisible(true);
    fetchForeignFormList();
  };

  useEffect(() => {
    fetchForeignFormList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueId]);

  return (
    <>
      <Trigger
        action={['click']}
        popup={
          <FormListPanel
            spaceId={spaceId!}
            folderId={folderId}
            datasheetId={datasheetId}
            viewId={viewId}
            viewName={viewName}
            loading={loading}
            formList={formList}
            creatable={creatable}
          />
        }
        destroyPopupOnHide
        popupAlign={
          { points: ['tr', 'br'], offset: [0, 0], overflow: { adjustX: true, adjustY: true }}
        }
        popupStyle={{ width: 400 }}
        popupVisible={panelVisible}
        onPopupVisibleChange={visible => setPanelVisible(visible)}
        zIndex={1000}
      >
        <ToolItem
          showLabel={isHide || showLabel}
          className={classnames(className, styles.foreignForm, {
            [styles.active]: panelVisible,
          })}
          text={
            formList.length ?
              <TComponent tkey={t(Strings.view_foreign_form_count)} params={{ count: formList.length }} /> :
              t(Strings.vika_form)
          }
          icon={
            <FormIcon
              width={16}
              height={16}
              fill={panelVisible ? colors.primaryColor : colors.secondLevelText}
              className={styles.toolIcon}
            />
          }
          onClick={onClick}
          id={DATASHEET_ID.FORM_BTN}
        />
      </Trigger>
    </>
  );
};
