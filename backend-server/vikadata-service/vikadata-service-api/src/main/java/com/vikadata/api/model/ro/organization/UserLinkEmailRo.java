package com.vikadata.api.model.ro.organization;

import javax.validation.constraints.Pattern;
import javax.validation.constraints.Pattern.Flag;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import com.vikadata.api.constants.PatternConstants;

/**
 * <p>
 * 用户关联受邀邮箱参数
 * </p>
 *
 * @author Shawn Deng
 * @date 2019/12/11 10:23
 */
@Data
@ApiModel("用户关联受邀邮箱参数")
public class UserLinkEmailRo {

    @ApiModelProperty(value = "邮箱地址,严格校验", example = "123456@qq.com", required = true, position = 1)
    @Pattern(regexp = PatternConstants.EMAIL, message = "邮箱格式不正确", flags = Flag.CASE_INSENSITIVE)
    private String email;

    @ApiModelProperty(value = "受邀工作空间", example = "spcyQkKp9XJEl", position = 3)
    private String spaceId;
}
