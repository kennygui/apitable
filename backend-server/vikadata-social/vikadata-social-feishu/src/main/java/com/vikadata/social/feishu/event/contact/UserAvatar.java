package com.vikadata.social.feishu.event.contact;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 员工头像对象
 *
 * @author Shawn Deng
 * @date 2020-12-24 12:06:10
 */
@Setter
@Getter
public class UserAvatar {

    @JsonProperty("avatar_640")
    private String avatar640;

    @JsonProperty("avatar_origin")
    private String avatarOrigin;

    @JsonProperty("avatar_72")
    private String avatar72;

    @JsonProperty("avatar_240")
    private String avatar240;
}
