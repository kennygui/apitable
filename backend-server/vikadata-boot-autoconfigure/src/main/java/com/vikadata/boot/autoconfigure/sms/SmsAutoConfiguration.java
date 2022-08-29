package com.vikadata.boot.autoconfigure.sms;

import java.util.Optional;

import com.vikadata.integration.sms.LocalSmsSenderFactory;
import com.vikadata.integration.sms.OutlandSmsSenderFactory;
import com.vikadata.integration.sms.SmsSenderTemplate;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * <p>
 * 短信自动配置
 * </p>
 *
 * @author Shawn Deng
 * @date 2019-04-16 16:50
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(SmsSenderTemplate.class)
@EnableConfigurationProperties(SmsProperties.class)
@ConditionalOnProperty(value = "vikadata-starter.sms.enabled", havingValue = "true")
@Import({ TencentSmsAutoConfiguration.class, YunpianSmsAutoConfiguration.class })
public class SmsAutoConfiguration {

    private final SmsProperties properties;

    public SmsAutoConfiguration(SmsProperties properties) {
        this.properties = properties;
    }

    @Bean
    @ConditionalOnMissingBean
    public SmsSenderTemplate smsSenderTemplate(Optional<LocalSmsSenderFactory> localSmsSenderFactory, Optional<OutlandSmsSenderFactory> outlandSmsSenderFactory) {
        SmsSenderTemplate template = new SmsSenderTemplate();
        template.setLocalAreaCode(properties.getLocalAreaCode());
        template.setLocalSmsSenderFactory(localSmsSenderFactory.orElse(null));
        template.setOutlandSmsSenderFactory(outlandSmsSenderFactory.orElse(null));
        return template;
    }
}
