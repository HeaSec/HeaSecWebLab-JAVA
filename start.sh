#!/bin/bash
# =====================================================================
# HeaSec天积安全团队 - 启动脚本（Linux/macOS/GitBash）
# 启动前台门户（portal-java，8080）与商城系统综合实战靶场（shop-java，8081）
# 用法: ./start.sh [all|portal|shop]   （默认 all，后台运行，日志见各自 logs/ 目录）
# 说明：jar 缺失或源码有更新时自动重新构建（mvn package -DskipTests）
#       停止服务请运行 ./stop.sh [all|portal|shop]
# 团队: 天积安全 (HeavenlySecret)
# =====================================================================
cd "$(dirname "$0")"
BASE="$(pwd)"

TARGET="${1:-all}"
case "$TARGET" in
    all|portal|shop) ;;
    *) echo "[HeaSec] 无效参数: $TARGET （可选: all / portal / shop）"; exit 1 ;;
esac

# ===== 定位Java运行时（优先JAVA_HOME，要求JDK 17+；PATH中的java可能为低版本） =====
resolve_java() {
    local jhome="$JAVA_HOME"
    # GitBash下JAVA_HOME为Windows路径，转换为POSIX路径（Linux下无cygpath则原样使用）
    if command -v cygpath > /dev/null 2>&1 && [ -n "$jhome" ]; then
        jhome="$(cygpath -u "$jhome")"
    fi
    if [ -n "$jhome" ] && [ -x "$jhome/bin/java" ]; then
        JAVA_CMD="$jhome/bin/java"
    elif command -v java > /dev/null 2>&1; then
        JAVA_CMD="java"
    else
        echo "[HeaSec] 未找到 java 命令，请安装 JDK 17+ 并配置 JAVA_HOME 或 PATH"
        return 1
    fi
    # 校验主版本 >= 17
    local major
    major="$("$JAVA_CMD" -version 2>&1 | head -1 | sed -E 's/.*version "([0-9]+).*/\1/')"
    if [ "$major" -lt 17 ] 2> /dev/null; then
        echo "[HeaSec] 当前 Java 版本过低（$("$JAVA_CMD" -version 2>&1 | head -1)），需要 JDK 17+，请检查 JAVA_HOME 配置"
        return 1
    fi
}

# ===== 定位Maven：优先PATH，其次探测Maven Wrapper缓存 =====
resolve_maven() {
    if command -v mvn > /dev/null 2>&1; then
        MAVEN_CMD="mvn"
        return 0
    fi
    for d in "$HOME"/.m2/wrapper/dists/apache-maven-*/*/apache-maven-*/bin/mvn; do
        if [ -f "$d" ]; then
            MAVEN_CMD="$d"
            return 0
        fi
    done
    echo "[HeaSec] 未找到 mvn 命令，请安装 Maven 并加入 PATH 后重试"
    return 1
}

# ===== 自动构建检测并按需编译（参数: 工程目录 jar相对路径 src相对目录） =====
ensure_build() {
    local dir="$1" jar="$2" src="$3"
    local need_build=0
    if [ ! -f "$dir/$jar" ]; then
        need_build=1
    elif [ -n "$(find "$dir/$src" -type f -newer "$dir/$jar" -print -quit 2>/dev/null)" ]; then
        need_build=1
    fi
    if [ "$need_build" = "1" ]; then
        echo "[HeaSec] 检测到 $dir 的 jar 缺失或源码有更新，正在重新构建..."
        resolve_maven || return 1
        echo "[HeaSec] 使用 Maven: $MAVEN_CMD"
        if ! (cd "$dir" && "$MAVEN_CMD" package -DskipTests -q); then
            echo "[HeaSec] 构建失败: $dir，请检查上方 Maven 输出"
            return 1
        fi
        echo "[HeaSec] 构建完成: $dir"
    fi
}

# ===== 端口占用检测（参数: 端口） =====
port_in_use() {
    (echo > /dev/tcp/127.0.0.1/"$1") 2> /dev/null
}

# ===== 启动前台门户（8080） =====
start_portal() {
    if port_in_use 8080; then
        echo "[HeaSec] 警告: 端口 8080 已被占用，前台门户可能启动失败"
    fi
    mkdir -p "$BASE/portal-java/logs"
    cd "$BASE/portal-java"
    nohup "$JAVA_CMD" -Dfile.encoding=UTF-8 -jar target/portal-java.jar > logs/portal.log 2>&1 &
    echo $! > logs/portal.pid
    echo "[HeaSec] 前台门户已启动: http://localhost:8080/ （PID $(cat logs/portal.pid)，日志 portal-java/logs/portal.log）"
}

# ===== 启动商城系统综合实战靶场（8081，必须以靶场根目录为工作目录启动） =====
start_shop() {
    if port_in_use 8081; then
        echo "[HeaSec] 警告: 端口 8081 已被占用，商城靶场可能启动失败"
    fi
    mkdir -p "$BASE/range_java/pentest/shop_java/logs"
    cd "$BASE/range_java/pentest/shop_java"
    nohup "$JAVA_CMD" -Dfile.encoding=UTF-8 --add-opens java.base/java.lang=ALL-UNNAMED \
        -jar shop-java-backend/target/shop-java-backend.jar --server.port=8081 \
        > logs/shop-java.log 2>&1 &
    echo $! > logs/shop-java.pid
    echo "[HeaSec] 商城系统综合实战靶场（JAVA版）已启动: http://localhost:8081/ （PID $(cat logs/shop-java.pid)，日志 range_java/pentest/shop_java/logs/shop-java.log）"
}

resolve_java || exit 1

if [ "$TARGET" != "shop" ]; then
    ensure_build "portal-java" "target/portal-java.jar" "src" || exit 1
fi
if [ "$TARGET" != "portal" ]; then
    # 商城靶场的 database/init_database.sql 按工作目录优先读取，构建时保持目录语义
    ensure_build "range_java/pentest/shop_java/shop-java-backend" "target/shop-java-backend.jar" "src" || exit 1
fi

if [ "$TARGET" != "shop" ]; then
    start_portal
fi
if [ "$TARGET" != "portal" ]; then
    start_shop
fi

echo
echo "[HeaSec] 启动完成（$TARGET），停止服务请运行: ./stop.sh $TARGET"
