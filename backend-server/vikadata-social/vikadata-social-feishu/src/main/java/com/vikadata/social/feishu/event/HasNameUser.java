package com.vikadata.social.feishu.event;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * 有名称的用户
 *
 * @author Shawn Deng
 * @date 2020-11-26 23:35:14
 */
@Setter
@Getter
@ToString
public class HasNameUser extends UserInfo {

    private String name;

    private String openId;

    private String userId;
}
