import { IServerMirror, ISourceDatasheetInfo, INodeMeta, IMirrorSnapshot } from '@vikadata/core';

export class MirrorInfo implements IServerMirror {
  mirror: INodeMeta;
  sourceInfo: ISourceDatasheetInfo;
  snapshot: IMirrorSnapshot;
}
