<div align="center">

# 天积安全 WEB 靶场平台（JAVA版）

[![License](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](LICENSE)
[![Gitee](https://img.shields.io/badge/Gitee-HeaSec-C71D23?logo=gitee&logoColor=white)](https://gitee.com/HeaSec/)
[![GitHub](https://img.shields.io/badge/GitHub-HeaSec-181717?logo=github&logoColor=white)](https://github.com/HeaSec/)

</div>

---

## 简介

**天积安全 WEB 靶场平台（JAVA版）**是天积安全靶场平台的纯 Java 技术栈独立分支，借助AI完成靶场体系建设，通过循序渐进的实战练习帮助你体系化掌握 WEB 安全技能。

本分支由两个独立的 Spring Boot 服务组成：

| 服务 | 说明 | 目录 | 默认端口 |
| :--- | :--- | :--- | :---: |
| **前台门户**（portal-java） | 靶场导航门户（Vue 2 SPA，UI 沿用平台经典视觉），展示"综合实战"分类与靶场卡片 | `portal-java/` | **8080** |
| **商城系统综合实战靶场**（shop-java） | Spring Boot 3.2 + Vue 3 前后端分离的综合实战商城靶场 | `range_java/pentest/shop_java/` | **8081** |

前台门户为纯静态导航（无数据库依赖，启动即用）；商城靶场使用独立数据库 `shop_java`（表前缀 `heasec_shop_`），应用启动时自动建库建表并初始化种子数据。

商城系统综合实战靶场由平台 PHP 版同名靶场升级而来：保留业务逻辑、输入验证等原有漏洞，新增多个 Java 特有漏洞；漏洞积分上限从 4800 分提升至 6000 分（2000/4000/6000 分对应 1/2/3 星）。

## 快速部署

三种部署方式任选其一：**Docker 部署**（推荐，容器内完成编译并自带数据库，环境最省心）→ **JAR 包部署**（免编译，需本地提供 MySQL 数据库）→ **本地源码启动**（需本地具备 JDK + Maven 打包环境）。

### 环境要求

| 组件 | 要求 |
| :--: | :--- |
| JDK | 17+（Spring Boot 3.2 最低要求，需正确配置 `JAVA_HOME`） |
| Maven | 3.6+（仅本地源码启动需要） |
| MySQL | 5.7+（仅商城靶场需要，本地部署**推荐使用 phpstudy 自带数据库**，默认账号 root/root） |
| Node.js | 18+（仅修改商城前端源码时需要，前端构建产物已随仓库提交） |
| 操作系统 | Windows / Linux / macOS |

### Docker 部署（推荐）

1. **配置镜像加速器**（国内用户）：
   - **Windows**（Docker Desktop）：Settings → Docker Engine，添加：
     ```json
     { "registry-mirrors": ["https://docker.1ms.run", "https://docker.m.daocloud.io"] }
     ```
   - **Linux**：编辑 `/etc/docker/daemon.json` 写入同样内容后 `sudo systemctl restart docker`。
2. **构建并启动**：在项目根目录执行：
   ```bash
   docker compose up -d --build
   ```

   首次构建在容器内完成 Maven 编译，约 3-5 分钟。
3. **访问**：前台门户 `http://localhost:8080/`，商城靶场 `http://localhost:8081/`。

<details>
<summary>📖 Docker 常用命令</summary>

```bash
docker compose up -d            # 启动（已构建过无需 --build）
docker compose down             # 停止
docker compose down -v          # 停止并删除数据卷（重置靶场数据）
docker compose logs -f          # 查看日志
docker compose up -d --build    # 修改代码后重新构建

# 仅重建某个服务镜像
docker compose build portal-java && docker compose up -d portal-java
docker compose build shop-java && docker compose up -d shop-java
```

</details>

### JAR 包部署

从 Release 页面下载已构建好的 JAR 包，无需本地编译，仅需 JDK 17+ 运行环境：

- **Gitee**：https://gitee.com/HeaSec/HeaSecWebLab-JAVA/releases
- **GitHub**：https://github.com/HeaSec/HeaSecWebLab-JAVA/releases

> **注意：JAR 包部署需本地提供数据库服务器**（Docker 部署则由容器自带）。商城靶场依赖 MySQL 5.7+，**推荐直接使用 phpstudy 自带的数据库**——在小皮面板中启动 MySQL 即可；请确保账号密码与靶场默认配置一致（`root/root`，不一致时通过 `--spring.datasource.password=你的密码` 启动参数覆盖）。库和表无需手动创建，首次启动自动初始化。

分别为两个服务创建独立目录并启动（JAR 文件名以 Release 附件实际名称为准）：

```bash
# 1. 前台门户（8080）：纯静态导航无数据库依赖，任意目录执行
java -jar portal-java.jar

# 2. 商城系统综合实战靶场（8081）：建议使用独立目录（日志与上传文件写入当前目录）
java --add-opens java.base/java.lang=ALL-UNNAMED -jar shop-java-backend.jar --server.port=8081
```

启动后访问：前台门户 `http://localhost:8080/`，商城靶场 `http://localhost:8081/`。

### 本地源码启动（脚本方式）

> 本方式**从源码构建并启动**，要求本地具备**打包环境**：**JDK 17+ 与 Maven 3.6+**（见上方环境要求；Maven 未加入 PATH 时，脚本会自动探测 Maven Wrapper 缓存）。若不想配置打包环境，请使用上方 Docker 部署或 JAR 包部署。

拉取代码后，在项目根目录**直接运行启动脚本即可，无需先手动编译**——脚本内置自动构建检测，jar 缺失或源码有更新时会自动重新打包再启动：

```bash
# Windows
start.bat              # 自动打包并启动全部服务（默认）
start.bat portal       # 仅启动前台门户（8080）
start.bat shop         # 仅启动商城靶场（8081）

# Linux / macOS / GitBash
./start.sh             # 自动打包并后台启动全部服务（默认）
./start.sh portal      # 仅启动前台门户（8080）
./start.sh shop        # 仅启动商城靶场（8081）
```

- **本地部署需自行额外部署 MySQL 数据库服务**（Docker 部署由容器编排自动提供），**推荐直接使用 phpstudy 自带的数据库**——在小皮面板中启动 MySQL 即可；请确保账号密码与靶场配置一致（默认 `root/root`，不一致时修改 `shop-java-backend/src/main/resources/application.yml` 数据源配置），库和表无需手动创建，首次启动自动初始化
- Windows 下每个服务在独立命令行窗口运行（关闭窗口即停止）；Linux 下后台运行（PID 与日志见各自 `logs/` 目录）
- 启动后访问：前台门户 `http://localhost:8080/`，商城靶场 `http://localhost:8081/`
- 商城靶场以 `range_java/pentest/shop_java` 为工作目录启动（`database/init_database.sql` 按工作目录优先读取），由根级脚本自动保证

<details>
<summary>📖 备用脚本（手动编译 / 停止服务）</summary>

`build` 脚本仅手动编译打包（不启动），通常无需单独执行——`start` 脚本会按需自动构建：

```bash
# 手动编译（参数含义同 start：不写默认编译全部）
build.bat              # Windows：编译全部
./build.sh             # Linux / macOS / GitBash：编译全部
./build.sh shop        # 示例：仅编译商城靶场

# 停止后台服务（Linux / macOS / GitBash，参数含义同上）
./stop.sh              # 停止全部后台服务
./stop.sh shop         # 仅停止商城靶场
```

Windows 下停止服务直接关闭对应服务的命令行窗口即可（仓库无 stop.bat）。

</details>

<details>
<summary>📖 手动源码启动（不使用脚本）</summary>

```bash
# 前台门户（8080）
cd portal-java && mvn package -DskipTests
java -jar target/portal-java.jar

# 商城靶场（以 --server.port 覆盖为 8081）
cd range_java/pentest/shop_java/shop-java-backend && mvn package -DskipTests
cd .. && java --add-opens java.base/java.lang=ALL-UNNAMED \
  -jar shop-java-backend/target/shop-java-backend.jar --server.port=8081
```

</details>

## 靶场使用指南

- 前台门户卡片的学习状态（待学习/学习中/已掌握）保存在**浏览器本地**，靶场内部的星级与成就在靶场系统中独立保存
- 商城靶场内置**短信模拟器**（页面右上角入口，含自动化取码接口文档）、图片验证码、星级与成就体系
- 商城靶场右上角提供**重置按钮**，可将靶场数据库恢复初始状态
- 靶场不提供具体操作步骤，请通过互联网或 AI 学习相关技术，或关注公众号获取攻略

## 目录结构

```
heasecdev/
├── portal-java/                     # 前台门户（Spring Boot，8080，纯静态导航）
│   └── src/main/resources/static/   # Vue2 SPA 静态资源（index.html/css/js/assets）
├── range_java/
│   └── pentest/shop_java/           # 商城系统综合实战靶场（本地8081/Docker容器8080）
│       ├── shop-java-backend/       # Spring Boot 3.2 后端（含已构建的前端静态资源）
│       ├── shop-java-frontend/      # Vue 3 + Vite 前端源码
│       └── database/init_database.sql
├── build.bat / build.sh             # 编译脚本（all / portal / shop）
├── start.bat / start.sh             # 启动脚本（all / portal / shop，自动构建检测）
├── stop.sh                          # 停止后台服务（Linux/GitBash）
├── docker-compose.yml               # db + portal-java(8080) + shop-java(8081)
└── docs/                            # 设计文档（商城JAVA版设计 / 技能创建 / 推广宣传）
```

## 开源许可证

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](LICENSE)

本项目基于 [GNU General Public License v3.0](LICENSE) 协议开源。

这意味着你可以自由地使用、修改和分发本项目，但衍生作品必须同样以 GPL-3.0 协议发布，且必须保留原始版权声明和协议声明。

```
天积安全 - 网络安全靶场系统
Copyright (C) 2026 天积安全 (HeavenlySecret)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

## 联系我们

<p align="center">
<a href="https://gitee.com/HeaSec/">
<img src="https://img.shields.io/badge/Gitee-HeaSec-C71D23?logo=gitee&logoColor=white" alt="Gitee">
</a>
<a href="https://github.com/HeaSec/">
<img src="https://img.shields.io/badge/GitHub-HeaSec-181717?logo=github&logoColor=white" alt="GitHub">
</a>
</p>

- **Gitee**：[https://gitee.com/HeaSec/](https://gitee.com/HeaSec/)
- **GitHub**：[https://github.com/HeaSec/](https://github.com/HeaSec/)
- **核心成员**：WindFtsy · Vista_Ax · Lyan
- **微信公众号**：天积安全（关注后可加入微信群交流）

<p align="center">
<img src="portal-java/src/main/resources/static/assets/gzhewm.jpg" alt="天积安全微信公众号" width="200">
</p>

<p align="center">
<i>关注公众号获取官方通关攻略与最新动态</i>
</p>

---

> **⚠️ 特别声明**
>
> 本平台为**开源网络安全训练环境**，仅供合法授权的安全学习、技术研究与攻防演练。**严禁**利用本平台及相关技术从事任何违法行为。
>
> **⚠️ 安全警告**：本平台代码**故意包含大量已知安全漏洞**，仅适合在本地隔离环境或严格访问控制的内部网络部署。**切勿直接部署于互联网**，否则极易导致服务器被非法入侵或滥用。因不当部署引发的安全事件及法律责任，由部署者自行承担，项目贡献者不承担任何责任。
