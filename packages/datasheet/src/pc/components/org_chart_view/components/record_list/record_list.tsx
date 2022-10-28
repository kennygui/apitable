import { useState, Fragment, FC, useCallback, useContext } from 'react';
import { Typography, Button, ListDeprecate, IconButton, useThemeColors } from '@vikadata/components';
import { AddOutlined, CloseMiddleOutlined } from '@vikadata/icons';
import { DragItem } from './drag_item';
import { DropWrapper } from '../drop_wrapper';
import styles from './styles.module.less';
import { expandRecordIdNavigate } from 'pc/components/expand_record';
import { CollaCommandName, ExecuteResult, t, Strings, ISetRecordOptions, DATASHEET_ID } from '@apitable/core';
import { resourceService } from 'pc/resource_service';
import { FlowContext } from '../../context/flow_context';
import { DragNodeType } from '../../constants';
import { isEmpty } from 'lodash';
import { INode, IDragItem, NodeHandleState, INodeStateMap } from '../../interfaces';
import { RecordMenu } from 'pc/components/multi_grid/context_menu/record_menu';

interface IRecordList {
  nodes: INode[];
  disabled?: boolean;
  onClose(): void;
}

export const addRecord = (viewId: string, index: number, autoOpen = true) => {
  const collaCommandManager = resourceService.instance!.commandManager;
  const result = collaCommandManager.execute({
    cmd: CollaCommandName.AddRecords,
    count: 1,
    viewId,
    index,
  });
  if (result.result === ExecuteResult.Success) {
    const newRecordId = result.data && result.data[0];
    autoOpen && expandRecordIdNavigate(newRecordId);
    return newRecordId;
  }
  return null;
};

// TODO: Extracted as a public business component
export const RecordList: FC<IRecordList> = (props) => {
  const colors = useThemeColors();
  const {
    nodes,
    disabled,
    onClose
  } = props;

  const {
    viewId,
    orgChartStyle,
    nodeStateMap,
    setNodeStateMap,
    rowsCount,
  } = useContext(FlowContext);

  const [keyword, setKeyword] = useState();

  const handleSearch = (e, word) => {
    if (!keyword) {
      setKeyword(word);
    }
    setKeyword(word);
  };

  const { linkFieldId } = orgChartStyle;

  const handleDrop = useCallback(
    (item: IDragItem) => {

      const data: ISetRecordOptions[] = [
        {
          fieldId: linkFieldId,
          recordId: item.id,
          value: [],
        },
      ];
      if (item.data.degree && item.data.degree.inDegree >= 1) {
        // Connections to be disconnected
        const sourceLinkData = item.data.parents?.reduce((sourceLinkData, parent) => {
          const {
            id: sourceId,
            data: { linkIds }
          } = parent;

          sourceLinkData.push({
            recordId: sourceId,
            fieldId: linkFieldId,
            value: linkIds.filter((id) => id !== item.id),
          });
          return sourceLinkData;
        }, [] as ISetRecordOptions[]);

        data.push(...(sourceLinkData || []));
      }

      const changedNodeState = item.data.linkIds.reduce((prev: INodeStateMap, cur) => {
        prev[cur] = {
          handleState: NodeHandleState.Unhandled,
        };
        return prev;
      }, { [item.id]: { handleState: NodeHandleState.Unhandled }});

      setNodeStateMap(s => ({
        ...s,
        ...changedNodeState,
      }));
      resourceService.instance!.commandManager.execute({
        cmd: CollaCommandName.SetRecords,
        datasheetId: item.data.datasheetId,
        data,
      });
    },
    [linkFieldId, setNodeStateMap]
  );

  const nodesToRender = nodes.filter(n => {
    if (nodeStateMap && nodeStateMap[n.id]?.handleState === NodeHandleState.Handling) {
      return false;
    }
    if (!isEmpty(keyword)) {
      return n.data?.recordName.includes(keyword as unknown as string);
    }
    return true;
  }).map((node) => <DragItem key={node.id} node={node} />);

  return (
    <div 
      className={styles.recordList}
    >
      <RecordMenu hideInsert />
      <DropWrapper
        onDrop={handleDrop}
        accept={DragNodeType.RENDER_NODE}
        mask={
          <div className={styles.dropMask}>
            <div className={styles.dropMaskText}>{t(Strings.org_chart_drag_clear_link)}</div>
          </div>
        }
        className={styles.dropList}
        id={DATASHEET_ID.ORG_CHART_RECORD_LIST}
      >
        <div className={styles.header}>
          <Typography variant="h6">{t(Strings.org_chart_record_list)}</Typography>
          <IconButton
            onClick={onClose}
            icon={CloseMiddleOutlined}
            size="small"
          />
        </div>
        <ListDeprecate
          className={styles.list}
          onClick={() => { }}
          searchProps={{
            onSearchChange: handleSearch,
            placeholder: t(Strings.search),
          }}
        >
          {!disabled ? (
            <div className={styles.add}>
              <Button
                color={colors.fc6}
                onClick={() => addRecord(viewId, rowsCount)}
                block
                size="small"
                prefixIcon={<AddOutlined size={16} />}
              >
                {t(Strings.add_record)}
              </Button>
            </div>
          ) : (
            <Fragment />
          )}
          <div className={styles.listItems}>
            {nodesToRender.length > 0 ? nodesToRender : (
              <div className={styles.empty}>{t(Strings.empty_record)}</div>
            )}
          </div>
        </ListDeprecate>
      </DropWrapper>
    </div>
  );
};
