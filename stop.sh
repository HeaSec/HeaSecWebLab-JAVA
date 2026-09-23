#!/bin/bash
# =====================================================================
# HeaSec天积安全团队 - 停止脚本（Linux/macOS/GitBash）
# 停止 start.sh 以后台方式启动的服务（Windows 下关闭对应服务窗口即可）
# 用法: ./stop.sh [all|portal|shop]   （默认 all）
# 团队: 天积安全 (HeavenlySecret)
# =====================================================================
cd "$(dirname "$0")"
BASE="$(pwd)"

TARGET="${1:-all}"
case "$TARGET" in
    all|portal|shop) ;;
    *) echo "[HeaSec] 无效参数: $TARGET （可选: all / portal / shop）"; exit 1 ;;
esac

# ===== 停止单个服务（参数: 服务名 PID文件路径） =====
stop_one() {
    local name="$1" pidfile="$2"
    if [ -f "$pidfile" ]; then
        local pid
        pid="$(cat "$pidfile")"
        if kill -0 "$pid" 2> /dev/null; then
            kill "$pid" && echo "[HeaSec] 已停止 $name（PID $pid）"
        else
            echo "[HeaSec] $name 进程已不存在（PID $pid），清理PID文件"
        fi
        rm -f "$pidfile"
    else
        echo "[HeaSec] 未找到 $name 的PID文件（可能未启动或非本脚本启动）"
    fi
}

if [ "$TARGET" != "shop" ]; then
    stop_one "前台门户" "$BASE/portal-java/logs/portal.pid"
fi
if [ "$TARGET" != "portal" ]; then
    stop_one "商城系统综合实战靶场" "$BASE/range_java/pentest/shop_java/logs/shop-java.pid"
fi

echo "[HeaSec] 停止操作完成（$TARGET）"
