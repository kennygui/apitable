ALTER TABLE `vika_node`
    ADD COLUMN `extra` json NULL COMMENT '其他信息' AFTER `is_template`;
