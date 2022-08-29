package com.vikadata.api.model.vo.widget;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * <p>
 * 小程序创建结果视图
 * </p>
 *
 * @author Pengap
 * @date 2021/7/9
 */
@Data
@ApiModel("小程序创建结果视图")
public class WidgetReleaseCreateVo {

    @ApiModelProperty(value = "组件包ID", example = "wpkABC", position = 1)
    private String packageId;

}
