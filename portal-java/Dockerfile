# =====================================================================
# HeaSec天积安全团队 - 靶场平台前台门户（JAVA版）运行镜像
# 多阶段构建：容器内完成 Maven 编译，本地无需 JDK/Maven 环境
# 说明：前端静态资源（src/main/resources/static/）已在版本库中，
#       构建镜像无需 Node.js；Maven 依赖层走 Docker 缓存
# 团队: 天积安全 (HeavenlySecret) | 版本: v4.0.0-JAVA
# =====================================================================

# ---------- 阶段1：Maven 构建 ----------
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

# 国内镜像加速依赖拉取（阿里云 Maven 镜像）
RUN mkdir -p /root/.m2 && \
    echo '<settings><mirrors><mirror>' \
         '<id>aliyun</id><mirrorOf>central</mirrorOf>' \
         '<name>Aliyun Maven</name>' \
         '<url>https://maven.aliyun.com/repository/public</url>' \
         '</mirror></mirrors></settings>' > /root/.m2/settings.xml

# 依赖层：仅 pom 变化时才重新拉取（命中 Docker 层缓存）
COPY pom.xml ./pom.xml
RUN mvn dependency:go-offline -q

# 源码层：编译打包（前端静态资源已包含在 resources 中）
COPY src ./src
RUN mvn package -DskipTests -q

# ---------- 阶段2：运行镜像 ----------
FROM eclipse-temurin:17-jre-jammy

ENV TZ=Asia/Shanghai

WORKDIR /app

# jar（容器内构建产物：内含前台门户静态资源）
COPY --from=builder /build/target/portal-java.jar /app/portal-java.jar

EXPOSE 8080

CMD ["java", "-Dfile.encoding=UTF-8", "-jar", "portal-java.jar"]
