package com.vikadata.api.modular.social.mapper;

import java.util.List;

import cn.hutool.core.collection.CollUtil;
import org.junit.jupiter.api.Test;

import com.vikadata.api.AbstractMyBatisMapperTest;
import com.vikadata.entity.SocialTenantDepartmentBindEntity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p>
 *     数据访问层测试：第三方平台集成-企业租户部门关联表测试
 * </p>
 * @author wuyitao
 * @date 2022/4/4 4:42 PM
 */
public class SocialTenantDepartmentBindMapperTest extends AbstractMyBatisMapperTest {

    @Autowired
    SocialTenantDepartmentBindMapper socialTenantDepartmentBindMapper;

    @Test
    @Sql("/testdata/social-tenant-department-bind-data.sql")
    void testSelectTeamIdByTenantDepartmentId() {
        Long id = socialTenantDepartmentBindMapper.selectTeamIdByTenantDepartmentId("spc41", "ww41", "di41");
        assertThat(id).isEqualTo(41L);
    }

    @Test
    @Sql("/testdata/social-tenant-department-bind-data.sql")
    void testSelectTeamIdsByTenantDepartmentId() {
        List<Long> ids = socialTenantDepartmentBindMapper.selectTeamIdsByTenantDepartmentId("spc41", "ww41", CollUtil.newArrayList("di41"));
        assertThat(ids).isNotEmpty();
    }

    @Test
    @Sql("/testdata/social-tenant-department-bind-data.sql")
    void testSelectByTenantId() {
        List<SocialTenantDepartmentBindEntity> entities = socialTenantDepartmentBindMapper.selectByTenantId("ww41", "spc41");
        assertThat(entities).isNotEmpty();
    }

    @Test
    @Sql("/testdata/social-tenant-department-bind-data.sql")
    void testSelectSpaceTeamIdByTenantIdAndDepartmentId() {
        Long id = socialTenantDepartmentBindMapper.selectSpaceTeamIdByTenantIdAndDepartmentId("spc41", "ww41", "di41");
        assertThat(id).isEqualTo(41L);
    }

    @Test
    @Sql("/testdata/social-tenant-department-bind-data.sql")
    void testSelectSpaceTeamIdsByTenantIdAndDepartmentId() {
        List<Long> ids = socialTenantDepartmentBindMapper.selectSpaceTeamIdsByTenantIdAndDepartmentId("spc41", "ww41", CollUtil.newArrayList("di41"));
        assertThat(ids).isNotEmpty();
    }

}
