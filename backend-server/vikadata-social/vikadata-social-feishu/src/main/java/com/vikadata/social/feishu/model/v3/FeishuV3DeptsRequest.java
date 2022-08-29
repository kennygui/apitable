package com.vikadata.social.feishu.model.v3;

import lombok.Getter;
import lombok.Setter;

/**
 * <p>
 * 获取部门列表信息
 * 查询参数
 * </p>
 *
 * @author Shawn Deng
 * @date 2020/12/7 11:10
 */
@Getter
@Setter
public class FeishuV3DeptsRequest {

    private String userIdType;

    private String departmentIdType;

    private String parentDepartmentId;

    private Integer pageSize = 50;

    private String pageToken;

    private Boolean fetchChild = true;
}
