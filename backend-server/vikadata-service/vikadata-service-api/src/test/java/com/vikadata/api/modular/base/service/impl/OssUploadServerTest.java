package com.vikadata.api.modular.base.service.impl;

import lombok.SneakyThrows;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import com.vikadata.api.AbstractIntegrationTest;
import com.vikadata.api.enums.workbench.WidgetPackageStatus;
import com.vikadata.api.enums.workbench.WidgetPackageType;
import com.vikadata.api.enums.workbench.WidgetReleaseType;
import com.vikadata.api.model.ro.asset.AssetUploadTokenRo;
import com.vikadata.api.model.ro.widget.WidgetPackageBaseRo.I18nField;
import com.vikadata.api.model.vo.asset.AssetUploadTokenVo;
import com.vikadata.api.modular.base.service.IAssetUploadTokenService;
import com.vikadata.api.modular.user.service.IUserService;
import com.vikadata.api.modular.workspace.service.IWidgetPackageService;
import com.vikadata.api.util.IdUtil;
import com.vikadata.entity.UserEntity;
import com.vikadata.entity.WidgetPackageEntity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p>
 * 前端直传单测
 * </p>
 *
 * @author Pengap
 * @date 2022/4/13 14:09:12
 */
public class OssUploadServerTest extends AbstractIntegrationTest {

    @Autowired
    private IAssetUploadTokenService iAssetUploadTokenService;

    @Autowired
    private IWidgetPackageService iWidgetPackageService;

    @Autowired
    private IUserService iUserService;

    @Autowired
    private MockMvc mockMvc;

    private final static String callBackJson = "{\n"
            + "    \"ext\":\".png\",\n"
            + "    \"imageWidth\":\"64\",\n"
            + "    \"fname\":\"生成二维码(生成本地图片).png\",\n"
            + "    \"uploadSource\":0,\n"
            + "    \"uploadDeveloperAssetId\":1514140107337134081,\n"
            + "    \"mimeType\":\"image/png\",\n"
            + "    \"suffix\":\".png\",\n"
            + "    \"uploadAssetId\":1514140107169361922,\n"
            + "    \"imageHeight\":\"64\",\n"
            + "    \"bucket\":\"vk-public-assets-ltd\",\n"
            + "    \"uploadUserId\":1506556359125004289,\n"
            + "    \"spaceId\":\"spc123456\",\n"
            + "    \"fsize\":\"1123\",\n"
            + "    \"nodeId\":\"wpk1w3eEFBR5Z\",\n"
            + "    \"key\":\"widget/wpk1w3eEFBR5Z/生成二维码(生成本地图片).png\",\n"
            + "    \"hash\":\"Fk4-P8ygCfgH1NzoPZSFom-2Nf7W\"\n"
            + "}";

    @Test
    public void testCreateWidgetAssetsUploadAuth() {
        UserEntity testUser = getTestUser();
        WidgetPackageEntity widgetPackage = initWidget(testUser);

        Long opUserId = testUser.getId();
        String nodeId = widgetPackage.getPackageId();
        AssetUploadTokenRo assetUploadTokenRo = new AssetUploadTokenRo();
        assetUploadTokenRo.setPrefixalScope(0);
        assetUploadTokenRo.setAssetsKey("test.jpg");

        AssetUploadTokenVo widgetAssetsUploadAuth = iAssetUploadTokenService.createWidgetAssetsUploadToken(opUserId, nodeId, assetUploadTokenRo);

        assertThat(widgetAssetsUploadAuth).isNotNull();
        assertThat(widgetAssetsUploadAuth.getUploadToken()).isNotNull();
    }

    @Test
    @Disabled("no assert")
    public void testAssetQiniuUploadCallback() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/asset/qiniu/uploadCallback")
                .contextPath("/api/v1")
                .servletPath("/asset/qiniu/uploadCallback")
                .contentType(MediaType.APPLICATION_JSON)
                .content(callBackJson)
                .header("Authorization", "QBox B7OyF1ZORX4iHaqJ5uN62qXAgoDnc7Jv7_zf1SpJ:6GPYOEhFns8hXHHpJYIMyJ4bEcY=")
        )
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value("200"))
                .andReturn();
        // .getResponse().setCharacterEncoding("UTF-8")
    }

    private UserEntity getTestUser() {
        return iUserService.createUserByEmail("test@vikadata.com");
    }

    @SneakyThrows
    private WidgetPackageEntity initWidget(UserEntity testOpUser) {
        I18nField i18nName = new I18nField();
        i18nName.setZhCN("单测小程序");
        i18nName.setEnUS("single_test_applet");

        WidgetPackageEntity widgetPack = new WidgetPackageEntity()
                .setPackageId(IdUtil.createWidgetPackageId())
                .setI18nName(i18nName.toJson())
                .setPackageType(WidgetPackageType.THIRD_PARTY.getValue())
                .setReleaseType(WidgetReleaseType.GLOBAL.getValue())
                // 空间站小程序默认生效，全局小程序默认不生效
                .setIsEnabled(true)
                .setIsTemplate(false)
                .setStatus(WidgetPackageStatus.DEVELOP.getValue())
                .setSandbox(true)
                .setOwner(testOpUser.getId());
        iWidgetPackageService.save(widgetPack);
        return widgetPack;
    }

}
