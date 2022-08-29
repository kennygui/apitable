import { Rate } from 'pc/components/common/rate';
import classNames from 'classnames';
import { useState } from 'react';
import * as React from 'react';
import { ICellComponentProps } from '../cell_value/interface';
import styles from './style.module.less';
import { Emoji } from 'pc/components/common/emoji';
import { ConfigConstant, IRatingField } from '@vikadata/core';

interface ICellRating extends ICellComponentProps {
  field: IRatingField;
}

export const CellRating: React.FC<ICellRating> = props => {
  const { className, field, cellValue, isActive, onChange, readonly } = props;
  // 第一次激活评分单元格，不更新值。（防误触）
  const [lock, setLock] = useState(true);
  const handleChange = (value: number | null) => {
    !lock && isActive && onChange && onChange(value);
  };
  return (
    <div
      onClickCapture={() => setLock(false)}
      className={classNames(className, styles.ratingCell, 'ratingCell', { [styles.activeCell]: isActive })}
    >
      {
        isActive && !readonly ? <Rate
          value={cellValue as number}
          character={<Emoji emoji={field.property.icon} set="apple" size={ConfigConstant.CELL_EMOJI_SIZE} />}
          max={field.property.max}
          onChange={handleChange}
        /> :
          Boolean(cellValue) && <Rate
            value={cellValue as number}
            character={<Emoji emoji={field.property.icon} set="apple" size={ConfigConstant.CELL_EMOJI_SIZE} />}
            max={field.property.max}
            disabled
          />
      }
    </div>
  );
};
