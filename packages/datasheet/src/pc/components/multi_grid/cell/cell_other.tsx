import {
  ICollaboratorCursor, stringHash2Number,
  CellType, IGroupInfo, Strings, t, ICollaborator, DATASHEET_ID,
} from '@vikadata/core';
import { store } from 'pc/store';
import { Avatar, AvatarSize } from 'pc/components/common';
import { lightColors } from '@vikadata/components';
import * as React from 'react';
import styles from './styles.module.less';
import { Tooltip } from 'antd';

export const getCollaboratorColor = (collaborator: ICollaboratorCursor): string => {
  const colorsWheel = [
    lightColors.rc02,
    lightColors.rc03,
    lightColors.rc04,
    lightColors.rc05,
    lightColors.rc06,
    lightColors.rc07,
    lightColors.rc08,
    lightColors.rc09,
    lightColors.rc10,
  ];
  const hashColorIndex = stringHash2Number(
    `${collaborator.userId}${collaborator.socketId}`,
    colorsWheel.length,
  );
  const color = colorsWheel[hashColorIndex] as string;
  return color;
};
export function isAlien(collaborator: ICollaboratorCursor | ICollaborator){
  if (store.getState().pageParams.shareId) {
    return !collaborator.userName;
  }
  return !(collaborator.memberName || collaborator.userName);
}
export function backCorrectName(collaborator: ICollaboratorCursor | ICollaborator) {
  if (isAlien(collaborator)) return t(Strings.alien);
  return collaborator.memberName || collaborator.userName || t(Strings.alien);
}

export const CollaboratorMark: React.FC<
  { displayRowIndex: number, collaboratorCell: ICollaboratorCursor[] }
> = ({ displayRowIndex, collaboratorCell }) => {
  if (!collaboratorCell) return null;
  // 1、2 行的协同单元格信息会被表头遮住，显示在单元格下方
  const cellCollaboratorClassName = [1, 2].includes(displayRowIndex) ?
    styles.cellCollaboratorAvatarsUnder : styles.cellCollaboratorAvatars;
  return (
    <div className={cellCollaboratorClassName}>
      {collaboratorCell.map(c => {
        const color = getCollaboratorColor(c);
        if (!c.userId) return <></>;
        return (
          <div key={c.userId} className={styles.avatar}>
            <Tooltip
              title={backCorrectName(c)}
              placement={[0, 1].includes(displayRowIndex) ? 'bottom' : 'top'}
            >
              <div>
                <Avatar
                  src={c.avatar}
                  size={AvatarSize.Size24}
                  id={c.userId}
                  title={backCorrectName(c)}
                  style={{ border: `1px solid ${color}` }}
                />
              </div>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export function renderFillHandle(
  isLastSelectionCell: boolean | undefined,
  actualColumnIndex: number,
) {
  let addStyle: React.CSSProperties = {};
  if (actualColumnIndex === 0) {
    addStyle = { right: -1, borderBottom: `1px solid ${lightColors.primaryColor}`, bottom: -4 };
  }
  return isLastSelectionCell &&
    <div className={styles.fillHandleArea} id={DATASHEET_ID.FILL_HANDLE_AREA} style={{ ...addStyle }} />;
}

// 修正存在分组的前提下，每个分组的rowIndex 从 1 开始，
// 否则则返回默认的rowIndex
export function reviseOperateHeadRowIndex(
  rows: {
    path: number[]; type: string; recordId: string; offset: number; areaIndex: number;
  }[],
  index: number,
  groupInfo: IGroupInfo,
) {
  if (!groupInfo.length) return index + 1;
  if (!rows[index]) return index;
  if (!rows[index].recordId) return index;
  for (let i = index - 1; i >= 0; i--) {
    if (rows[i].type && rows[i].type === CellType.GroupTab) {
      return index - i;
    }
  }
  return index;
}
