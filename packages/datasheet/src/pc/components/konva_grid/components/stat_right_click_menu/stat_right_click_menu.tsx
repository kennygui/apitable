
import * as React from 'react';
import { KONVA_DATASHEET_ID, t, Strings } from '@vikadata/core';
import { ContextMenu, useContextMenu, useThemeColors } from '@vikadata/components';
import { CopyOutlined } from '@vikadata/icons';

import { MouseDownType } from 'pc/components/selection_wrapper';
import { stopPropagation } from 'pc/utils/dom';
import { IFieldBoundary } from '../stat_menu';
import { copy2clipBoard, flatContextData } from 'pc/utils';

interface IStatRightClickMenuProps {
  parentRef: React.RefObject<HTMLDivElement> | undefined;
  getBoundary: (e) => IFieldBoundary | null;
}

/**
 * 统计栏的右键菜单
 * 一种konva生成的canvas不支持划选的替代方案
 */
export const StatRightClickMenu = ({
  parentRef,
  getBoundary,
}: IStatRightClickMenuProps): JSX.Element => {
  const [statText, setStatText] = React.useState('');
  const colors = useThemeColors();
  const { show } = useContextMenu({ id: KONVA_DATASHEET_ID.GRID_STAT_RIGHT_CLICK_MENU });

  const showMenu = (e) => {
    if (e.button === MouseDownType.Left) return;

    const fieldBoundary = getBoundary(e);
    if (!fieldBoundary) return;

    const _statText = sessionStorage.getItem('selected_state');
    setStatText(_statText || '');

    const { x, y } = fieldBoundary;
    show(e, {
      id: KONVA_DATASHEET_ID.GRID_STAT_RIGHT_CLICK_MENU,
      position: {
        x,
        y,
      },
    });
  };

  const onCopy = () => {
    if (!statText) return;

    copy2clipBoard(statText);
  };

  React.useEffect(() => {
    const element = parentRef?.current;
    if (!element) return;

    element.addEventListener('contextmenu', showMenu);
    return () => {
      element.removeEventListener('contextmenu', showMenu);
    };
  });

  return (
    <div
      onMouseDown={stopPropagation}
      onWheel={stopPropagation}
      onContextMenu={e => e.preventDefault()}
    >
      <ContextMenu
        menuId={KONVA_DATASHEET_ID.GRID_STAT_RIGHT_CLICK_MENU}
        overlay={flatContextData([[
          {
            icon: <CopyOutlined color={colors.thirdLevelText} />,
            text: t(Strings.copy_link),
            onClick: () => onCopy(),
            disabled: !statText,
          },
        ]], true)}
        width={150}
        menuOffset={[0, -35]}
        // style={{
        //   minWidth: 150,
        //   padding: 0,
        //   transform: 'translateY(-35px)',
        //   width: 150,
        // }}
      />
    </div>
  );
};
