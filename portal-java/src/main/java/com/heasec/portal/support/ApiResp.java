package com.heasec.portal.support;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 前台API统一响应结构（与PHP版响应格式保持一致）
 *
 * <p>结构：{@code {success, message, data, team:{name, abbr, version}}}</p>
 *
 * @author 天积安全 (HeavenlySecret)
 * @version v1.0.0-JAVA
 */
public class ApiResp {

    private final boolean success;
    private final String message;
    private final Object data;
    private final Map<String, String> team;

    private ApiResp(boolean success, String message, Object data, Map<String, String> team) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.team = team;
    }

    /**
     * 构建成功响应
     *
     * @param message 提示消息
     * @param data    响应数据
     * @param version 平台版本号
     * @return 统一响应Map（字段顺序与PHP版一致）
     */
    public static Map<String, Object> ok(String message, Object data, String version) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("team", team(version));
        return resp;
    }

    /**
     * 构建团队信息块
     */
    public static Map<String, String> team(String version) {
        Map<String, String> team = new LinkedHashMap<>();
        team.put("name", "天积安全");
        team.put("abbr", "HeaSec");
        team.put("version", version);
        return team;
    }
}
