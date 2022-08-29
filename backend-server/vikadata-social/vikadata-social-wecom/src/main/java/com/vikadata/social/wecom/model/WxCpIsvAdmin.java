package com.vikadata.social.wecom.model;

import java.util.List;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;
import lombok.Setter;
import me.chanjar.weixin.common.util.json.WxGsonBuilder;
import me.chanjar.weixin.cp.bean.WxCpBaseResp;
import me.chanjar.weixin.cp.util.json.WxCpGsonBuilder;

/**
 * <p>
 * 获取应用的管理员列表
 * </p>
 * @author 刘斌华
 * @date 2022-01-19 14:36:07
 */
@Getter
@Setter
public class WxCpIsvAdmin extends WxCpBaseResp {

    @SerializedName("admin")
    private List<Admin> admin;

    @Getter
    @Setter
    public static class Admin extends WxCpBaseResp {
        private static final long serialVersionUID = -5028321625140879571L;

        @SerializedName("userid")
        private String userId;

        @SerializedName("open_userid")
        private String openUserId;

        @SerializedName("auth_type")
        private Integer authType;

        public String toJson() {

            return WxGsonBuilder.create().toJson(this);

        }

    }

    public static WxCpIsvAdmin fromJson(String json) {

        return WxCpGsonBuilder.create().fromJson(json, WxCpIsvAdmin.class);

    }

    public String toJson() {

        return WxCpGsonBuilder.create().toJson(this);

    }

}
