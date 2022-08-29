package com.vikadata.boot.autoconfigure.yozo;

import com.vikadata.integration.yozo.YozoConfig;
import com.vikadata.integration.yozo.YozoTemplate;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 永中云自动装载配置
 * @author Shawn Deng
 * @date 2021-06-22 10:43:25
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(YozoProperties.class)
@ConditionalOnClass(YozoTemplate.class)
@ConditionalOnProperty(value = "vikadata-starter.yozo.enabled", havingValue = "true")
public class YozoAutoConfiguration {

    private final YozoProperties properties;

    public YozoAutoConfiguration(YozoProperties properties) {
        this.properties = properties;
    }

    @Bean
    @ConditionalOnMissingBean(YozoTemplate.class)
    public YozoTemplate yozoTemplate() {
        YozoConfig config = new YozoConfig();
        config.setAppId(properties.getAppId());
        config.setKey(properties.getKey());
        YozoConfig.Uri uri = new YozoConfig.Uri();
        uri.setPreview(properties.getUri().getPreview());
        config.setUri(uri);
        return new YozoTemplate(config);
    }
}
