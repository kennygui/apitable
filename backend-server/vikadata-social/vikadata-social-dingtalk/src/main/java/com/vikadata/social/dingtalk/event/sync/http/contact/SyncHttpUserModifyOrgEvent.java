package com.vikadata.social.dingtalk.event.sync.http.contact;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import com.vikadata.social.dingtalk.annotation.DingTalkEvent;
import com.vikadata.social.dingtalk.enums.DingTalkEventTag;
import com.vikadata.social.dingtalk.enums.DingTalkSyncAction;

/**
 * <p> 
 * 事件列表 -- 企业修改员工事件之后的员工信息
 * </p> 
 * @author zoe zheng 
 * @date 2021/9/2 3:47 下午
 */
@Setter
@Getter
@ToString
@DingTalkEvent(value = DingTalkEventTag.SYNC_HTTP_PUSH_MEDIUM, action = DingTalkSyncAction.USER_MODIFY_ORG)
public class SyncHttpUserModifyOrgEvent extends BaseOrgUserContactEvent {
}
