package com.vikadata.api.modular.workspace.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.map.MapUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.ReUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HtmlUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.extension.toolkit.SqlHelper;
import lombok.extern.slf4j.Slf4j;

import com.vikadata.api.constants.NodeDescConstants;
import com.vikadata.api.enums.exception.DatabaseException;
import com.vikadata.api.model.dto.node.NodeDescDTO;
import com.vikadata.api.model.dto.node.NodeDescParseDTO;
import com.vikadata.api.modular.workspace.mapper.NodeDescMapper;
import com.vikadata.api.modular.workspace.service.INodeDescService;
import com.vikadata.core.util.ExceptionUtil;
import com.vikadata.entity.NodeDescEntity;

import org.springframework.stereotype.Service;

import static com.vikadata.api.constants.NodeDescConstants.DESC_JSON_DATA_IMAGE_URL_PREFIX;
import static com.vikadata.api.constants.NodeDescConstants.DESC_JSON_DATA_NEW_FOD_PREFIX;
import static com.vikadata.api.constants.NodeDescConstants.DESC_JSON_DATA_NEW_PREFIX;
import static com.vikadata.api.constants.NodeDescConstants.DESC_JSON_DATA_TEXT_CHILDREN_PREFIX;
import static com.vikadata.api.enums.exception.DatabaseException.EDIT_ERROR;
import static com.vikadata.api.enums.exception.NodeException.DESCRIPTION_TOO_LONG;

/**
 * <p>
 * 工作台-节点描述表 服务实现类
 * </p>
 *
 * @author Shawn Deng
 * @since 2020-03-17
 */
@Slf4j
@Service
public class NodeDescServiceImpl extends ServiceImpl<NodeDescMapper, NodeDescEntity> implements INodeDescService {

    @Override
    public void edit(String nodeId, String desc) {
        log.info("编辑节点描述");
        if (StrUtil.isEmpty(desc)) {
            baseMapper.updateDescByNodeId(nodeId, desc);
            return;
        }
        int byteLength = desc.getBytes().length;
        ExceptionUtil.isTrue(byteLength <= 65535, DESCRIPTION_TOO_LONG);
        Long id = baseMapper.selectIdByNodeId(nodeId);
        NodeDescEntity nodeDescEntity = NodeDescEntity.builder().id(id).nodeId(nodeId).description(desc).build();
        boolean flag = this.saveOrUpdate(nodeDescEntity);
        ExceptionUtil.isTrue(flag, EDIT_ERROR);
    }

    @Override
    public void copyBatch(Map<String, String> newNodeMap) {
        log.info("复制节点描述");
        if (MapUtil.isEmpty(newNodeMap)) {
            return;
        }
        List<NodeDescDTO> dtoList = baseMapper.selectByNodeIds(newNodeMap.keySet());
        if (CollUtil.isEmpty(dtoList)) {
            return;
        }
        List<NodeDescEntity> entities = new ArrayList<>(dtoList.size());
        for (NodeDescDTO dto : dtoList) {
            NodeDescEntity entity = NodeDescEntity.builder()
                    .id(IdWorker.getId())
                    .nodeId(newNodeMap.get(dto.getNodeId()))
                    .description(dto.getDescription())
                    .build();
            entities.add(entity);
        }
        boolean flag = SqlHelper.retBool(baseMapper.insertBatch(entities));
        ExceptionUtil.isTrue(flag, DatabaseException.INSERT_ERROR);
    }

    @Override
    public Map<String, String> getNodeIdToDescMap(List<String> nodeIds) {
        log.info("获取节点及对应描述");
        if (CollUtil.isNotEmpty(nodeIds)) {
            List<NodeDescDTO> dtoList = baseMapper.selectByNodeIds(nodeIds);
            return dtoList.stream().collect(Collectors.toMap(NodeDescDTO::getNodeId, NodeDescDTO::getDescription));
        }
        return null;
    }

    @Override
    public void insertBatch(List<NodeDescEntity> nodeDescList) {
        log.info("批量新增节点描述");
        if (CollUtil.isNotEmpty(nodeDescList)) {
            boolean flag = SqlHelper.retBool(baseMapper.insertBatch(nodeDescList));
            ExceptionUtil.isTrue(flag, DatabaseException.INSERT_ERROR);
        }
    }

    /**
     * 解析节点的描述desc
     *
     * @param destDstId 节点ID
     * @return NodeDescParseDto
     * @author zoe zheng
     * @date 2020/5/19 3:17 下午
     */
    @Override
    public NodeDescParseDTO parseNodeDescByNodeId(String destDstId) {
        List<String> content = new ArrayList<>();
        List<String> imageUrl = new ArrayList<>();
        String nodeDesc = baseMapper.selectDescriptionByNodeId(destDstId);
        if (StrUtil.isNotBlank(nodeDesc)) {
            Object desc = JSONUtil.getByPath(JSONUtil.parse(nodeDesc), NodeDescConstants.DESC_JSON_DATA_PREFIX);
            // 兼容旧数据node的描述和datasheet的描述json存入格式不统一
            JSONArray descJsonArray = ObjectUtil.isNotNull(desc) ? JSONUtil.parseArray(desc) : JSONUtil
                    .parseArray(JSONUtil.getByPath(JSONUtil.parse(nodeDesc), NodeDescConstants.DESC_JSON_RENDER_PREFIX));
            if (ObjectUtil.isNotEmpty(descJsonArray) && !CollUtil.hasNull(descJsonArray)) {
                for (Object o : descJsonArray) {
                    Object descText = JSONUtil.parse(o).getByPath(NodeDescConstants.DESC_JSON_DATA_TEXT_PREFIX);
                    if (descText instanceof String) {
                        String reStr = HtmlUtil.escape(
                                ReUtil.replaceAll(descText.toString(), NodeDescConstants.DESC_JSON_DATA_ESCAPE_RE, " "));
                        if (StrUtil.isNotBlank(reStr)) {
                            content.add(reStr);
                        }
                    }
                    else {
                        // 获取image的标签
                        Object imageObj =
                                JSONUtil.parse(descText).getByPath(NodeDescConstants.DESC_JSON_DATA_IMAGE_PREFIX);
                        if (null != imageObj) {
                            imageUrl.add(imageObj.toString());
                        }
                    }
                }
            }
            else {
                // 兼容现在的数据
                Object newDesc = JSONUtil.getByPath(JSONUtil.parseObj(nodeDesc), DESC_JSON_DATA_NEW_FOD_PREFIX);
                // 兼容文件夹描述
                if (ObjectUtil.isNull(newDesc)) {
                    newDesc = JSONUtil.getByPath(JSONUtil.parseObj(nodeDesc), DESC_JSON_DATA_NEW_PREFIX);
                }
                if (ObjectUtil.isNotNull(newDesc)) {
                    JSONArray descArray = JSONUtil.parseArray(newDesc);
                    if (!CollUtil.hasNull(descArray)) {
                        JSONArray textArray = JSONUtil.parseArray(descArray.getByPath(DESC_JSON_DATA_TEXT_CHILDREN_PREFIX));
                        JSONArray imageArray = JSONUtil.parseArray(descArray.getByPath(DESC_JSON_DATA_IMAGE_URL_PREFIX));
                        if (CollUtil.isNotEmpty(textArray)) {
                            for (Object text : textArray) {
                                JSONArray tmp = JSONUtil.parseArray(text);
                                String reStr = CollUtil.hasNull(tmp) ? ""
                                        : HtmlUtil.escape(ReUtil.replaceAll(StrUtil.join("", tmp), NodeDescConstants.DESC_JSON_DATA_ESCAPE_RE, " "));
                                if (StrUtil.isNotBlank(reStr)) {
                                    content.add(reStr);
                                }
                            }
                        }
                        if (CollUtil.isNotEmpty(imageArray)) {
                            for (Object url : imageArray) {
                                if (ObjectUtil.isNotNull(url)) {
                                    imageUrl.add(url.toString());
                                }
                            }
                        }
                    }
                }
            }
        }
        return NodeDescParseDTO.builder().content(content).imageUrl(imageUrl).build();
    }
}
