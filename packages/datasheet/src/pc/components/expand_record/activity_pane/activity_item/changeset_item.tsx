import { usePlatform } from 'pc/hooks/use_platform';
import { useContext, useMemo } from 'react';
import * as React from 'react';
import { IActivityPaneProps, IChooseComment } from '../activity_pane';
import { CollaCommandName, IDPrefix, IJOTAction, IOperation, IRemoteChangeset, IUnitValue, jot, Strings, t, WithOptional } from '@vikadata/core';
import { Avatar, AvatarSize, Emoji, Modal } from 'pc/components/common';
import { useSelector } from 'react-redux';
import styles from './style.module.less';
import dayjs from 'dayjs';
import { commandTran } from 'pc/utils';
import { Popover, Tooltip } from 'antd';
import { useResponsive } from 'pc/hooks';
import { ScreenSize } from 'pc/components/common/component_display/component_display';
import { ChangesetItemAction } from './changeset_item_action';
import { find, get, toPairs } from 'lodash';
import { IconButton } from '@vikadata/components';
import cls from 'classnames';
import { EXPAND_RECORD_ACTIVITY_ITEM, EXPAND_RECORD_DELETE_COMMENT_MORE } from 'pc/utils/test_id_constant';
import { CommentOutlined, DeleteOutlined, EmojiOutlined } from '@vikadata/icons';
import { resourceService } from 'pc/resource_service';
import { ActivityContext } from '../activity_context';
import { ReplyBox } from 'pc/components/expand_record/activity_pane/reply_box/reply_box';
import { getSocialWecomUnitName } from 'pc/components/home/social_platform';

type IChangesetItem = IActivityPaneProps & {
  unit: IUnitValue | undefined;
  changeset: WithOptional<IRemoteChangeset, 'messageId' | 'resourceType'>;
  cacheFieldOptions: object;
  datasheetId: string;
  setChooseComment: (item: IChooseComment) => void;
};

const ChangesetItemBase: React.FC<IChangesetItem> = (props) => {
  const { expandRecordId, changeset, cacheFieldOptions, datasheetId, setChooseComment, unit } = props;
  const { operations, userId, createdAt, revision } = changeset;

  const { mobile: isMobile } = usePlatform();

  const { setReplyText, emojis, setFocus, setReplyUnitId } = useContext(ActivityContext);
  const spaceInfo = useSelector(state => state.space.curSpaceInfo);

  // 拿到 operations 所有的 actions
  const actions = operations.reduce((actionArr: IJOTAction[], op: IOperation) => {
    let { actions } = op;
    /**
     * 添加行包含默认值处理
     *
     * [{ n: 'OI', oi: { fieldId1: val1, fieldId2: val2 }, p: ['recordMap', 'recId'] }]
     * =>
     * [
     *  { n: 'OI', oi: val1, p: ['recordMap', 'recId', 'data', fieldId1] },
     *  { n: 'OI', oi: val2, p: ['recordMap', 'recId', 'data', fieldId2] }
     * ]
     */
    const { n, oi, p } = actions[0] as any;
    if (oi && p.length === 2 && p[0] === 'recordMap' && p[1].startsWith(IDPrefix.Record)) {
      actions = toPairs(get(oi, 'data', {})).map(([k, v]) => ({
        n,
        oi: v,
        p: [...p, 'data', k]
      }));
    }
    actionArr = actionArr.concat(actions);
    return actionArr;
  }, []);
  const { cmd } = operations[0];

  const selfUserId = useSelector(state => state.user.info?.userId);
  const isSelf = selfUserId === userId;
  const relativeTime = dayjs(Number(createdAt)).fromNow();

  const allowDeleteComment = useSelector(state => {
    const spacePermissions = state.spacePermissionManage.spaceResource?.permissions;
    const isSpaceAdmin = spacePermissions && spacePermissions.includes('MANAGE_WORKBENCH');
    return Boolean(isSpaceAdmin || isSelf);
  });

  const { screenIsAtLeast } = useResponsive();

  const [commentOperations, restOperations] = useMemo(() => {
    // 区分评论操作、其他操作
    const commentOps: IOperation[] = [];
    const restOps: IOperation[] = [];
    operations.forEach(op => {
      if ([CollaCommandName.InsertComment, CollaCommandName.SystemCorrectComment].includes(op.cmd as CollaCommandName)) {
        commentOps.push(op);
      } else {
        restOps.push(op);
      }
    });
    return [commentOps, restOps];
  }, [operations]);

  const itemArray = useMemo(() => {
    let itemActions: (IJOTAction | number | undefined)[] = [];
    // 多条评论合并一起发送时，需要分成多条记录展示
    if (commentOperations.length > 0) {
      const systemOp = find(commentOperations, { cmd:  CollaCommandName.SystemCorrectComment });
      // SystemCorrectComment 服务端更新修正评论时间
      if (systemOp) {
        const serverFixActions = systemOp.actions.map((at, idx) => ({
          ...at,
          p: [idx]
        }));
        // InsertComment 客户端添加评论
        const clientActions = commentOperations.filter(op => !op.cmd.includes('System')).map((op, idx) => ({
          ...op.actions[0],
          p: [idx],
        }));
        itemActions = jot.apply(clientActions, serverFixActions) as unknown as IJOTAction[];
      } else {
        itemActions = commentOperations.map(op => get(op, 'actions.0.li'));
      }
    }
    if (restOperations.length > 0) {
      // 过滤系统 op，用 undefined 占位标记非评论操作
      itemActions = itemActions.concat(restOperations.filter(op => !op.cmd.includes('System')).map(() => undefined));
    }
    return itemActions;
  }, [commentOperations, restOperations]);

  if (!unit) {
    return <></>;
  }

  const handleEmoji = (emojiKey: string) => {
    const comment = get(changeset, 'operations.0.actions.0.li');
    const { commentMsg, commentId } = comment;
    const emojiUsers = get(emojis, `${commentId}.${emojiKey}`, []) as string[];

    resourceService.instance!.commandManager.execute({
      cmd: CollaCommandName.UpdateComment,
      datasheetId: datasheetId,
      recordId: expandRecordId,
      comments: {
        ...comment,
        commentMsg: {
          ...commentMsg,
          emojis: {
            [emojiKey]: [selfUserId]
          }
        }
      },
      // emojiAction 为 false 表示取消点赞
      emojiAction: !emojiUsers.includes(selfUserId!)
    });
  };

  const handleReply = () => {
    setFocus(true);
    const unitId = get(changeset, 'operations.0.actions.0.li.unitId');
    const commentContent = get(changeset, 'operations.0.actions.0.li.commentMsg.content');
    const commentId = get(changeset, 'operations.0.actions.0.li.commentId');
    setReplyUnitId(unitId);
    setReplyText({
      ...commentContent,
      commentId,
    });
  };

  const title = getSocialWecomUnitName({
    name: unit?.name,
    isModified: unit?.isMemberNameModified,
    spaceInfo
  });

  return (
    <>
      {itemArray.map((action, idx) => (
        <div
          data-test-id={EXPAND_RECORD_ACTIVITY_ITEM}
          key={`${revision}-${idx}`}
          className={cls(styles.activityItem, { [styles.changeset]: !action })}
        >
          <div className={styles.activityHeader}>
            <div className={styles.activityHeaderLeft}>
              {<Avatar
                id={unit.unitId}
                title={unit.name}
                src={unit.avatar}
                size={screenIsAtLeast(ScreenSize.md) ? AvatarSize.Size32 : AvatarSize.Size40}
              />}
            </div>
            <div className={cls('activityHeaderRight', styles.activityHeaderRight)}>
              <div className={styles.title}>
                <div className={styles.activityInfo}>
                  <div className={styles.nickName}>
                    <span className={styles.name}>{isSelf ? t(Strings.you) : (title || unit.name)}</span>
                    <span className={styles.op}>{commandTran(cmd)}</span>
                  </div>
                  {Boolean(action) && (
                    <div className={styles.activityAction}>
                      <Popover
                        overlayClassName={styles.commentPopover}
                        content={(
                          <div className={styles.emojiList}>
                            <span onClick={() => handleEmoji('good')}>
                              <Emoji emoji="+1" size={16} />
                            </span>
                            <span onClick={() => handleEmoji('ok')}>
                              <Emoji emoji="ok_hand" size={16} />
                            </span>
                          </div>
                        )}>
                        <IconButton
                          icon={EmojiOutlined}
                          shape="square"
                          className={styles.icon}
                        />
                      </Popover>
                      <IconButton
                        onClick={handleReply}
                        icon={CommentOutlined}
                        shape="square"
                        className={cls('replyIcon', styles.icon)}
                      />
                      {allowDeleteComment && <IconButton
                        onClick={(e) => {
                          const commentItem = {
                            comment: get(changeset, 'operations.0.actions.0.li'),
                            expandRecordId,
                            datasheetId,
                            setChooseComment,
                          };
                          if (isMobile) {
                            setChooseComment(commentItem);
                          } else {
                            Modal.confirm({
                              title: t(Strings.delete_comment_tip_title),
                              content: t(Strings.delete_comment_tip_content),
                              okText: t(Strings.submit),
                              cancelText: t(Strings.cancel),
                              type: 'danger',
                              onOk: () => {
                                resourceService.instance!.commandManager.execute({
                                  cmd: CollaCommandName.DeleteComment,
                                  datasheetId: datasheetId,
                                  recordId: expandRecordId,
                                  comment: commentItem.comment,
                                });
                              },
                            });
                          }
                        }}
                        shape="square"
                        icon={DeleteOutlined}
                        className={styles.icon}
                        data-test-id={EXPAND_RECORD_DELETE_COMMENT_MORE}
                      />}
                    </div>
                  )}
                </div>
                <div className={styles.activityInfo}>
                  <Tooltip title={dayjs(Number(createdAt)).format('YYYY-MM-DD HH:mm:ss')}>
                    <span className={styles.relativeTime}>
                      {relativeTime}
                    </span>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.activityBody}>
            {action ? (
              <ReplyBox action={action} handleEmoji={handleEmoji} datasheetId={datasheetId} expandRecordId={expandRecordId} />
            ) : (
              <ChangesetItemAction
                revision={revision}
                actions={actions}
                datasheetId={datasheetId}
                cacheFieldOptions={cacheFieldOptions}
              />
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export const ChangesetItem = React.memo(ChangesetItemBase);
