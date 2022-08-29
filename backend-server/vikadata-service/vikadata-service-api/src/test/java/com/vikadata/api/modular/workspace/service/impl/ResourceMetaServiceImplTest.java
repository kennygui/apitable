package com.vikadata.api.modular.workspace.service.impl;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import javax.annotation.Resource;

import cn.hutool.core.io.IoUtil;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import com.vikadata.api.AbstractIntegrationTest;
import com.vikadata.api.model.dto.node.NodeDescParseDTO;
import com.vikadata.api.modular.workspace.service.IResourceMetaService;

import org.springframework.core.io.ClassPathResource;

/**
 * <p>
 * resource meta service test
 * </p>
 * @author zoe zheng
 * @date 2022/5/17 19:01
 */
public class ResourceMetaServiceImplTest extends AbstractIntegrationTest {

    @Resource
    private IResourceMetaService iResourceMetaService;

    @Test
    public void testParsFormDescWithNull() {
        NodeDescParseDTO desc = iResourceMetaService.parseFormDescByFormId(IdWorker.getIdStr());
        Assertions.assertEquals(0, desc.getContent().size());
    }

    @Test
    public void testParsFormDescWithText() {
        String formId = IdWorker.get32UUID();
        prepareFormMetaData(formId, "meta/form_text_meta.json");
        NodeDescParseDTO desc = iResourceMetaService.parseFormDescByFormId(formId);
        Assertions.assertTrue(desc.getContent().size() > 0);
        Assertions.assertEquals("测试", desc.getContent().get(0));
    }

    @Test
    public void testParsFormDescWithUrl() {
        String formId = IdWorker.get32UUID();
        prepareFormMetaData(formId, "meta/form_url_meta.json");
        NodeDescParseDTO desc = iResourceMetaService.parseFormDescByFormId(formId);
        Assertions.assertTrue(desc.getContent().size() > 0);
        Assertions.assertEquals("https://vika.cn", desc.getContent().get(0));
    }

    @Test
    public void testParsFormDescWithTextHasBlank() {
        String formId = IdWorker.get32UUID();
        prepareFormMetaData(formId, "meta/form_text_blank_meta.json");
        NodeDescParseDTO desc = iResourceMetaService.parseFormDescByFormId(formId);
        Assertions.assertTrue(desc.getContent().size() > 0);
        Assertions.assertEquals("测试 测试", desc.getContent().get(0));
    }

    private void prepareFormMetaData(String formId, String fileName) {
        InputStream resourceAsStream = ClassPathResource.class.getClassLoader().getResourceAsStream(fileName);
        if (resourceAsStream == null) {
            return;
        }
        String jsonString = IoUtil.read(resourceAsStream, StandardCharsets.UTF_8);
        iResourceMetaService.create(null, formId, 1, jsonString);
    }
}
