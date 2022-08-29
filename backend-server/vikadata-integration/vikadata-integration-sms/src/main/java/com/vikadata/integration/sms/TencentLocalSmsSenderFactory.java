package com.vikadata.integration.sms;

/**
 * <p>
 * 腾讯短信发送器工厂
 * </p>
 *
 * @author Chambers
 * @date 2021/5/13
 */
public class TencentLocalSmsSenderFactory extends AbstractSmsSenderFactory implements LocalSmsSenderFactory {

    public TencentLocalSmsSenderFactory(Integer appId, String appKey, String sign) {
        super(appId, appKey, sign);
    }

    @Override
    public SmsSender createSender() {
        return new TencentSmsSender(getAppId(), getAppKey(), getSign());
    }
}
