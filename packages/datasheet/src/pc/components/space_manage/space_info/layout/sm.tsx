import { useCards } from './cards';
import { Block } from '../components';
import { ILayoutProps } from '../interface';

import styles from './style.module.less';

export const Sm = (props: ILayoutProps) => {

  const {
    AdCard,
    CapacityCard,
    ApiCard,
    FileCard,
    RecordCard,
    MemberCard,
    ViewsCard,
    OthersCard,
    InfoCard,
    LevelCard
  } = useCards(props);

  return <div className={styles.lg} >
    {/* 第一列 */}
    <Block isWrap vertical style={{ maxWidth: '50%' }}>
      <Block flex={43}>
        <InfoCard minHeight={476} />
      </Block>
      <Block flex={27}>
        <CapacityCard />
      </Block>
      <Block flex={27}>
        <RecordCard />
      </Block>
      <Block flex={27}>
        <ViewsCard />
      </Block>
      <Block flex={27}>
        <AdCard />
      </Block>
    </Block>
    {/* 第二列 */}
    <Block isWrap vertical>
      <Block flex={16}>
        <LevelCard minHeight={186} />
      </Block>
      <Block flex={27}>
        <MemberCard minHeight={284} />
      </Block>
      <Block flex={27}>
        <FileCard />
      </Block>
      <Block flex={27}>
        <ApiCard />
      </Block>
      <Block flex={27}>
        <OthersCard />
      </Block>
      <Block flex={27} visible={false} />
    </Block>
  </div>;
};