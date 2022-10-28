import {
  Headline1Filled,
  Headline2Filled,
  Headline3Filled,
  BodyFilled,
  OrderedFilled,
  UnorderedFilled,
  CodeFilled,
  UnderlineFilled,
  StrikethroughFilled,
  BoldFilled,
  ItalicsFilled,
  QuoteFilled,
  HighlightFilled,
  ColumnUrlOutlined,
  TextLeftFilled,
  TextMiddleFilled,
  TextRightFilled,
  TaskListFilled,
  DividingLineFilled,
  CoverOutlined,
  GotoLargeOutlined,
  Brokenlink1Outlined,
  SelectOutlined
} from '@vikadata/icons';

import { colorVars } from '@vikadata/components';

import { ElementType, MarkType, ALIGN } from '../../constant';

import styles from './style.module.less';

const HeadingIcon = ({ depth = 1 }) => {
  return <i className={styles.iconWrap}>
      H<sub>{depth}</sub>
  </i>;
};

interface IIconProps {
  color?: string;
  size?: number;
}

const IconFactor = (Icon) => {
  return ({ color = colorVars.secondLevelText, ...others }: IIconProps) => <Icon color={color} {...others} />;
};

export default {
  [ElementType.PARAGRAPH]: IconFactor(BodyFilled),
  [ElementType.HEADING_ONE]: IconFactor(Headline1Filled),
  [ElementType.HEADING_TWO]: IconFactor(Headline2Filled),
  [ElementType.HEADING_THREE]: IconFactor(Headline3Filled),
  [ElementType.HEADING_FOUR]: IconFactor(() => <HeadingIcon depth={4} />),
  [ElementType.HEADING_FIVE]: IconFactor(() => <HeadingIcon depth={5} />),
  [ElementType.HEADING_SIX]: IconFactor(() => <HeadingIcon depth={6} />),
  [ElementType.ORDERED_LIST]: IconFactor(OrderedFilled),
  [ElementType.UNORDERED_LIST]: IconFactor(UnorderedFilled),
  [ElementType.IMAGE]: IconFactor(CoverOutlined),
  [ElementType.TASK_LIST]: IconFactor(TaskListFilled),
  [ElementType.QUOTE]: IconFactor(QuoteFilled),
  [ElementType.DIVIDER]: IconFactor(DividingLineFilled),
  [ElementType.CODE_BLOCK_WRAP]: IconFactor(CodeFilled),
  // table: '',
  // Inline elements
  [ElementType.LINK]: IconFactor(ColumnUrlOutlined),
  [ElementType.MENTION]: IconFactor(() => <i className={styles.iconWrap}>@</i>),
  [MarkType.ITALIC]: IconFactor(ItalicsFilled),
  [MarkType.UNDERLINE]: IconFactor(UnderlineFilled),
  [MarkType.STRIKE_THROUGH]: IconFactor(StrikethroughFilled),
  [MarkType.BOLD]: IconFactor(BoldFilled),
  [MarkType.INLINE_CODE]: IconFactor(CodeFilled),
  [MarkType.HIGHLIGHT]: IconFactor(HighlightFilled),
  // Alignment method
  [ALIGN.LEFT]: IconFactor(TextLeftFilled),
  [ALIGN.CENTER]: IconFactor(TextMiddleFilled),
  [ALIGN.RIGHT]: IconFactor(TextRightFilled),
  visit: IconFactor(GotoLargeOutlined),
  unlink: IconFactor(Brokenlink1Outlined),
  ok: IconFactor(SelectOutlined)
};