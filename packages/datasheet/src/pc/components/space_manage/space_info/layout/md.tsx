import { useCards } from './cards';
import { Block } from '../components';
import { ILayoutProps } from '../interface';

import styles from './style.module.less';

export const Md = (props: ILayoutProps) => {

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

  return <div className={styles.lg}>
    <Block isWrap vertical style={{ maxWidth: '33.3%' }}>
      <Block flex={43}>
        <InfoCard minHeight={494} />
      </Block>
      <Block flex={27}>
        <RecordCard />
      </Block>
      <Block flex={27}>
        <OthersCard />
      </Block>
    </Block>
    <Block isWrap vertical>
      <Block flex={16}>
        <LevelCard minHeight={176} />
      </Block>
      <Block flex={27}>
        <CapacityCard />
      </Block>
      <Block flex={27}>
        <ApiCard />
      </Block>
      <Block flex={27}>
        <AdCard />
      </Block>
    </Block>
    <Block isWrap vertical>
      <Block flex={16}>
        <MemberCard minHeight={176} />
      </Block>
      <Block flex={27}>
        <FileCard />
      </Block>
      <Block flex={27}>
        <ViewsCard />
      </Block>
      <Block flex={27} visible={false} />
    </Block>
  </div>;
};