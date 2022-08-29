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
public class DingTalkUserDetailResponse extends BaseResponse {
    private String requestId;

    private DingTalkUserDetail result;
}
