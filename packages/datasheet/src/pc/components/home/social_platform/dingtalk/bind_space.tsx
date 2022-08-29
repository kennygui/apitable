import { Api, Navigation, Strings, t } from '@vikadata/core';
import { useMount } from 'ahooks';
import { Loading, Message } from 'pc/components/common';
import { useNavigation } from 'pc/components/route_manager/use_navigation';
import { useQuery, useRequest } from 'pc/hooks';

const DingTalkBindSpace = () => {
  const query = useQuery();
  const navigationTo = useNavigation();
  const suiteId = query.get('suiteId') || '';
  const corpId = query.get('corpId') || '';
  const bizAppId = query.get('bizAppId') || '';

  const { run } = useRequest(() => Api.dingTalkBindSpace(suiteId, corpId), {
    onSuccess: res => {
      const { data, success } = res.data;

      if (!success || !data?.bindSpaceId) {
        return navigationTo({
          path: Navigation.DINGTALK,
          params: { dingtalkPath: 'social_login' },
          query: { suiteId, corpId, bizAppId },
          clearQuery: true
        });
      }
      // 应用已经绑定了空间
      // return window.location.href = `/workbench/${bizAppId}?spaceId=${data.bindSpaceId}`;
      return navigationTo({
        path: Navigation.WORKBENCH,
        params: { spaceId: data.bindSpaceId, nodeId: bizAppId },
        query: { spaceId: data.bindSpaceId },
        clearQuery: true
      });
    },
    onError: () => {
      Message.error({ content: t(Strings.error) });
    },
    manual: true
  });

  useMount(() => {
    if (suiteId) {
      run();
    }
  });

  return <Loading />;
};
export default DingTalkBindSpace;
