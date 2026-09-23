#!/bin/bash
# =====================================================================
# HeaSec天积安全团队 - 编译脚本（Linux/macOS/GitBash）
# 编译前台门户（portal-java，8080）与商城系统综合实战靶场（shop-java，8081）
# 用法: ./build.sh [all|portal|shop]   （默认 all）
# 团队: 天积安全 (HeavenlySecret)
# =====================================================================
cd "$(dirname "$0")"

TARGET="${1:-all}"
case "$TARGET" in
    all|portal|shop) ;;
    *) echo "[HeaSec] 无效参数: $TARGET （可选: all / portal / shop）"; exit 1 ;;
esac

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

# ===== 编译单个Maven工程（参数: 工程目录） =====
build_project() {
    echo "[HeaSec] ===== 编译 $1 ====="
    if ! (cd "$1" && "$MAVEN_CMD" package -DskipTests -q); then
        echo "[HeaSec] 编译失败: $1，请检查上方 Maven 输出"
        return 1
    fi
    echo "[HeaSec] 编译完成: $1"
}

resolve_maven || exit 1
echo "[HeaSec] 使用 Maven: $MAVEN_CMD"

case "$TARGET" in
    portal)
        build_project "portal-java" || exit 1
        ;;
    shop)
        build_project "range_java/pentest/shop_java/shop-java-backend" || exit 1
        ;;
    all)
        build_project "portal-java" || exit 1
        build_project "range_java/pentest/shop_java/shop-java-backend" || exit 1
        ;;
esac

echo "[HeaSec] 编译完成（$TARGET）"
