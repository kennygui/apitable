package com.vikadata.api.modular.base.service.impl;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;

import cn.hutool.core.map.MapUtil;
import cn.hutool.core.util.ArrayUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;

import com.vikadata.api.enums.action.TrackEventType;
import com.vikadata.api.model.dto.client.ClientOriginInfo;
import com.vikadata.api.modular.base.service.SensorsService;
import com.vikadata.api.modular.user.mapper.UserMapper;
import com.vikadata.api.util.InformationUtil;
import com.vikadata.integration.sensors.DataTracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 神策分析服务实现类
 * </p>
 *
 * @author Chambers
 * @date 2020/4/8
 */
@Slf4j
@Service
public class SensorsServiceImpl implements SensorsService {

    @Resource
    private UserMapper userMapper;

    @Autowired(required = false)
    private DataTracker dataTracker;

    @Override
    public void track(Long userId, TrackEventType type, String scene, ClientOriginInfo originInfo) {
        if (dataTracker == null) {
            log.info("该环境关闭神策日志记录");
            return;
        }
        log.info("开始神策日志记录，记录事件:{}", type.getEventName());
        String distinctId = null;
        if (ObjectUtil.isNotNull(userId)) {
            distinctId = userMapper.selectUuidById(userId);
        }
        boolean isLoginId = true;
        String anonymousId;
        Map<String, Object> properties = MapUtil.newHashMap(2);
        Cookie[] cookies = null;
        String desktop = null;
        if (originInfo != null) {
            cookies = originInfo.getCookies();
            desktop = InformationUtil.getVikaDesktop(originInfo.getUserAgent(), false);
        }
        properties.put("desktop", desktop);
        switch (type) {
            case GET_SMC_CODE:
                distinctId = this.getAnonymousId(cookies);
                isLoginId = false;
                break;
            case REGISTER:
                anonymousId = this.getAnonymousId(cookies);
                if (StrUtil.isNotBlank(anonymousId)) {
                    dataTracker.trackSignUp(distinctId, anonymousId);
                }
                properties.put("registeredMethod", scene);
                // 注册后自动登录，需要记录登录事件
                HashMap<String, Object> map = MapUtil.newHashMap(2);
                map.put("loginMethod", scene);
                map.put("desktop", desktop);
                dataTracker.track(distinctId, true, TrackEventType.LOGIN.getEventName(), map);
                break;
            case LOGIN:
                // 将未登陆状态的匿名ID和用户ID关联
                anonymousId = this.getAnonymousId(cookies);
                if (StrUtil.isNotBlank(anonymousId)) {
                    dataTracker.trackSignUp(distinctId, anonymousId);
                }
                properties.put("loginMethod", scene);
                break;
            default:
                break;
        }
        dataTracker.track(distinctId, isLoginId, type.getEventName(), properties);
    }

    @Override
    public void eventTrack(Long userId, TrackEventType eventType, Map<String, Object> properties, ClientOriginInfo originInfo) {
        if (dataTracker == null) {
            log.info("该环境关闭神策日志记录");
            return;
        }
        String distinctId;
        boolean isLoginId = false;
        if (ObjectUtil.isNotNull(userId)) {
            distinctId = userMapper.selectUuidById(userId);
            isLoginId = true;
        }
        else {
            distinctId = this.getAnonymousId(originInfo.getCookies());
        }
        dataTracker.track(distinctId, isLoginId, eventType.getEventName(), properties);
    }

    /**
     * 从cookie中获取匿名ID
     */
    private String getAnonymousId(Cookie[] cookies) {
        String value = null;
        if (ArrayUtil.isNotEmpty(cookies)) {
            String key = "sensorsdata2015jssdkcross";
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(key)) {
                    value = cookie.getValue();
                }
            }
        }
        if (value != null && value.length() > 0) {
            try {
                String result = new URI(value).getPath();
                JSONObject jsonObject = JSONUtil.parseObj(result);
                Object id = jsonObject.get("first_id");
                if (ObjectUtil.isNull(id)) {
                    id = jsonObject.get("distinct_id");
                }
                return id.toString();
            }
            catch (URISyntaxException e) {
                log.info("解析cookie获取匿名ID失败");
                e.printStackTrace();
            }
        }
        return Strings.EMPTY;
    }
}
