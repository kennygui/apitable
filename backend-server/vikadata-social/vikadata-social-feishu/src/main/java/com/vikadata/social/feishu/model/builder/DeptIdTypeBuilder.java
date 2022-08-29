package com.vikadata.social.feishu.model.builder;

/**
 * 部门 ID 类型 构造器
 * @author Shawn Deng
 * @date 2021-07-07 21:15:22
 */
public class DeptIdTypeBuilder {

    public static DeptIdType departmentId(String id) {
        return new DepartmentId(id);
    }

    public static DeptIdType openDepartmentId(String id) {
        return new OpenDepartmentId(id);
    }

    private static abstract class AbstractDeptIdType implements DeptIdType {

        private final String value;

        private final String type;

        AbstractDeptIdType(String type, String value) {
            this.type = type;
            this.value = value;
        }

        @Override
        public String value() {
            return value;
        }

        @Override
        public String type() {
            return type;
        }
    }

    private static class DepartmentId extends AbstractDeptIdType {

        DepartmentId(String id) {
            super("department_id", id);
        }
    }

    private static class OpenDepartmentId extends AbstractDeptIdType {

        OpenDepartmentId(String id) {
            super("open_department_id", id);
        }
    }
}
