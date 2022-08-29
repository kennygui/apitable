package com.vikadata.api.modular.user.mapper;

import java.util.List;

import cn.hutool.core.collection.CollUtil;
import com.vikadata.api.modular.space.model.InviteUserInfo;
import org.apache.ibatis.cursor.Cursor;
import org.junit.jupiter.api.Test;

import com.vikadata.api.AbstractMyBatisMapperTest;
import com.vikadata.api.modular.user.model.UserLangDTO;
import com.vikadata.define.dtos.UserInPausedDto;
import com.vikadata.entity.UserEntity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p>
 *     接口访问层测试：用户表测试
 * </p>
 *
 * @author wuyitao
 * @date 2022/4/5 5:40 PM
 */
public class UserMapperTest extends AbstractMyBatisMapperTest {

    @Autowired
    UserMapper userMapper;

    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectUserNameById() {
        String name = userMapper.selectUserNameById(41L);
        assertThat(name).isEqualTo("41");
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectEmailById() {
        String email = userMapper.selectEmailById(41L);
        assertThat(email).isEqualTo("41@vikadata.com");
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectIdByMobile() {
        Long id = userMapper.selectIdByMobile("41");
        assertThat(id).isEqualTo(41L);
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectByMobile() {
        UserEntity entity = userMapper.selectByMobile("41");
        assertThat(entity).isNotNull();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectByEmail() {
        UserEntity entity = userMapper.selectByEmail("41@vikadata.com");
        assertThat(entity).isNotNull();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectCountByEmail() {
        Integer count = userMapper.selectCountByEmail("41@vikadata.com");
        assertThat(count).isEqualTo(1);
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectByEmails() {
        List<UserEntity> entities = userMapper.selectByEmails(CollUtil.newArrayList("41@vikadata.com"));
        assertThat(entities).isNotEmpty();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectIdByUuid() {
        Long id = userMapper.selectIdByUuid("41");
        assertThat(id).isEqualTo(41L);
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectIdByUuidList() {
        List<Long> ids = userMapper.selectIdByUuidList(CollUtil.newArrayList("41"));
        assertThat(ids).isNotEmpty();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectUuidById() {
        String uuid = userMapper.selectUuidById(41L);
        assertThat(uuid).isEqualTo("41");
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectByIds() {
        List<UserEntity> entities = userMapper.selectByIds(CollUtil.newArrayList(41L));
        assertThat(entities).isNotEmpty();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectAllUserIdByIgnoreDelete() {
        Cursor<Long> entities = userMapper.selectAllUserIdByIgnoreDelete(false);
        assertThat(entities).isNotEmpty();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectEmailByUserIds() {
        List<String> emails = userMapper.selectEmailByUserIds(CollUtil.newArrayList(41L));
        assertThat(emails).isNotEmpty();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectLocaleInEmailsWithDefaultLocale() {
        List<UserLangDTO> entities = userMapper.selectLocaleInEmailsWithDefaultLocale("zh-CN", CollUtil.newArrayList("41@vikadata.com"));
        assertThat(entities).isNotEmpty();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectLocaleByEmail() {
        UserLangDTO userLangDTO = userMapper.selectLocaleByEmail("41@vikadata.com");
        assertThat(userLangDTO).isNotNull();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectLocaleByEmailWithDefaultLocale() {
        UserLangDTO entity = userMapper.selectLocaleByEmailWithDefaultLocale("zh-CN", "41@vikadata.com");
        assertThat(entity).isNotNull();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectLocaleAndEmailByIds() {
        List<UserLangDTO> entities = userMapper.selectLocaleAndEmailByIds(CollUtil.newArrayList(41L));
        assertThat(entities).isNotEmpty();
    }


    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectPausedUsers() {
        List<UserInPausedDto> entities = userMapper.selectPausedUsers(CollUtil.newArrayList(45L));
        assertThat(entities).isNotEmpty();
    }

    @Test
    @Sql("/testdata/user-data.sql")
    void testSelectInviteUserInfoByUserId(){
        Long userId = 41L;
        InviteUserInfo inviteUserInfo = userMapper.selectInviteUserInfoByUserId(userId);
        assertThat(inviteUserInfo.getUserName()).isEqualTo("41");
    }

}
