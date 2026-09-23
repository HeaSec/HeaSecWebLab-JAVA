package com.heasec.portal.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.heasec.portal.config.PortalProperties;
import com.heasec.portal.support.ApiResp;

/**
 * 前台导航数据API（与PHP版接口路径及响应结构保持兼容）
 *
 * <p>Java版前台为纯静态导航，仅保留"综合实战"一级分类与
 * "商城系统综合实战（JAVA版）"靶场卡片，数据在服务端静态构造。</p>
 *
 * @author 天积安全 (HeavenlySecret)
 * @version v1.0.0-JAVA
 */
@RestController
@RequestMapping("/api/heasec")
public class PortalApiController {

    /** 综合实战一级分类ID（沿用原heasec_cms分类体系） */
    private static final int CATEGORY_PENTEST_ID = 1104;

    /** 商城系统综合实战（JAVA版）靶场卡片ID */
    private static final int LINK_SHOP_JAVA_ID = 1;

    private final PortalProperties properties;

    public PortalApiController(PortalProperties properties) {
        this.properties = properties;
    }

    /**
     * 一级分类列表（支持?action=teamInfo获取团队信息，与PHP版行为一致）
     */
    @GetMapping("/categories")
    public Map<String, Object> categories(@RequestParam(value = "action", required = false) String action) {
        if ("teamInfo".equals(action)) {
            return ApiResp.ok("获取团队信息成功", teamInfo(), properties.getVersion());
        }
        return ApiResp.ok("获取分类成功", List.of(pentestCategory()), properties.getVersion());
    }

    /**
     * 二级分类列表（Java版前台无二级分类）
     */
    @GetMapping("/subcategories")
    public Map<String, Object> subcategories() {
        return ApiResp.ok("获取二级分类成功", List.of(), properties.getVersion());
    }

    /**
     * 三级分类列表（Java版前台无三级分类）
     */
    @GetMapping("/third_level_categories")
    public Map<String, Object> thirdLevelCategories() {
        return ApiResp.ok("获取三级分类成功", List.of(), properties.getVersion());
    }

    /**
     * 链接卡片列表（含PHP版回填的分类层级兼容字段）
     */
    @GetMapping("/links")
    public Map<String, Object> links() {
        return ApiResp.ok("获取链接成功", List.of(shopJavaLink()), properties.getVersion());
    }

    /**
     * 数据库初始化状态检查（纯静态门户无数据库，固定返回已初始化）
     */
    @GetMapping("/check_database")
    public Map<String, Object> checkDatabase() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("initialized", true);
        data.put("message", "纯静态导航门户，无需数据库初始化");
        return ApiResp.ok("数据库状态正常", data, properties.getVersion());
    }

    /**
     * 团队信息（对齐原heasec_team_info表结构，snake_case字段）
     */
    private Map<String, Object> teamInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("team_name", "天积安全");
        info.put("team_en_name", "HeavenlySecret");
        info.put("team_abbr", "HeaSec");
        info.put("team_slogan", "日积寸功，乐享安全");
        info.put("version", properties.getVersion());
        info.put("build", properties.getBuild());
        info.put("security_level", 1);
        return info;
    }

    /**
     * 综合实战一级分类（对齐原all_categories表记录）
     */
    private Map<String, Object> pentestCategory() {
        Map<String, Object> category = new LinkedHashMap<>();
        category.put("id", CATEGORY_PENTEST_ID);
        category.put("name", "综合实战");
        category.put("description", "学习面对各类业务系统开展实战安全测试");
        category.put("code", "pentest");
        category.put("sort_order", 40.00);
        category.put("status", 1);
        category.put("created_at", "2026-09-19 00:00:00");
        category.put("updated_at", null);
        return category;
    }

    /**
     * 商城系统综合实战（JAVA版）卡片（对齐原links接口返回结构，
     * 含category_path与分类层级兼容回填字段）
     */
    private Map<String, Object> shopJavaLink() {
        Map<String, Object> link = new LinkedHashMap<>();
        link.put("id", LINK_SHOP_JAVA_ID);
        link.put("title", "商城系统综合实战（JAVA版）");
        link.put("description", "综合运用所学技巧，对JAVA版商城系统进行实战漏洞挖掘");
        link.put("code", "shop_java");
        link.put("difficulty", "实战");
        // 协议相对URL：由前端resolveUrl按当前访问主机名解析为 http(s)://host:8081/
        link.put("url", properties.getShopUrl());
        link.put("category_id", CATEGORY_PENTEST_ID);
        link.put("sort_order", 10.00);
        link.put("status", 1);
        link.put("learning_status", "待学习");
        link.put("created_at", "2026-09-19 00:00:00");
        link.put("updated_at", null);

        // 与PHP版links.php回填逻辑对齐的兼容字段（链接直接挂载于一级分类）
        link.put("direct_category_name", "综合实战");
        link.put("category_level", 1);
        link.put("parent_category_id", null);
        link.put("category_path", List.of(pathNode(CATEGORY_PENTEST_ID, null, "综合实战", 1)));
        link.put("subcategory_id", null);
        link.put("third_level_category_id", null);
        link.put("category_name", "综合实战");
        link.put("subcategory_name", null);
        link.put("third_level_category_name", null);
        return link;
    }

    /**
     * 分类路径节点（对齐PHP版getCategoryPath返回的节点结构）
     */
    private Map<String, Object> pathNode(int id, Integer parentId, String name, int level) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("id", id);
        node.put("parent_id", parentId);
        node.put("name", name);
        node.put("level", level);
        return node;
    }
}
