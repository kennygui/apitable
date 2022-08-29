package com.vikadata.api.modular.workspace.service.impl;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import javax.annotation.Resource;

import cn.hutool.core.codec.Base64;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.io.IoUtil;
import cn.hutool.core.map.MapUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.DigestAlgorithm;
import cn.hutool.crypto.digest.Digester;
import cn.hutool.json.JSONException;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import lombok.extern.slf4j.Slf4j;

import com.vikadata.api.cache.service.UserSpaceService;
import com.vikadata.api.enums.exception.ParameterException;
import com.vikadata.api.enums.exception.PermissionException;
import com.vikadata.api.model.dto.space.NodeAssetDto;
import com.vikadata.api.model.ro.datasheet.DataSheetCreateRo;
import com.vikadata.api.model.ro.datasheet.MetaMapRo;
import com.vikadata.api.model.ro.datasheet.SnapshotMapRo;
import com.vikadata.api.model.vo.node.NodeShareTree;
import com.vikadata.api.modular.space.mapper.SpaceAssetMapper;
import com.vikadata.api.modular.space.service.ISpaceAssetService;
import com.vikadata.api.modular.workspace.mapper.NodeMapper;
import com.vikadata.api.modular.workspace.model.Manifest;
import com.vikadata.api.modular.workspace.model.NodeDataFile;
import com.vikadata.api.modular.workspace.model.NodeFileTree;
import com.vikadata.api.modular.workspace.service.IDatasheetService;
import com.vikadata.api.modular.workspace.service.INodeDescService;
import com.vikadata.api.modular.workspace.service.INodeService;
import com.vikadata.api.modular.workspace.service.VikaBundleService;
import com.vikadata.api.util.ExportUtil;
import com.vikadata.api.util.IdUtil;
import com.vikadata.api.util.RandomExtendUtil;
import com.vikadata.core.exception.BusinessException;
import com.vikadata.core.support.tree.DefaultTreeBuildFactory;
import com.vikadata.core.util.ExceptionUtil;
import com.vikadata.define.enums.NodeType;
import com.vikadata.entity.NodeDescEntity;
import com.vikadata.entity.NodeEntity;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import static com.vikadata.api.enums.exception.ActionException.FILE_EMPTY;
import static com.vikadata.api.enums.exception.ActionException.FILE_ERROR_CONTENT;
import static com.vikadata.api.enums.exception.ActionException.FILE_ERROR_PASSWORD;

/**
 * <p>
 * Vika Bundle 服务实现类
 * </p>
 *
 * @author Chambers
 * @date 2020/4/15
 */
@Slf4j
@Service
public class VikaBundleServiceImpl implements VikaBundleService {

    @Resource
    private INodeService iNodeService;

    @Resource
    private INodeDescService iNodeDescService;

    @Resource
    private NodeMapper nodeMapper;

    @Resource
    private IDatasheetService iDatasheetService;

    @Resource
    private ISpaceAssetService iSpaceAssetService;

    @Resource
    private SpaceAssetMapper spaceAssetMapper;

    @Resource
    private PasswordEncoder passwordEncoder;

    @Resource
    private UserSpaceService userSpaceService;

    private static final String MANIFEST = "manifest.json";

    private static final String DATA_DIR = "data";

    private static final String ASSET_DIR = "assets";

    @Override
    public void generate(String nodeId, boolean saveData, String password) {
        log.info("生成vika文件");
        // 校验节点是否存在
        NodeEntity node = nodeMapper.selectByNodeId(nodeId);
        ExceptionUtil.isNotNull(node, PermissionException.NODE_ACCESS_DENIED);
        // 创建随机临时目录，避免同节点被同时使用
        String dir = RandomExtendUtil.randomString(6);
        Digester md5 = new Digester(DigestAlgorithm.MD5);
        List<File> files = new ArrayList<>();
        // 向下遍历所有节点
        List<String> nodeIds = CollUtil.newArrayList(nodeId);
        Map<String, String> nodeIdToFileNameMap = CollUtil.newHashMap();
        List<NodeShareTree> childrenList = new ArrayList<>();
        if (node.getType() < NodeType.DATASHEET.getNodeType()) {
            childrenList = nodeMapper.selectShareTreeByNodeId(node.getSpaceId(), nodeId);
            if (CollUtil.isNotEmpty(childrenList)) {
                List<String> ids = childrenList.stream().map(NodeShareTree::getNodeId).collect(Collectors.toList());
                nodeIds.addAll(ids);
            }
        }
        // 构建资源文件
        List<NodeAssetDto> nodeAssetDtoList = spaceAssetMapper.selectNodeAssetDto(nodeIds);
        if (CollUtil.isNotEmpty(nodeAssetDtoList)) {
            String jsonArrStrEncode = Base64.encode(JSONUtil.parseArray(nodeAssetDtoList).toString());
            File assets = FileUtil.writeUtf8String(jsonArrStrEncode, StrUtil.format("{}/{}--{}", dir, ASSET_DIR, md5.digestHex(jsonArrStrEncode)));
            files.add(assets);
        }
        // 构建数据文件
        Map<String, String> nodeIdToDescMap = iNodeDescService.getNodeIdToDescMap(nodeIds);
        Map<String, List<String>> foreignDstIdsMap = iDatasheetService.getForeignDstIds(nodeIds, true);
        if (MapUtil.isNotEmpty(foreignDstIdsMap)) {
            nodeIds = (List<String>) CollUtil.subtract(nodeIds, foreignDstIdsMap.keySet());
            // 处理关联数表
            foreignDstIdsMap.forEach((dstId, foreignDstIds) -> {
                SnapshotMapRo snapshotMapRo = iDatasheetService.delFieldIfLinkDstId(null, dstId, foreignDstIds, false);
                if (!saveData) {
                    snapshotMapRo.setRecordMap(JSONUtil.createObj());
                }
                createDataFile(dir, md5, nodeIdToFileNameMap, files, dstId, snapshotMapRo, nodeIdToDescMap.get(dstId));
            });
        }
        if (CollUtil.isNotEmpty(nodeIds)) {
            // 获取snapshot
            Map<String, SnapshotMapRo> snapshotMap = iDatasheetService.findSnapshotMapByDstIds(nodeIds, saveData);
            nodeIds.stream().filter(id -> snapshotMap.get(id) != null || nodeIdToDescMap.get(id) != null).forEach(
                id -> createDataFile(dir, md5, nodeIdToFileNameMap, files, id, snapshotMap.get(id), nodeIdToDescMap.get(id)));
        }
        // 构建文件树，生成manifest
        NodeFileTree root = new NodeFileTree(null, nodeId, node.getNodeName(), node.getIcon(), node.getType(), node.getCover(), nodeIdToFileNameMap.get(nodeId));
        if (CollUtil.isNotEmpty(childrenList)) {
            List<NodeFileTree> childList = new ArrayList<>();
            childrenList.forEach(share -> {
                NodeFileTree nodeFileTree = new NodeFileTree(share.getParentId(), share.getNodeId(), share.getNodeName(),
                    share.getIcon(), share.getType(), share.getCover(), nodeIdToFileNameMap.get(share.getNodeId()));
                childList.add(nodeFileTree);
            });
            List<NodeFileTree> treeList = new DefaultTreeBuildFactory<NodeFileTree>(nodeId).doTreeBuild(childList);
            root.setChild(treeList);
        }
        String version = DateUtil.format(LocalDateTime.now(), DatePattern.NORM_DATE_PATTERN);
        Manifest manifest = Manifest.builder().version(version).root(root).build();
        if (StrUtil.isNotBlank(password)) {
            String pwdEncode = passwordEncoder.encode(password);
            manifest.setEncryption("password");
            manifest.setPassword(pwdEncode);
        }
        File manifestFile = FileUtil.writeUtf8String(JSONUtil.parseObj(manifest).toString(), StrUtil.format("{}/{}", dir, MANIFEST));
        files.add(manifestFile);
        String zipFileName = StrUtil.format("{}/{}.vika", dir, node.getNodeName());
        File zipFile = FileUtil.file(zipFileName);
        try (ZipOutputStream zip = new ZipOutputStream(new FileOutputStream(zipFile))) {
            for (File file : files) {
                zip.putNextEntry(new ZipEntry(file.getName().replace("--", "/")));
                zip.write(Files.readAllBytes(file.toPath()));
                zip.closeEntry();
            }
            ExportUtil.exportBytes(IoUtil.readBytes(new FileInputStream(zipFile)),
                URLEncoder.encode(zipFile.getName(), StandardCharsets.UTF_8.name()), "application/zip");
        } catch (IOException e) {
            log.error("生成 VikaBundle 失败", e);
        } finally {
            FileUtil.del(dir);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void analyze(MultipartFile file, String password, String parentId, String preNodeId, Long userId) {
        log.info("解析vika文件");
        ExceptionUtil.isNotNull(file, FILE_EMPTY);
        ExceptionUtil.isTrue(StrUtil.isNotBlank(parentId) || StrUtil.isNotBlank(preNodeId), ParameterException.INCORRECT_ARG);
        // 校验前置节点是否在父节点下，若不是保存在父节点首位
        if (StrUtil.isNotBlank(preNodeId)) {
            String nodeParentId = nodeMapper.selectParentIdByNodeId(preNodeId);
            if (StrUtil.isBlank(parentId)) {
                parentId = nodeParentId;
            } else if (!parentId.equals(nodeParentId)) {
                preNodeId = null;
            }
        }
        String spaceId = nodeMapper.selectSpaceIdByNodeId(parentId);
        Long memberId = userSpaceService.getMemberId(userId, spaceId);
        iNodeService.checkEnableOperateNodeBySpaceFeature(memberId, spaceId, parentId);
        String manifestStr = null;
        String assetsContent = null;
        // 获取文件
        Map<String, String> fileNameToContentMap = MapUtil.newHashMap();
        try (ZipInputStream zip = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                String name = entry.getName();
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(zip));
                String line;
                StringBuilder content = new StringBuilder();
                while ((line = bufferedReader.readLine()) != null) {
                    content.append(line);
                }
                if (MANIFEST.equals(name)) {
                    manifestStr = content.toString();
                } else if (name.startsWith(ASSET_DIR)) {
                    assetsContent = content.toString();
                } else {
                    fileNameToContentMap.put(name, content.toString());
                }
            }
        } catch (IOException e) {
            log.info("解析 Vika Bundle 失败");
            throw new BusinessException(FILE_ERROR_CONTENT);
        }
        ExceptionUtil.isNotBlank(manifestStr, FILE_ERROR_CONTENT);
        // 文件解析
        try {
            Manifest manifest = JSONUtil.parseObj(manifestStr).toBean(Manifest.class);
            // 校验解析密码
            ExceptionUtil.isTrue(StrUtil.isBlank(manifest.getEncryption()) ||
                (StrUtil.isNotBlank(password) && passwordEncoder.matches(password, manifest.getPassword())), FILE_ERROR_PASSWORD);
            // 处理文件树
            List<NodeEntity> nodeList = new ArrayList<>();
            Map<String, String> newNodeIdMap = MapUtil.newHashMap();
            Map<String, List<DataSheetCreateRo>> fileNameToNodeMap = MapUtil.newHashMap();
            NodeFileTree root = manifest.getRoot();
            // 如果导出的是根节点，修改为文件夹类型
            if (root.getType() == NodeType.ROOT.getNodeType()) {
                root.setType(NodeType.FOLDER.getNodeType());
            }
            // 同级重复名称修改
            String name = iNodeService.duplicateNameModify(parentId, root.getType(), root.getNodeName(), null);
            root.setNodeName(name);
            this.processNode(userId, spaceId, parentId, preNodeId, root, nodeList, newNodeIdMap, fileNameToNodeMap);
            // 处理data文件
            if (MapUtil.isNotEmpty(fileNameToNodeMap)) {
                ExceptionUtil.isTrue(fileNameToNodeMap.size() == fileNameToContentMap.size(), FILE_ERROR_CONTENT);
                // 获取原节点所属的空间ID，若与保存的空间不一致，则需清除成员字段相关的数据
                String sourceSpaceId = nodeMapper.selectSpaceIdByNodeIdIncludeDeleted(root.getNodeId());
                boolean same = spaceId.equals(sourceSpaceId);
                List<NodeDescEntity> nodeDescList = new ArrayList<>();
                fileNameToContentMap.forEach((fileName, content) -> {
                    NodeDataFile dataFile = JSONUtil.parseObj(Base64.decodeStr(content)).toBean(NodeDataFile.class);
                    List<DataSheetCreateRo> roList = fileNameToNodeMap.get(fileName);
                    SnapshotMapRo snapshot = dataFile.getSnapshot();
                    roList.forEach(createRo -> {
                        if (snapshot != null) {
                            MetaMapRo meta = snapshot.getMeta().toBean(MetaMapRo.class);
                            List<String> delFieldIds = iDatasheetService.replaceFieldDstId(userId, same, meta, newNodeIdMap);
                            if (!same && CollUtil.isNotEmpty(delFieldIds)) {
                                snapshot.getRecordMap().values().forEach(recordMapRo ->
                                    JSONUtil.parseObj(recordMapRo).getJSONObject("data").keySet().removeIf(delFieldIds::contains));
                            }
                            iDatasheetService.create(userId, spaceId, createRo.getNodeId(), createRo.getName(), meta, snapshot.getRecordMap());
                        }
                        if (dataFile.getDescription() != null) {
                            NodeDescEntity descEntity = NodeDescEntity.builder().id(IdWorker.getId()).nodeId(createRo.getNodeId()).description(dataFile.getDescription()).build();
                            nodeDescList.add(descEntity);
                        }
                    });
                });
                iNodeDescService.insertBatch(nodeDescList);
            }
            // 更新原前置节点后的节点，位置后移一位
            nodeMapper.updatePreNodeIdBySelf(newNodeIdMap.get(root.getNodeId()), preNodeId, parentId);
            iNodeService.insertBatch(nodeList, null);
            // 处理资源文件
            if (StrUtil.isNotBlank(assetsContent)) {
                List<NodeAssetDto> list = JSONUtil.parseArray(Base64.decodeStr(assetsContent)).toList(NodeAssetDto.class);
                iSpaceAssetService.processNodeAssets(newNodeIdMap, spaceId, list);
            }
        } catch (JSONException | NullPointerException e) {
            throw new BusinessException(FILE_ERROR_CONTENT);
        }
    }

    private void processNode(Long userId, String spaceId, String parentId, String preNodeId, NodeFileTree node, List<NodeEntity> nodeList, Map<String, String> newNodeIdMap, Map<String, List<DataSheetCreateRo>> fileNameToNodeMap) {
        boolean isDst = node.getType() == NodeType.DATASHEET.getNodeType();
        String nodeId = isDst ? IdUtil.createDstId() : IdUtil.createNodeId();
        NodeEntity nodeEntity = NodeEntity.builder()
            .id(IdWorker.getId())
            .isTemplate(false)
            .spaceId(spaceId)
            .nodeId(nodeId)
            .nodeName(node.getNodeName())
            .parentId(parentId)
            .type(node.getType())
            .icon(node.getIcon())
            .preNodeId(preNodeId)
            .cover(node.getCover())
            .createdBy(userId)
            .updatedBy(userId)
            .build();
        nodeList.add(nodeEntity);
        newNodeIdMap.put(node.getNodeId(), nodeId);
        if (isDst || node.getData() != null) {
            String fileName = StrUtil.format("{}/{}", DATA_DIR, node.getData());
            List<DataSheetCreateRo> roList = fileNameToNodeMap.get(fileName);
            DataSheetCreateRo ro = DataSheetCreateRo.builder().nodeId(nodeId).name(node.getNodeName()).build();
            if (CollUtil.isNotEmpty(roList)) {
                // 多个文件夹描述相同的情况，指向同一个数据文件
                roList.add(ro);
            } else {
                fileNameToNodeMap.put(fileName, CollUtil.newArrayList(ro));
            }
        }
        if (!isDst && CollUtil.isNotEmpty(node.getChild())) {
            // 处理子节点
            this.processChildList(userId, spaceId, nodeId, node.getChild(), nodeList, newNodeIdMap, fileNameToNodeMap);
        }
    }

    private void processChildList(Long userId, String spaceId, String parentId, List<NodeFileTree> child, List<NodeEntity> nodeList, Map<String, String> newNodeIdMap, Map<String, List<DataSheetCreateRo>> fileNameToNodeMap) {
        String preNodeId = null;
        for (NodeFileTree node : child) {
            this.processNode(userId, spaceId, parentId, preNodeId, node, nodeList, newNodeIdMap, fileNameToNodeMap);
            preNodeId = newNodeIdMap.get(node.getNodeId());
        }
    }

    private void createDataFile(String dir, Digester md5, Map<String, String> nodeIdToFileNameMap, List<File> files, String nodeId, SnapshotMapRo snapshotMapRo, String nodeDesc) {
        NodeDataFile dataFile = new NodeDataFile(nodeDesc, snapshotMapRo);
        String jsonStrEncode = Base64.encode(JSONUtil.parseObj(dataFile).toString());
        String fileName = StrUtil.join(".", md5.digestHex(jsonStrEncode), "vikadata");
        // 已存在相同文件不重复生成（情景：文件夹描述相同）
        if (!nodeIdToFileNameMap.containsValue(fileName)) {
            File file = FileUtil.writeUtf8String(jsonStrEncode, StrUtil.format("{}/{}--{}", dir, DATA_DIR, fileName));
            files.add(file);
        }
        nodeIdToFileNameMap.put(nodeId, fileName);
    }

}
