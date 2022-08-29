package com.vikadata.api.event;

import cn.hutool.json.JSONObject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.vikadata.api.enums.audit.AuditSpaceAction;

import org.springframework.context.ApplicationEvent;

/**
 * <p>
 * 空间审计事件
 * </p>
 *
 * @author Chambers
 * @date 2022/5/25
 */
public class AuditSpaceEvent extends ApplicationEvent {

    private final AuditSpaceArg arg;

    public AuditSpaceEvent(Object source, AuditSpaceArg arg) {
        super(source);
        this.arg = arg;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder(toBuilder = true)
    public static class AuditSpaceArg {

        private AuditSpaceAction action;

        private Long userId;

        private String spaceId;

        private String nodeId;

        private JSONObject info;
    }

    public AuditSpaceArg getArg() {
        return arg;
    }
}
