@echo off
rem =====================================================================
rem HeaSec天积安全团队 - 编译脚本（Windows）
rem 编译前台门户（portal-java，8080）与商城系统综合实战靶场（shop-java，8081）
rem 用法: build.bat [all^|portal^|shop]   （默认 all）
rem 团队: 天积安全 (HeavenlySecret)
rem =====================================================================

setlocal EnableDelayedExpansion
cd /d "%~dp0"

set "TARGET=%1"
if "%TARGET%"=="" set "TARGET=all"
if /i not "%TARGET%"=="all" if /i not "%TARGET%"=="portal" if /i not "%TARGET%"=="shop" (
    echo [HeaSec] 无效参数: %TARGET% （可选: all / portal / shop）
    exit /b 1
)

call :resolve_maven
if errorlevel 1 exit /b 1

if /i "%TARGET%"=="portal" (
    call :build_project "portal-java" || exit /b 1
) else if /i "%TARGET%"=="shop" (
    call :build_project "range_java\pentest\shop_java\shop-java-backend" || exit /b 1
) else (
    call :build_project "portal-java" || exit /b 1
    call :build_project "range_java\pentest\shop_java\shop-java-backend" || exit /b 1
)

echo [HeaSec] 编译完成（%TARGET%）
exit /b 0

rem ===== 子例程：编译单个Maven工程（参数: 工程目录） =====
:build_project
echo [HeaSec] ===== 编译 %~1 =====
pushd "%~1"
call "!MAVEN_CMD!" package -DskipTests -q
set "BUILD_RC=!errorlevel!"
popd
if not "!BUILD_RC!"=="0" (
    echo [HeaSec] 编译失败: %~1，请检查上方 Maven 输出
    exit /b 1
)
echo [HeaSec] 编译完成: %~1
exit /b 0

rem ===== 子例程：定位Maven（优先PATH，其次探测Maven Wrapper缓存） =====
:resolve_maven
set "MAVEN_CMD="
where mvn >nul 2>nul && set "MAVEN_CMD=mvn"
if not defined MAVEN_CMD (
    for /d %%A in ("%USERPROFILE%\.m2\wrapper\dists\apache-maven-*") do (
        for /d %%B in ("%%A\*") do (
            for /d %%C in ("%%B\apache-maven-*") do (
                if exist "%%C\bin\mvn.cmd" set "MAVEN_CMD=%%C\bin\mvn.cmd"
            )
        )
    )
)
if not defined MAVEN_CMD (
    echo [HeaSec] 未找到 mvn 命令，请安装 Maven 并加入 PATH 后重试
    exit /b 1
)
echo [HeaSec] 使用 Maven: !MAVEN_CMD!
exit /b 0
