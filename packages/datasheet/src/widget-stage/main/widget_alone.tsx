import { WidgetStandAloneProvider } from '@vikadata/widget-sdk';
import { useWidgetComponent } from '@vikadata/widget-sdk/dist/hooks/private/use_widget_loader';
import { Button, TextInput } from '@vikadata/components';
import { useLocalStorageState } from 'ahooks';
import styles from './style.module.less';

function WidgetAlone() {
  const [datasheetId, setDatasheetId] = useLocalStorageState<string>('datasheetId');
  const [widgetId, setWidgetId] = useLocalStorageState<string>('widgetId');
  const [codeUrl, setCodeUrl] = useLocalStorageState<string>('codeUrl');
  const [WidgetComponent, refresh] = useWidgetComponent(codeUrl);

  return (
    <div className={styles.main}>
      <div className={styles.config}>
          输入 integration 的 datasheetId:
        <TextInput type="text" value={datasheetId} onChange={e => setDatasheetId(e.target.value)} />
          widgetId:
        <TextInput type="text" value={widgetId} onChange={e => setWidgetId(e.target.value)} />
      </div>
      <div className={styles.config}>
          输入小组件代码地址：
        <TextInput type="text" value={codeUrl} onChange={e => setCodeUrl(e.target.value)} />
        <Button color="primary" onClick={() => refresh()}>刷新</Button>
      </div>
      {datasheetId && widgetId && <div className={styles.widgetStage}>
        <WidgetStandAloneProvider id={widgetId} datasheetId={datasheetId} >
          {WidgetComponent && <WidgetComponent />}
        </WidgetStandAloneProvider>
      </div>
      }
    </div>
  );
}

export default WidgetAlone;
