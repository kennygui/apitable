package com.vikadata.social.dingtalk.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 用户信息
 *
 * @author Zoe Zheng
 * @date 2021-04-20 10:56:04
 */
@Setter
@Getter
@ToString
public class DingTalkSendMessageRequest {
    /**
     * 群会话的ID
     */
    private String chatid;

    /**
     * 消息内容，最长不超过2048个字节
     */
    private Object msg;
}
