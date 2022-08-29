package com.vikadata.api.control.role;

import com.vikadata.api.control.permission.NodePermission;
import com.vikadata.api.control.role.RoleConstants.Node;

/**
 * 管理者角色
 * @author Shawn Deng
 * @date 2021-03-18 16:42:50
 */
public class NodeManagerRole extends NodeEditorRole {

    private final boolean isAdmin;

    public NodeManagerRole() {
        this(false);
    }

    public NodeManagerRole(boolean inherit) {
        this(inherit, false);
    }

    public NodeManagerRole(boolean inherit, boolean isAdmin) {
        super(inherit);
        this.isAdmin = isAdmin;
        permissions.add(NodePermission.MANAGE_NODE);

        permissions.add(NodePermission.CREATE_NODE);
        permissions.add(NodePermission.RENAME_NODE);
        permissions.add(NodePermission.EDIT_NODE_ICON);
        permissions.add(NodePermission.EDIT_NODE_DESC);
        permissions.add(NodePermission.MOVE_NODE);
        permissions.add(NodePermission.COPY_NODE);
        permissions.add(NodePermission.IMPORT_NODE);
        permissions.add(NodePermission.EXPORT_NODE);
        permissions.add(NodePermission.REMOVE_NODE);

        permissions.add(NodePermission.CREATE_TEMPLATE);

        permissions.add(NodePermission.SET_NODE_SHARE_ALLOW_SAVE);
        permissions.add(NodePermission.SET_NODE_SHARE_ALLOW_EDIT);

        permissions.add(NodePermission.ASSIGN_NODE_ROLE);

        permissions.add(NodePermission.EXPORT_VIEW);
        permissions.add(NodePermission.CREATE_FIELD);
        permissions.add(NodePermission.RENAME_FIELD);
        permissions.add(NodePermission.EDIT_FIELD_PROPERTY);
        permissions.add(NodePermission.REMOVE_FIELD);

        // 列权限
        permissions.add(NodePermission.MANAGE_FIELD_PERMISSION);

        // 视图锁定可管理
        permissions.add(NodePermission.MANAGE_VIEW_LOCK);
    }

    @Override
    public boolean isAdmin() {
        return this.isAdmin;
    }

    @Override
    public String getRoleTag() {
        return Node.MANAGER;
    }
}
