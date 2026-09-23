package com.heasec.portal.filter;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 团队标识响应头过滤器（对齐PHP版bootstrap行为）
 *
 * <p>为所有API响应附加团队标识响应头：X-Powered-By、X-Team-Name、HeavenlySecret。</p>
 *
 * @author 天积安全 (HeavenlySecret)
 * @version v1.0.0-JAVA
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiHeaderFilter extends OncePerRequestFilter {

    private final String version;

    public ApiHeaderFilter(@Value("${portal.version:v1.0.0}") String version) {
        this.version = version;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (request.getRequestURI().startsWith("/api/")) {
            response.setHeader("X-Powered-By", "HeavenlySecret/HeaSec " + version);
            response.setHeader("X-Team-Name", "HeaSec");
            response.setHeader("HeavenlySecret", "HeaSec " + version);
        }
        filterChain.doFilter(request, response);
    }
}
