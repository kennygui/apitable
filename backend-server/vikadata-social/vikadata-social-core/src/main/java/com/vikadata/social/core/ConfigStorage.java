package com.vikadata.social.core;

import java.util.concurrent.locks.Lock;

/**
 * 配置存储接口
 *
 * @author Shawn Deng
 * @date 2020-11-21 12:33:04
 */
public interface ConfigStorage {

    String getAppId();

    String getAppSecret();

    boolean isv();

    Lock getUserAccessTokenLock(String userAuth);

    Lock getAppAccessTokenLock();

    Lock getTenantAccessTokenLock(String tenantKey);

    // User Access Token

    String getUserAccessToken(String accessToken);

    boolean isUserAccessTokenExpired(String accessToken);

    void expireUserAccessToken(String accessToken);

    void updateUserAccessToken(String accessToken, String userAccessToken, int expiresInSeconds);

    // App Access Token

    String getAppAccessToken();

    void updateAppAccessToken(String appAccessToken, int expiresInSeconds);

    boolean isAppAccessTokenExpired();

    void expireAppAccessToken();

    // Tenant Access Token

    String getTenantAccessToken(String tenantKey);

    void updateTenantAccessToken(String tenantKey, String tenantAccessToken, int expiresInSeconds);

    boolean isTenantAccessTokenExpired(String tenantKey);

    void expireTenantAccessToken(String tenantKey);
}
