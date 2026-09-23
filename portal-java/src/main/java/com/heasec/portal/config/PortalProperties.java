package com.heasec.portal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 前台门户外部化配置
 *
 * @author 天积安全 (HeavenlySecret)
 * @version v1.0.0-JAVA
 */
@ConfigurationProperties(prefix = "portal")
public class PortalProperties {

    /** 商城系统综合实战（JAVA版）靶场跳转地址，默认为协议相对形式（按当前访问主机名解析端口） */
    private String shopUrl = ":8081/";

    /** 平台版本号 */
    private String version = "v1.0.0";

    /** 构建号 */
    private String build = "20260923";

    public String getShopUrl() {
        return shopUrl;
    }

    public void setShopUrl(String shopUrl) {
        this.shopUrl = shopUrl;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getBuild() {
        return build;
    }

    public void setBuild(String build) {
        this.build = build;
    }
}
