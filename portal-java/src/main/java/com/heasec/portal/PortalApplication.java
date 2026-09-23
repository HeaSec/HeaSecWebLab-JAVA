package com.heasec.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.heasec.portal.config.PortalProperties;

/**
 * HeaSec靶场平台前台门户（JAVA版）启动类
 *
 * <p>纯静态导航门户：仅提供综合实战分类下的商城系统综合实战（JAVA版）靶场入口，
 * 无数据库依赖，学习状态存储于浏览器本地（localStorage）。</p>
 *
 * @author 天积安全 (HeavenlySecret)
 * @version v1.0.0-JAVA
 */
@SpringBootApplication
@EnableConfigurationProperties(PortalProperties.class)
public class PortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(PortalApplication.class, args);
    }
}
