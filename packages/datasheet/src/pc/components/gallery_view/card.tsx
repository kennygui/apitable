import { useContextMenu, TextButton, useThemeColors } from '@vikadata/components';
import { DropDirectionType, Selectors, Strings, t, StoreActions } from '@vikadata/core';
import { areEqual } from '@vikadata/react-window';
import classNames from 'classnames';
import { XYCoord } from 'dnd-core';
import { ScreenSize } from 'pc/components/common/component_display/component_display';
import { GRID_RECORD_MENU } from 'pc/components/multi_grid/context_menu/record_menu';
import { useResponsive } from 'pc/hooks';
import { getIsColNameVisible } from 'pc/utils/datasheet';
import { useEffect } from 'react';
import * as React from 'react';
import { DragSourceMonitor, DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import AddIcon from 'static/icon/common/common_icon_add_content.svg';
import IconArrow from 'static/icon/common/common_icon_pulldown.svg';
import { RecordCard } from '../record_card/card';
import { GalleryGroupItemType, ItemTypes } from './constant';
import { GroupCardTitle } from './group_card_title';
import { IDragItem } from './interface';
import styles from './style.module.less';
import { getAddValue, getGroupTitlePaddingTip } from './utils';
import { StorageName, setStorage } from 'pc/utils/storage/storage';
import { useDebounceFn } from 'ahooks';

const GalleryItemCardBase = ({ columnIndex, rowIndex, style, data }) => {
  const colors = useThemeColors();
  const {
    visibleRecords, columnCount, cardWidth, cardHeight, galleryStyle, imageHeight, linearRows,
    moveCard, commitMove, addRecord, keepSort, rowSortable, onChangeGroupCollapse, groupInfo,
    onDoTransition, transitionRecordIds, isGrouped, _visibleRecords
  } = data;

  const { datasheetId, templateId, editable, viewId, groupingCollapseIds, isSearching } = useSelector(state => {
    const datasheet = Selectors.getDatasheet(state);
    return {
      datasheetId: Selectors.getActiveDatasheetId(state),
      templateId: state.pageParams.templateId,
      editable: datasheet?.permissions.editable,
      viewId: state.pageParams.viewId,
      groupingCollapseIds: Selectors.getGroupingCollapseIds(state),
      isSearching: Boolean(Selectors.getSearchKeyword(state)),
    };
  }, shallowEqual);
  const dispatch = useDispatch();
  const isOneColumnMode = columnCount === 1;
  const singleColumnIndex = columnIndex + rowIndex * columnCount;
  const index = singleColumnIndex;
  const cardItem = linearRows[singleColumnIndex];
  const showAdd = !templateId && editable;
  const recordId: string = cardItem?.recordId;
  const groupHeadId: string = cardItem?.groupHeadRecordId;
  const groupingCollapseIdsMap = new Map<string, boolean>(groupingCollapseIds?.map(v => [v, true]));
  const coverFieldId = galleryStyle.coverFieldId;
  const ref = React.useRef<HTMLDivElement>(null);
  const { screenIsAtMost } = useResponsive();
  const isMobile = screenIsAtMost(ScreenSize.md);
  const { show } = useContextMenu({
    id: GRID_RECORD_MENU,
  });
  const canCollapse = transitionRecordIds.includes(groupHeadId);
  
  const dispatchDOMDisplay = (recordId) => {
    if (isSearching || !datasheetId) return;
    if (groupingCollapseIdsMap.has(recordId)) {
      groupingCollapseIdsMap.delete(recordId);
    } else{
      groupingCollapseIdsMap.set(recordId, true);
    }
    const newState = Array.from(groupingCollapseIdsMap.keys());
    dispatch(StoreActions.setGroupingCollapse(datasheetId, newState));
    // QuickAppend 组件显示依赖于 hoverRecordId, 分组折叠的情况下应该清空, 避免产生视觉误导
    dispatch(StoreActions.setHoverRecordId(datasheetId, null));
    setStorage(StorageName.GroupCollapse,
      { [`${datasheetId},${viewId}`]: newState },
    );
    onChangeGroupCollapse();
  };

  const { run, cancel } = useDebounceFn(dispatchDOMDisplay, { wait: 100 });

  useEffect(() => () => {
    cancel();
  }, [cancel]);

  function onContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    show(e as React.MouseEvent<HTMLElement>, {
      props: {
        recordId: recordId,
        recordIndex: index,
      },
    });
  }
  const changeGroupCollapseState = (recordId) => {
    // // 表内查找时，屏蔽折叠分组操作
    if (isSearching || !datasheetId) return;
    if (!canCollapse) {
      onDoTransition(recordId);
      run(recordId);
    } else {
      dispatchDOMDisplay(recordId);
    }
  };

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id: recordId, index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !keepSort && rowSortable,
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    drop() {
      commitMove();
    },
    hover(item: IDragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      let dragIndex = item.index;
      let hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const dragItemRect = monitor.getClientOffset();
      const dropItemRect = ref.current?.getBoundingClientRect();
      const currentX = (dragItemRect as XYCoord).x;
      const dropStartX = dropItemRect.left;
      const dropEndX = dropStartX + dropItemRect.width;
      const dropMiddleX = dropStartX + (dropEndX - dropStartX) / 2;
      if (currentX < dropStartX || currentX > dropEndX) {
        return;
      }

      const direction = currentX < dropMiddleX ? DropDirectionType.BEFORE : DropDirectionType.AFTER;
      
      if (isGrouped) {
        const dragItem = linearRows[dragIndex];
        const dropItem = linearRows[hoverIndex];
        if (!dragItem || !dropItem) {
          return;
        }
        dragIndex = _visibleRecords.findIndex((v) => v.recordId === dragItem.recordId);
        hoverIndex = _visibleRecords.findIndex((v) => v.recordId === dropItem.recordId);
      }

      if (dragIndex === -1 || hoverIndex === -1) {
        return;
      }
      moveCard(dragIndex, hoverIndex, direction);
    },
  });

  drag(drop(ref));

  const opacity = (isDragging || canCollapse) ? 0 : 1;
  let transitionStyle: React.CSSProperties = {};
  if (canCollapse) {
    transitionStyle = { height: 0, padding: 0, overflow: 'hidden' };
  }
  const WIDTH = isMobile ? cardWidth - 24 : cardWidth - 16;
  const cardStyle = { padding: '16px 8px 0' };

  const mobileStyle = isMobile ? {
    paddingTop: 16,
    paddingLeft: 10,
    paddingRight: 0,
    paddingBottom: 0,
  } : {};

  if (!recordId) {
    return null;
  }
  if (cardItem.type === GalleryGroupItemType.GroupHeadBlank ) {
    return <div
      style={{
        ...style,
        padding: '0 8px 0',
        ...mobileStyle,
      }}
      className={styles.cardGroupTitle}
    />;
  }

  if (cardItem.type === GalleryGroupItemType.GroupTitle) {
    const paddingTop = getGroupTitlePaddingTip(linearRows, singleColumnIndex - 1, rowIndex);
    return (
      <div
        style={{
          ...style,
          padding: `${paddingTop}px 8px 0`,
          ...mobileStyle,
        }}
        className={styles.cardGroupTitle}
      >
        <div
          className={styles.icon}
          onClick={()=>changeGroupCollapseState(recordId)}
        >
          <IconArrow
            fill={colors.thirdLevelText}
            width={10}
            height={8}
            style={{
              transition: 'all 0.3s',
              transform: groupingCollapseIds && groupingCollapseIds.includes(recordId) ?
                'rotate(-90deg)' : 'rotate(0)'
            }}
          />
        </div>
        <GroupCardTitle recordId={recordId} />
      </div>
    );
  }

  if (cardItem.type === GalleryGroupItemType.BlankCard) {
    return (
      <div
        style={{
          ...style,
          ...transitionStyle,
          cursor: 'default',
          ...cardStyle,
          opacity,
          ...mobileStyle,
        }}
        className={styles.card}
      />
    );
  }
  if (cardItem.type === GalleryGroupItemType.AddCard) {
    if (!showAdd) return null;
    const fieldId = groupInfo?.[0]?.fieldId;

    return (
      <div
        style={{
          ...style,
          ...transitionStyle,
          ...cardStyle,
          opacity,
          ...mobileStyle,
        }}
        className={styles.card}
        onClick={() => addRecord(visibleRecords.length, getAddValue(recordId, fieldId))}
      >
        <div
          className={classNames(styles.addNewRecordCard, styles.innerCard, {
            [styles.innerCardForOneColumnMode]: isOneColumnMode,
          })}
          style={{
            borderRadius: 4,
            width: WIDTH,
            height: cardHeight - 16,
          }}
        >
          <TextButton
            prefixIcon={<AddIcon width={14} height={14} fill="currentColor" />}
            size={'small'}
          >
            {t(Strings.add_record)}
          </TextButton>
        </div>
      </div>
    );
  }
  return (
    <div
      ref={ref}
      style={{
        ...style,
        ...transitionStyle,
        ...cardStyle,
        opacity,
        ...mobileStyle,
      }}
      className={styles.card}
      onContextMenu={onContextMenu}
    >
      <RecordCard
        recordId={recordId}
        isCoverFit={galleryStyle.isCoverFit}
        isColNameVisible={getIsColNameVisible(galleryStyle.isColNameVisible)}
        cardWidth={WIDTH}
        coverHeight={imageHeight}
        showEmptyField
        multiTextMaxLine={4}
        coverFieldId={coverFieldId}
        showEmptyCover
        className={classNames(styles.innerCard, {
          [styles.innerCardForOneColumnMode]: isOneColumnMode,
        })}
        isGallery
      />
    </div>
  );
};

export const GalleryItemCard = React.memo(GalleryItemCardBase, areEqual);
