import { useCallback, useMemo } from 'react';
import * as React from 'react';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import { Transforms } from 'slate';
import { useReadOnly, useSlate, ReactEditor } from 'slate-react';

import { IElement, IElementRenderProps } from '../../interface/element';

import styles from './divider.module.less';

const Divider = React.memo(({ children, element }: IElementRenderProps<IElement>) => {

  const readOnly = useReadOnly();
  const editor = useSlate() as ReactEditor;

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const path = ReactEditor.findPath(editor, element);
      Transforms.removeNodes(editor, { at: path });
    } catch (error) {
      console.log(error);
    }
  }, [editor, element]);

  const DotList = useMemo(() => {
    return Array(4).fill('').map((item, idx) => <i key={idx} className={styles.dot} />);
  }, []);

  return <div className={styles.wrap}>
    <div contentEditable={false} className={styles.divider}>
      {
        DotList
      }
      {
        !readOnly && <DeleteOutlined className={styles.deleteBtn} onMouseDown={handleDelete}/>
      }
    </div>
    {children}
  </div>;
});

export default Divider;