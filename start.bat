@echo off
rem =====================================================================
rem HeaSec天积安全团队 - 启动脚本（Windows）
rem 启动前台门户（portal-java，8080）与商城系统综合实战靶场（shop-java，8081）
rem 用法: start.bat [all^|portal^|shop]   （默认 all，每个服务独立窗口，关窗即停）
rem 说明：jar 缺失或源码有更新时自动重新构建（mvn package -DskipTests）
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

where java >nul 2>nul || (
    echo [HeaSec] 未找到 java 命令，请安装 JDK 17+ 并加入 PATH 后重试
    exit /b 1
)

rem ===== 定位Java运行时（优先JAVA_HOME；PATH中的java可能为低版本JDK） =====
set "JAVA_CMD=java"
if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
echo [HeaSec] 使用 Java: %JAVA_CMD%

rem ===== 校验Java主版本 >= 17（与start.sh对齐，低版本JDK提前报错） =====
rem 版本行形如: openjdk version "17.0.2" 2022-01-18 / java version "1.8.0_311"
set "JAVA_VER_LINE="
"%JAVA_CMD%" -version > "%TEMP%\heasec_java_ver.txt" 2>&1
set /p JAVA_VER_LINE=<"%TEMP%\heasec_java_ver.txt"
del "%TEMP%\heasec_java_ver.txt" >nul 2>nul
set "JAVA_MAJOR="
for /f "tokens=3" %%v in ("%JAVA_VER_LINE%") do for /f "tokens=1 delims=." %%m in ("%%~v") do set "JAVA_MAJOR=%%m"
if not defined JAVA_MAJOR set "JAVA_MAJOR=0"
if %JAVA_MAJOR% LSS 17 (
    echo [HeaSec] 当前 Java 版本过低（%JAVA_VER_LINE%），需要 JDK 17+，请检查 JAVA_HOME 配置
    exit /b 1
)

if /i not "%TARGET%"=="shop" (
    call :ensure_build "portal-java" "target\portal-java.jar" "src" || exit /b 1
)
if /i not "%TARGET%"=="portal" (
    rem 商城靶场必须以其根目录为工作目录启动（database/init_database.sql 按工作目录优先读取）
    call :ensure_build "range_java\pentest\shop_java\shop-java-backend" "target\shop-java-backend.jar" "src" || exit /b 1
)

if /i not "%TARGET%"=="shop" (
    call :start_portal
)
if /i not "%TARGET%"=="portal" (
    call :start_shop
)

echo.
echo [HeaSec] 启动指令已执行完毕，服务在独立窗口中运行（关闭对应窗口即停止）
exit /b 0

rem ===== 子例程：启动前台门户（8080） =====
:start_portal
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>nul && (
    echo [HeaSec] 警告: 端口 8080 已被占用，前台门户可能启动失败
)
echo [HeaSec] 启动前台门户: http://localhost:8080/
start "HeaSec-Portal(8080)" /D "%~dp0portal-java" "%JAVA_CMD%" -Dfile.encoding=UTF-8 -jar target\portal-java.jar
exit /b 0

rem ===== 子例程：启动商城系统综合实战靶场（8081） =====
:start_shop
netstat -ano | findstr ":8081" | findstr "LISTENING" >nul 2>nul && (
    echo [HeaSec] 警告: 端口 8081 已被占用，商城靶场可能启动失败
)
echo [HeaSec] 启动商城系统综合实战靶场（JAVA版）: http://localhost:8081/
start "HeaSec-ShopJava(8081)" /D "%~dp0range_java\pentest\shop_java" "%JAVA_CMD%" -Dfile.encoding=UTF-8 --add-opens java.base/java.lang=ALL-UNNAMED -jar shop-java-backend\target\shop-java-backend.jar --server.port=8081
exit /b 0

rem ===== 子例程：自动构建检测并按需编译（参数: 工程目录 jar相对路径 src相对目录） =====
:ensure_build
set "NEED_BUILD=0"
if not exist "%~1\%~2" set "NEED_BUILD=1"
if "!NEED_BUILD!"=="0" (
    powershell -NoProfile -Command "exit [int]((Get-ChildItem -Recurse -File '%~1\%~3' | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime -gt (Get-Item '%~1\%~2').LastWriteTime)"
    if errorlevel 1 set "NEED_BUILD=1"
)
if "!NEED_BUILD!"=="1" (
    echo [HeaSec] 检测到 %~1 的 jar 缺失或源码有更新，正在重新构建...
    call :resolve_maven || exit /b 1
    pushd "%~1"
    call "!MAVEN_CMD!" package -DskipTests -q
    set "BUILD_RC=!errorlevel!"
    popd
    if not "!BUILD_RC!"=="0" (
        echo [HeaSec] 构建失败: %~1，请检查上方 Maven 输出
        exit /b 1
    )
    echo [HeaSec] 构建完成: %~1
)
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
