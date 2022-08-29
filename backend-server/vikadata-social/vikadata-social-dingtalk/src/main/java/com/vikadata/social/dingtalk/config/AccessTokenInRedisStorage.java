package com.vikadata.social.dingtalk.config;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;

import com.vikadata.social.core.ConfigStorage;

/**
 * <p>
 * 基于redis存储配置
 * </p>
 * @author zoe zheng
 * @date 2021/4/8 11:19 上午
 */
public class AccessTokenInRedisStorage implements ConfigStorage {

    private static final String APP_ACCESS_TOKEN_KEY_TPL = "%s:dingtalk:app_access_token:%s";

    private static final String USER_ACCESS_TOKEN_KEY_TPL = "%s:dingtalk:user_access_token:%s:%s";

    private static final String TENANT_ACCESS_TOKEN_KEY_TPL = "%s:dingtalk:tenant_access_token:%s";

    private static final String LOCK_KEY_TPL = "%s:dingtalk:lock:%s:";

    private static final String DYNAMIC_KEY_TPL = "%s:dingtalk:lock:%s";

    /**
     * 第三方企业应用为SuiteKey/定制服务为CustomKey，用于标志应用唯一性
     */
    protected volatile String appId;

    /**
     * 第三方企业应用为SuiteSecret/定制服务为CustomSecret
     */
    protected volatile String appSecret;

    protected volatile boolean isv;

    private final DingTalkRedisOperations redisOps;

    private final String redisKeyPrefix;

    private String appAccessTokenKey;

    protected volatile Lock appAccessTokenLock;

    protected Map<String, Lock> userTokenLockMap = new ConcurrentHashMap<>();

    protected Map<String, Lock> tenantTokenLockMap = new ConcurrentHashMap<>();

    public AccessTokenInRedisStorage(DingTalkRedisOperations redisOps, String redisKeyPrefix) {
        this.redisOps = redisOps;
        this.redisKeyPrefix = redisKeyPrefix;
    }

    public void setAppId(String appId) {
        this.appId = appId;
        this.appAccessTokenKey = String.format(APP_ACCESS_TOKEN_KEY_TPL, this.redisKeyPrefix, appId);
        String lockKey = String.format(LOCK_KEY_TPL, this.redisKeyPrefix, appId);
        this.appAccessTokenLock = this.redisOps.getLock(lockKey.concat("appAccessTokenLock"));
    }

    @Override
    public String getAppId() {
        return this.appId;
    }

    public void setAppSecret(String appSecret) {
        this.appSecret = appSecret;
    }

    @Override
    public String getAppSecret() {
        return this.appSecret;
    }

    public void setIsv(boolean isv) {
        this.isv = isv;
    }

    @Override
    public boolean isv() {
        return this.isv;
    }

    // USER ACCESS TOKEN

    @Override
    public Lock getUserAccessTokenLock(String userAuth) {
        if (!userTokenLockMap.containsKey(userAuth)) {
            String lockKey = String.format(DYNAMIC_KEY_TPL, this.redisKeyPrefix, userAuth);
            Lock userAccessTokenLock = this.redisOps.getLock(lockKey.concat("userAccessTokenLock"));
            this.userTokenLockMap.put(userAuth, userAccessTokenLock);
        }
        return this.userTokenLockMap.get(userAuth);
    }

    @Override
    public String getUserAccessToken(String userAuth) {
        return redisOps.getValue(String.format(USER_ACCESS_TOKEN_KEY_TPL, this.redisKeyPrefix, appId, userAuth));
    }

    @Override
    public synchronized void updateUserAccessToken(String userAuth, String userAccessToken, int expiresInSeconds) {
        this.redisOps.setValue(String.format(USER_ACCESS_TOKEN_KEY_TPL, this.redisKeyPrefix, appId, userAuth), userAccessToken, expiresInSeconds - 200, TimeUnit.SECONDS);
    }

    @Override
    public boolean isUserAccessTokenExpired(String userAuth) {
        Long expire = redisOps.getExpire(String.format(USER_ACCESS_TOKEN_KEY_TPL, this.redisKeyPrefix, appId, userAuth));
        return expire == null || expire < 2;
    }

    @Override
    public void expireUserAccessToken(String userAuth) {
        redisOps.expire(String.format(USER_ACCESS_TOKEN_KEY_TPL, this.redisKeyPrefix, appId, userAuth), 0, TimeUnit.SECONDS);
    }


    // APP ACCESS TOKEN

    @Override
    public Lock getAppAccessTokenLock() {
        return this.appAccessTokenLock;
    }

    @Override
    public String getAppAccessToken() {
        return redisOps.getValue(this.appAccessTokenKey);
    }

    @Override
    public synchronized void updateAppAccessToken(String appAccessToken, int expiresInSeconds) {
        redisOps.setValue(this.appAccessTokenKey, appAccessToken, expiresInSeconds - 200, TimeUnit.SECONDS);
    }

    @Override
    public boolean isAppAccessTokenExpired() {
        Long expire = redisOps.getExpire(this.appAccessTokenKey);
        return expire == null || expire < 2;
    }

    @Override
    public void expireAppAccessToken() {
        redisOps.expire(this.appAccessTokenKey, 0, TimeUnit.SECONDS);
    }


    // TENANT ACCESS TOKEN

    /**
     *
     * @param agentId 应用的agentId/第三方企业应用为SuiteId
     * @return Lock
     * @author zoe zheng
     * @date 2021/4/17 4:01 下午
     */
    @Override
    public Lock getTenantAccessTokenLock(String agentId) {
        if (!tenantTokenLockMap.containsKey(agentId)) {
            String lockKey = String.format(DYNAMIC_KEY_TPL, this.redisKeyPrefix, agentId);
            Lock corpAccessTokenLock = this.redisOps.getLock(lockKey.concat("tenantAccessTokenLock"));
            this.tenantTokenLockMap.put(agentId, corpAccessTokenLock);
        }
        return this.tenantTokenLockMap.get(agentId);
    }

    @Override
    public String getTenantAccessToken(String agentId) {
        return redisOps.getValue(String.format(TENANT_ACCESS_TOKEN_KEY_TPL, this.redisKeyPrefix, agentId));
    }

    @Override
    public synchronized void updateTenantAccessToken(String agentId, String accessToken, int expiresInSeconds) {
        redisOps.setValue(String.format(TENANT_ACCESS_TOKEN_KEY_TPL, this.redisKeyPrefix, agentId), accessToken, expiresInSeconds - 200, TimeUnit.SECONDS);
    }

    @Override
    public boolean isTenantAccessTokenExpired(String agentId) {
        Long expire = redisOps.getExpire(String.format(TENANT_ACCESS_TOKEN_KEY_TPL, this.redisKeyPrefix, agentId));
        return expire == null || expire < 2;
    }

    @Override
    public void expireTenantAccessToken(String agentId) {
        redisOps.expire(String.format(TENANT_ACCESS_TOKEN_KEY_TPL, this.redisKeyPrefix, agentId), 0, TimeUnit.SECONDS);
    }
}
