import { Field, IAttachmentValue, IField, Selectors, ViewType } from '@apitable/core';
import classNames from 'classnames';
import Image from 'next/image';
import { DisplayFile } from 'pc/components/display_file';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './style.module.less';

export enum ImageShowType {
  Thumbnail = 'thumbnail',
  Marquee = 'marquee',
}

const SHOW_IMAGE_MAX_COUNT = 6;

interface IImageBoxProps {
  images: string[];
  showType?: ImageShowType;
  style?: React.CSSProperties;
  height?: number;
  width?: number;
  isCoverFit?: boolean;
  fileList: IAttachmentValue[];
  recordId: string;
  field: IField;
  showOneImage?: boolean;
}

export const ImageBox: React.FC<IImageBoxProps> = ({
  images, showType = ImageShowType.Thumbnail, style, width, fileList, height, recordId, field, showOneImage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const permissions = useSelector(state => Selectors.getPermissions(state));
  const currentView = useSelector(Selectors.getCurrentView);
  const isGalleryView = currentView!.type === ViewType.Gallery;
  const imgWidthDiff = isGalleryView ? 2 : 4;

  useEffect(() => {
    setCurrentIndex(0);
  }, [recordId]);

  const showImages = images.slice(0, showOneImage ? 1 : SHOW_IMAGE_MAX_COUNT);
  const marqueeWrapperWidth = showImages.length * 16 + 8;
  const imgWidth = Math.floor((width! - 200) / 6);
  const thumbHeight = imgWidth * 4 / 3;
  const editable = Field.bindModel(field).recordEditable() && permissions.cellEditable;

  return (
    <div style={{ height }} className={styles.imageBox}>
      <DisplayFile
        fileList={fileList}
        index={currentIndex}
        style={{ border: 'none' }}
        imageStyle={{
          ...style,
          border: 'none',
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
        height={height!}
        width={width! - imgWidthDiff}
        setPreviewIndex={setCurrentIndex}
        recordId={recordId}
        field={field}
        editable={editable}
      />
      <div className={styles.bottomWrapper} />
      {
        showImages.length > 1 && <>
          {
            showType === ImageShowType.Thumbnail ?
              <div className={styles.indexThumbnailWrapper}>
                {showImages.map((imgSrc, index) => <span
                  className={classNames(styles.thumbnailItem, {
                    [styles.activeThumb]: index === currentIndex,
                  })}
                  onMouseOver={() => {
                    setCurrentIndex(index);
                  }}
                  style={{
                    height: thumbHeight,
                    width: imgWidth,
                  }}
                >
                  <Image
                    key={imgSrc + index}
                    src={imgSrc}
                    height={thumbHeight}
                    width={imgWidth}
                  />
                </span>)}
              </div> :
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className={styles.indexMarqueeWrapper} style={{ width: marqueeWrapperWidth }}>
                  {
                    showImages.map((imgSrc, index) =>
                      <div
                        key={index}
                        onMouseOver={() => setCurrentIndex(index)}
                        className={classNames(styles.marqueeItem, {
                          [styles.active]: index === currentIndex,
                        })}
                      />,
                    )
                  }
                </div>
              </div>
          }
        </>
      }
    </div>
  );
};
