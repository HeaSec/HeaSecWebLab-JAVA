/**
 * HeaSec Vue组件集合
 * @package HeavenlySecret\Frontend
 * @version HeaSec v1.0.0
 */

// 分类项目组件
// 分类项目组件
Vue.component('category-item', {
    props: {
        category: Object,
        subcategories: Array,
        selectedCategory: Number,
        selectedSubcategory: Number,
        collapsedCategories: Object,
        sidebarCollapsed: Boolean
    },
    data() {
        return {
            showFlyout: false,
            flyoutTimer: null,
            flyoutStyle: {}
        };
    },
    template: '<div class="category-section" @mouseleave="handleMouseLeave">' +
        '<div ' +
        'class="category-header" ' +
        ':class="{ ' +
        'active: String(selectedCategory) === String(category.id), ' +
        '\'no-subcategories\': subcategories.length === 0, ' +
        '\'active-parent\': hasActiveChild ' +
        '}" ' +
        '@click="handleCategoryClick" ' +
        '@mouseover="handleMouseOver($event)" ' +
        ':data-title="category.name" ' +
        '>' +
        '<i :class="getCategoryIcon(category.id)"></i> ' +
        '<span>{{ category.name }}</span> ' +
        '<i ' +
        'v-if="subcategories.length > 0" ' +
        'class="toggle-icon" ' +
        ':class="[' +
        '\'fa\',' +
        'isCollapsed ? \'fa-chevron-right\' : \'fa-chevron-down\'' +
        ']" ' +
        '@click.stop="toggleCategory" ' +
        '></i>' +
        '</div>' +

        '<!-- 常规折叠菜单 -->' +
        '<div ' +
        'class="subcategory-list" ' +
        ':class="{ collapsed: isCollapsed }"' +
        '>' +
        '<div ' +
        'v-for="subcategory in subcategories" ' +
        ':key="subcategory.id" ' +
        'class="subcategory-item" ' +
        ':class="{ active: String(selectedSubcategory) === String(subcategory.id) }" ' +
        '@click="selectSubcategory(subcategory.id)" ' +
        '>' +
        '<i class="fa fa-folder-o"></i> ' +
        '<span>{{ subcategory.name }}</span>' +
        '</div>' +
        '</div>' +

        '<!-- 侧边栏收起时的悬浮菜单 -->' +
        '<div ' +
        'v-if="sidebarCollapsed && subcategories.length > 0" ' +
        'class="flyout-menu" ' +
        ':class="{ visible: showFlyout }" ' +
        ':style="flyoutStyle" ' +
        '@mouseover="keepFlyoutOpen" ' +
        '>' +
        '<div class="flyout-header">{{ category.name }}</div>' +
        '<div ' +
        'v-for="subcategory in subcategories" ' +
        ':key="\'flyout-\' + subcategory.id" ' +
        'class="flyout-item" ' +
        ':class="{ active: String(selectedSubcategory) === String(subcategory.id) }" ' +
        '@click="handleFlyoutClick(subcategory.id)" ' +
        '>' +
        '<i class="fa fa-folder-o"></i> ' +
        '<span>{{ subcategory.name }}</span>' +
        '</div>' +
        '</div>' +

        '</div>',
    computed: {
        isCollapsed() {
            return this.collapsedCategories[String(this.category.id)] || false;
        },
        hasActiveChild() {
            if (!this.subcategories || this.subcategories.length === 0) return false;
            // Check if any subcategory is currently selected
            return this.subcategories.some(sub => String(sub.id) === String(this.selectedSubcategory));
        }
    },
    methods: {
        handleCategoryClick() {
            // Emit special event for auto-expand logic
            this.$emit('category-click', this.category.id);
            this.selectCategory();
        },
        getCategoryIcon(categoryId) {
            const iconMap = {
                1: 'fa fa-code',
                2: 'fa fa-paint-brush',
                3: 'fa fa-graduation-cap',
                4: 'fa fa-newspaper-o',
                5: 'fa fa-gamepad'
            };
            return iconMap[categoryId] || 'fa fa-folder';
        },
        selectCategory() {
            this.$emit('select-category', this.category.id);
        },
        selectSubcategory(subcategoryId) {
            this.$emit('select-subcategory', subcategoryId);
        },
        toggleCategory() {
            this.$emit('toggle-category', this.category.id);
        },
        // HeaSec Update: Consolidated hover logic
        handleMouseOver(event) {
            // Show tooltip if needed
            this.$emit('show-tooltip', event, this.category.name);

            // Handle flyout menu
            if (this.sidebarCollapsed && this.subcategories.length > 0) {
                clearTimeout(this.flyoutTimer);

                // Calculate fixed position
                const target = event.target.closest('.category-section');
                if (target) {
                    const rect = target.getBoundingClientRect();
                    this.flyoutStyle = {
                        top: rect.top + 'px',
                        left: (rect.right + 10) + 'px' // 10px gap
                    };
                }

                this.showFlyout = true;
            }
        },
        handleMouseLeave() {
            this.$emit('hide-tooltip');

            if (this.sidebarCollapsed) {
                this.flyoutTimer = setTimeout(() => {
                    this.showFlyout = false;
                }, 300); // 300ms delay to allow moving to the flyout
            }
        },
        keepFlyoutOpen() {
            clearTimeout(this.flyoutTimer);
            this.showFlyout = true;
        },
        handleFlyoutClick(subcategoryId) {
            this.selectSubcategory(subcategoryId);
            this.showFlyout = false;
        }
    }
});

// 首页介绍组件
Vue.component('home-intro', {
    data() {
        return {
            expandedSections: { usage: true, contact: true }
        };
    },
    template: '<div class="home-intro">' +
        '<!-- 平台简介 -->' +
        '<div class="home-intro-card home-brief-card">' +
        '<div class="home-brief-icon"><i class="fa fa-shield"></i></div>' +
        '<div class="home-brief-content">' +
        '<p>本系统是<strong>天积安全团队（HeavenlySecret）</strong>开发的WEB安全靶场平台<strong> JAVA版分支</strong>，采用 <strong>Spring Boot + Vue</strong> 纯Java技术栈构建，适合已有一定基础的用户检验和提升WEB安全技能，也可以作为安全测试的环境。<br />当前分支提供<strong class="text-highlight-blue">商城系统综合实战（JAVA版）</strong>靶场，该靶场<strong class="text-highlight-blue">基于PHP版本升级</strong>，在保留原有功能和漏洞的基础上新增了Java相关安全漏洞，覆盖业务逻辑、输入验证及Java特有漏洞共17种类型，<strong class="text-highlight-blue">通过左侧导航选择分类并点击靶场卡片</strong>即可进入靶场，完成学习后可<strong class="text-highlight-green">点击卡片角标标记学习状态</strong>。</p>' +
        '</div>' +
        '</div>' +

        '<!-- 手风琴板块 -->' +
        '<div class="home-accordion">' +
        '<!-- 基础配置 -->' +
        '<div class="home-accordion-item" :class="{ expanded: expandedSections.config }">' +
        '<div class="home-accordion-header" @click="toggleSection(\'config\')">' +
        '<div class="home-accordion-title"><i class="fa fa-cogs"></i><span>基础配置</span></div>' +
        '<i class="fa home-accordion-arrow" :class="expandedSections.config ? \'fa-chevron-down\' : \'fa-chevron-right\'"></i>' +
        '</div>' +
        '<div class="home-accordion-body" v-show="expandedSections.config">' +
        '<div class="home-config-grid">' +
        '<div class="home-config-item">' +
        '<div class="home-config-label"><i class="fa fa-server"></i> 推荐服务器环境</div>' +
        '<div class="home-config-value">JDK 17+，Maven 3.6+，MySQL 5.7+（仅商城靶场需要），使用项目根目录的 <strong>build/start 脚本</strong>即可一键编译启动（支持 Docker 部署），JDK 版本过低会导致服务无法启动。</div>' +
        '</div>' +
        '<div class="home-config-item">' +
        '<div class="home-config-label"><i class="fa fa-database"></i> 数据库配置</div>' +
        '<div class="home-config-value">' +
        '<ul class="home-config-list">' +
        '<li><strong class="text-highlight-orange">本地部署需自行额外部署 MySQL 数据库服务</strong>（Docker 部署由容器自动提供），<strong class="text-highlight-blue">推荐使用 phpstudy 自带的数据库</strong>，启动小皮面板中的 MySQL 即可，需确保账号密码与靶场配置一致（默认 <code>root/root</code>）；前台门户为纯静态导航，无需数据库；商城靶场使用独立的 <code>shop_java</code> 数据库，首次启动时自动建库建表并初始化种子数据，无需手动导入。</li>' +
        '<li>学习进度数据仅保存在<strong class="text-highlight-blue">当前浏览器本地</strong>，更换浏览器或清除站点数据后不会保留；靶场内部数据可在靶场页面内使用其自带的重置功能恢复初始状态。</li>' +
        '<li>数据库表前缀：默认使用 <code>heasec_</code>，商城靶场各表使用 <code>heasec_shop_</code> 前缀。</li>' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<!-- 靶场使用 -->' +
        '<div class="home-accordion-item" :class="{ expanded: expandedSections.usage }">' +
        '<div class="home-accordion-header" @click="toggleSection(\'usage\')">' +
        '<div class="home-accordion-title"><i class="fa fa-gamepad"></i><span>靶场使用</span></div>' +
        '<i class="fa home-accordion-arrow" :class="expandedSections.usage ? \'fa-chevron-down\' : \'fa-chevron-right\'"></i>' +
        '</div>' +
        '<div class="home-accordion-body" v-show="expandedSections.usage">' +
        '<div class="heasec-alert-box">' +
        '<div class="heasec-alert-icon"><i class="fa fa-info-circle"></i></div>' +
        '<div class="heasec-alert-content">' +
        '靶场<strong class="text-highlight-green">不提供具体的操作步骤</strong>，请<strong class="text-highlight-orange">自行通过互联网或者AI学习</strong>相关技术完成漏洞挖掘，<strong class="text-highlight-green">阅读靶场页面的提示和靶场说明</strong>可以了解任务要求，也可以<strong class="text-highlight-blue">关注天积安全公众号</strong>获取官方通关攻略（持续更新中……）。' +
        '</div>' +
        '</div>' +

        '<div class="home-subsection">' +
        '<div class="home-subsection-title"><i class="fa fa-puzzle-piece"></i> 靶场模式</div>' +
        '<div class="home-mode-grid">' +
        '<div class="home-mode-card">' +
        '<div class="home-mode-name"><i class="fa fa-search"></i> 漏洞挖掘模式</div>' +
        '<div class="home-mode-desc">模拟真实场景中的漏洞挖掘过程，需要在商城系统中发现存在的漏洞并在<strong class="text-highlight-blue">漏洞提交表单中提交</strong>发现的漏洞，根据正确提交的漏洞获得不同的分数奖励，<strong class="text-highlight-green">达到指定分数后即可解锁星级</strong>（2000/4000/6000分对应1/2/3星，积分上限已由PHP版的4800分提升至满分6000）。</div>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="home-subsection">' +
        '<div class="home-subsection-title"><i class="fa fa-signal"></i> 靶场难度</div>' +
        '<div class="home-difficulty-list">' +
        '<div class="home-difficulty-item">' +
        '<span class="home-difficulty-badge difficulty-practical">实战</span>' +
        '<span class="home-difficulty-desc">模拟真实的商城业务场景，需要综合利用多种技术，提示信息较少。</span>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="home-subsection">' +
        '<div class="home-subsection-title"><i class="fa fa-lightbulb-o"></i> 提示信息</div>' +
        '<div class="home-tips-cards">' +

        '<div class="home-tip-card">' +
        '<div class="tip-icon tip-icon-shield"><i class="fa fa-shield"></i></div>' +
        '<div class="tip-content">' +
        '<div class="tip-title">会话与数据隔离</div>' +
        '<div class="tip-desc">商城靶场独立运行，使用自己的会话（<code class="heasec-code-highlight">HEASEC_RANGE_SHOPJAVA_SESSION</code>）实现会话隔离，数据库使用独立的 <code class="heasec-code-highlight">shop_java</code> 库（表前缀 <code class="heasec-code-highlight">heasec_shop_</code>），与前台的会话和数据互不影响。</div>' +
        '</div>' +
        '</div>' +

        '<div class="home-tip-card">' +
        '<div class="tip-icon tip-icon-refresh"><i class="fa fa-refresh"></i></div>' +
        '<div class="tip-content">' +
        '<div class="tip-title">独立重置功能</div>' +
        '<div class="tip-desc">靶场页面内提供<strong class="text-highlight-green">重置功能</strong>可将商城靶场恢复为初始状态，重置靶场<strong class="text-highlight-green">不会影响前台标记的学习状态</strong>。注意重置后靶场内的账号数据、通关记录等会恢复初始值。</div>' +
        '</div>' +
        '</div>' +

        '<div class="home-tip-card">' +
        '<div class="tip-icon tip-icon-mobile"><i class="fa fa-mobile" style="font-size: 1.2em;"></i></div>' +
        '<div class="tip-content">' +
        '<div class="tip-title">短信模拟器</div>' +
        '<div class="tip-desc">商城靶场内置<strong class="text-highlight-blue">短信模拟器</strong>（靶场页面导航栏入口），注册、找回密码等操作所需的手机验证码可在短信模拟器页面按手机号查看，还提供自动化取码接口文档。</div>' +
        '</div>' +
        '</div>' +

        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<!-- 联系我们 -->' +
        '<div class="home-accordion-item" :class="{ expanded: expandedSections.contact }">' +
        '<div class="home-accordion-header" @click="toggleSection(\'contact\')">' +
        '<div class="home-accordion-title"><i class="fa fa-comments-o"></i><span>联系我们</span></div>' +
        '<i class="fa home-accordion-arrow" :class="expandedSections.contact ? \'fa-chevron-down\' : \'fa-chevron-right\'"></i>' +
        '</div>' +
        '<div class="home-accordion-body" v-show="expandedSections.contact">' +
        '<div class="home-contact-list">' +
        '<div class="home-contact-item">' +
        '<i class="fa fa-github"></i>' +
        '<div class="home-contact-info">' +
        '<div class="home-contact-label">开源项目地址 (GitHub)</div>' +
        '<a class="home-contact-link" href="https://github.com/HeaSec/" target="_blank" rel="noopener">https://github.com/HeaSec/</a>' +  
        '</div>' +
        '</div>' +
        '<div class="home-contact-item">' +
        '<i class="fa fa-git-square" style="color: #c71d23;"></i>' +
        '<div class="home-contact-info">' +
        '<div class="home-contact-label">开源项目地址 (Gitee)</div>' +
        '<a class="home-contact-link" href="https://gitee.com/HeaSec/" target="_blank" rel="noopener">https://gitee.com/HeaSec/</a>' +
        '</div>' +
        '</div>' +
        '<div class="home-contact-item">' +
        '<i class="fa fa-wechat"></i>' +
        '<div class="home-contact-info">' +
        '<div class="home-contact-label">关注微信公众号：天积安全</div>' +
        '<div style="margin-top: 12px;">' +
        '<img src="assets/gzhewm.jpg" alt="天积安全公众号二维码" style="max-width: 160px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); border: 1px solid rgba(0,0,0,0.05);">' +
        '<div class="home-contact-desc">关注公众号后可以加入微信群进行交流</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<!-- 安全警告 -->' +
        '<div class="home-warning-card">' +
        '<div class="home-warning-header"><i class="fa fa-exclamation-triangle"></i> 安全警告</div>' +
        '<div class="home-warning-content">' +
        '<p>本平台为开源网络安全训练环境，仅供用户进行<strong>合法</strong>的安全学习、技术研究与攻防演练。<strong>严禁</strong>利用本平台及相关技术从事任何危害网络安全、侵犯他人权益或违反现行法律法规的活动。</p>' +
        '</div>' +
        '<div class="home-warning-severe">' +
        '<div class="home-warning-severe-title"><i class="fa fa-ban"></i> 特别警告</div>' +
        '<p>本平台代码<strong>故意包含大量已知安全漏洞</strong>，仅适合在本地隔离环境或严格访问控制的内部网络部署。<strong>切勿直接部署于互联网</strong>，否则极易导致服务器被非法入侵或滥用。因不当部署引发的安全事件及法律责任，由部署者自行承担，项目贡献者不承担任何责任。</p>' +
        '</div>' +
        '</div>' +

        '</div>',
    methods: {
        toggleSection(section) {
            this.$set(this.expandedSections, section, !this.expandedSections[section]);
        }
    }
});

// 分类描述组件
Vue.component('category-description', {
    props: {
        description: String
    },
    template: '<div class="category-description-container">' +
        '<div class="category-description-content">' +
        '<div style="display: flex; align-items: flex-start;">' +
        '<i class="fa fa-info-circle description-icon"></i> ' +
        '<div class="description-text">{{ description }}</div>' +
        '</div>' +
        '</div>' +
        '</div>'
});

// 链接卡片组件
Vue.component('link-card', {
    props: {
        link: Object
    },
    template: '<div class="card heasec-card" @click="openLink">' +
        '<div class="card-content">' +
        '<div class="card-title-wrapper">' +
        '<span class="difficulty-badge" :class="getDifficultyClass(link.difficulty)">{{ getDifficultyText(link.difficulty) }}</span>' +
        '<h3 class="card-title">' +
        '{{ link.title }} ' +
        '</h3>' +
        '<i class="fa fa-external-link card-external-link"></i>' +
        '</div>' +
        '<p class="card-description">{{ link.description }}</p>' +
        '</div>' +
        '<div ' +
        'class="learning-status-container" ' +
        ':data-learning-status="link.id" ' +
        '@click.stop="updateLearningStatus" ' +
        '>' +
        '<i class="fa fa-star learning-star" :class="getLearningStatusClass(link.learning_status)"></i>' +
        '<span class="learning-status-text" :class="getLearningStatusClass(link.learning_status)">{{ getLearningStatusText(link.learning_status) }}</span>' +
        '</div>' +
        '</div>',
    methods: {
        getDifficultyClass(difficulty) {
            const classMap = {
                '基础': 'difficulty-basic',
                '进阶': 'difficulty-intermediate',
                '拓展': 'difficulty-advanced',
                '实战': 'difficulty-practical'
            };
            return classMap[difficulty] || 'difficulty-basic';
        },

        getDifficultyText(difficulty) {
            return difficulty || '基础';
        },

        getLearningStatusText(status) {
            return status || '待学习';
        },

        getLearningStatusClass(status) {
            const classMap = {
                '待学习': 'not_started',
                '学习中': 'in_progress',
                '已掌握': 'mastered'
            };
            return classMap[status] || 'not_started';
        },

        openLink() {
            this.$emit('open-link', this.link.url);
        },

        updateLearningStatus() {
            this.$emit('update-learning-status', this.link.id, this.link.learning_status || '待学习');
        }
    }
});

// 链接卡片容器组件
Vue.component('link-cards', {
    props: {
        filteredLinks: Array,
        groupedLinks: Object,
        selectedSubcategory: Number,
        selectedThirdLevelCategory: Number,
        collapsedSubcategories: Object,
        collapsedThirdLevelCategories: Object
    },
    template: '<div>' +
        '<!-- 三级分类的直接链接 -->' +
        '<div v-if="selectedThirdLevelCategory && filteredLinks.length > 0">' +
        '<div class="cards-grid">' +
        '<link-card v-for="link in filteredLinks" :key="link.id" :link="link" @open-link="openLink" @update-learning-status="updateLearningStatus"></link-card>' +
        '</div>' +
        '</div>' +

        '<!-- 二级分类的直接链接和三级分类分组 -->' +
        '<div v-else-if="selectedSubcategory && filteredLinks.length > 0">' +
        '<!-- 当前二级分类的直接链接，直接展示 -->' +
        '<div v-if="getDirectLinksForSubcategory().length > 0" class="cards-grid">' +
        '<link-card v-for="link in getDirectLinksForSubcategory()" :key="link.id" :link="link" @open-link="openLink" @update-learning-status="updateLearningStatus"></link-card>' +
        '</div>' +

        '<!-- 三级分类分组显示，与二级分类展示形式一致 -->' +
        '<div ' +
        'v-for="(data, thirdLevelCategoryId) in getThirdLevelCategoriesForSubcategory()" ' +
        ':key="thirdLevelCategoryId" ' +
        'class="links-section"' +
        '>' +
        '<div ' +
        'class="section-header collapsible" ' +
        ':class="{ collapsed: isThirdLevelCategoryCollapsed(data.thirdLevelCategory.id) }" ' +
        '@click="toggleThirdLevelCategory(data.thirdLevelCategory.id)" ' +
        '>' +
        '<h3>' +
        '<i :class="isThirdLevelCategoryCollapsed(data.thirdLevelCategory.id) ? \'fa fa-folder-o\' : \'fa fa-folder-open-o\'"></i> ' +
        '{{ data.thirdLevelCategory.name }} ' +
        '<span class="link-count">({{ data.links.length }})</span>' +
        '</h3>' +
        '<i ' +
        'class="toggle-icon" ' +
        ':class="[' +
        '\'fa\',' +
        'isThirdLevelCategoryCollapsed(data.thirdLevelCategory.id) ? \'fa-chevron-right\' : \'fa-chevron-down\'' +
        ']" ' +
        '></i>' +
        '</div>' +
        '<div class="cards-grid" :class="{ collapsed: isThirdLevelCategoryCollapsed(data.thirdLevelCategory.id) }">' +
        '<link-card v-for="link in data.links" :key="link.id" :link="link" @open-link="openLink" @update-learning-status="updateLearningStatus"></link-card>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<!-- 一级分类的分组链接 -->' +
        '<div v-else-if="!selectedSubcategory && !selectedThirdLevelCategory">' +
        '<!-- 直属链接 -->' +
        '<div v-if="groupedLinks.direct.length > 0" class="cards-grid direct-links">' +
        '<link-card v-for="link in groupedLinks.direct" :key="link.id" :link="link" @open-link="openLink" @update-learning-status="updateLearningStatus"></link-card>' +
        '</div>' +

        '<!-- 二级分类链接 -->' +
        '<div ' +
        'v-for="(data, subcategoryId) in groupedLinks.subcategories" ' +
        ':key="subcategoryId" ' +
        'class="links-section" ' +
        '>' +
        '<div ' +
        'class="section-header collapsible" ' +
        ':class="{ collapsed: isSubcategoryCollapsed(data.subcategory.id) }" ' +
        '@click="toggleSubcategory(data.subcategory.id)" ' +
        '>' +
        '<h3>' +
        '<i :class="isSubcategoryCollapsed(data.subcategory.id) ? \'fa fa-folder-o\' : \'fa fa-folder-open\'"></i> ' +
        '{{ data.subcategory.name }} ' +
        '<span class="link-count">({{ data.links.length }})</span>' +
        '</h3>' +
        '<i ' +
        'class="toggle-icon" ' +
        ':class="[' +
        '\'fa\',' +
        'isSubcategoryCollapsed(data.subcategory.id) ? \'fa-chevron-right\' : \'fa-chevron-down\'' +
        ']" ' +
        '></i>' +
        '</div>' +
        '<div class="cards-grid" :class="{ collapsed: isSubcategoryCollapsed(data.subcategory.id) }">' +
        '<link-card v-for="link in data.links" :key="link.id" :link="link" @open-link="openLink" @update-learning-status="updateLearningStatus"></link-card>' +
        '</div>' +
        '</div>' +

        '<!-- 三级分类链接 -->' +
        '<div ' +
        'v-for="(data, thirdLevelCategoryId) in groupedLinks.thirdLevelCategories" ' +
        ':key="thirdLevelCategoryId" ' +
        'class="links-section" ' +
        '>' +
        '<div ' +
        'class="section-header collapsible third-level" ' +
        ':class="{ collapsed: isThirdLevelCategoryCollapsed(data.thirdLevelCategory.id) }" ' +
        '@click="selectThirdLevelCategory(data.thirdLevelCategory.id)" ' +
        '>' +
        '<h3>' +
        '<i :class="isThirdLevelCategoryCollapsed(data.thirdLevelCategory.id) ? \'fa fa-folder-o\' : \'fa fa-folder-open\'"></i> ' +
        '{{ data.thirdLevelCategory.name }} ' +
        '<span class="link-count">({{ data.links.length }})</span>' +
        '</h3>' +
        '<i ' +
        'class="toggle-icon" ' +
        ':class="[' +
        '\'fa\',' +
        'isThirdLevelCategoryCollapsed(data.thirdLevelCategory.id) ? \'fa-chevron-right\' : \'fa-chevron-down\'' +
        ']" ' +
        '></i>' +
        '</div>' +
        '<div class="cards-grid" :class="{ collapsed: isThirdLevelCategoryCollapsed(data.thirdLevelCategory.id) }">' +
        '<link-card v-for="link in data.links" :key="link.id" :link="link" @open-link="openLink" @update-learning-status="updateLearningStatus"></link-card>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>',
    methods: {
        isSubcategoryCollapsed(subcategoryId) {
            return this.collapsedSubcategories[String(subcategoryId)] || false;
        },
        toggleSubcategory(subcategoryId) {
            this.$emit('toggle-subcategory', subcategoryId);
        },
        isThirdLevelCategoryCollapsed(thirdLevelCategoryId) {
            return this.collapsedThirdLevelCategories[String(thirdLevelCategoryId)] || false;
        },
        toggleThirdLevelCategory(thirdLevelCategoryId) {
            this.$emit('toggle-third-level-category', thirdLevelCategoryId);
        },
        selectThirdLevelCategory(thirdLevelCategoryId) {
            this.$emit('select-third-level-category', thirdLevelCategoryId);
        },
        openLink(url) {
            this.$emit('open-link', url);
        },
        updateLearningStatus(linkId, currentStatus) {
            this.$emit('update-learning-status', linkId, currentStatus);
        },
        // 获取当前二级分类的直接链接（不属于任何三级分类的链接）
        getDirectLinksForSubcategory() {
            if (!this.selectedSubcategory) return [];
            return this.filteredLinks.filter(link => !link.third_level_category_id);
        },
        // 获取当前二级分类的名称
        getSubcategoryName() {
            if (!this.selectedSubcategory) return '';
            const subcategory = this.filteredLinks.find(link => link.subcategory_id === this.selectedSubcategory);
            return subcategory ? subcategory.subcategory_name : '';
        },
        // 获取当前二级分类下的三级分类及其链接
        getThirdLevelCategoriesForSubcategory() {
            if (!this.selectedSubcategory) return {};

            const thirdLevelCategories = {};

            // 从filteredLinks中获取属于当前二级分类的链接
            this.filteredLinks.forEach(link => {
                if (link.third_level_category_id) {
                    const thirdLevelId = String(link.third_level_category_id);
                    if (!thirdLevelCategories[thirdLevelId]) {
                        thirdLevelCategories[thirdLevelId] = {
                            thirdLevelCategory: {
                                id: link.third_level_category_id,
                                name: link.third_level_category_name
                            },
                            links: []
                        };
                    }
                    thirdLevelCategories[thirdLevelId].links.push(link);
                }
            });

            return thirdLevelCategories;
        },
        // HeaSec修复：动态计算卡片宽度，确保网格统一且不截断
        adjustCardWidths() {
            // 使用requestAnimationFrame避免由于DOM未即使更新导致的计算错误
            requestAnimationFrame(() => {
                const container = this.$el;
                if (!container) return;

                const titles = container.querySelectorAll('.card-title');
                // 恢复默认宽度，以便在内容变短时能收缩
                // 我们通过移除内联样式来重置，让CSS的默认值(280px)生效
                container.style.removeProperty('--card-min-width');

                if (titles.length === 0) return;

                let maxTitleWidth = 0;

                // 使用克隆节点测量内容的真实自然宽度（不受当前容器宽度影响）
                titles.forEach(title => {
                    // 深克隆
                    const clone = title.cloneNode(true);

                    // 获取计算样式以确保字体渲染一致
                    const style = window.getComputedStyle(title);

                    // 设置样式强制自然宽度，并复制关键字体属性
                    clone.style.position = 'absolute';
                    clone.style.visibility = 'hidden';
                    clone.style.width = 'auto'; // 关键：解除宽度限制
                    clone.style.whiteSpace = 'nowrap';
                    clone.style.left = '-9999px';

                    // 复制关键文字属性
                    clone.style.fontFamily = style.fontFamily;
                    clone.style.fontSize = style.fontSize;
                    clone.style.fontWeight = style.fontWeight;
                    clone.style.letterSpacing = style.letterSpacing;
                    clone.style.textTransform = style.textTransform;
                    // 必须追加到body以确保计算正确(有些属性可能依赖根元素)
                    document.body.appendChild(clone);

                    const width = clone.offsetWidth;
                    if (width > maxTitleWidth) {
                        maxTitleWidth = width;
                    }

                    // 清理
                    document.body.removeChild(clone);
                });

                // 4. 计算合适列宽: 最大文字宽 + 卡片Padding(约32px) + 图标间距(约15px) + 难度标签(约60px) + 安全余量
                // 当前布局：Padding 15px * 2 = 30px
                // 标题左侧可能有难度标签(60-80px)？不，标题在单独一行或旁边。
                // 结构是: Badge + Title + ExternalLink
                // Badge width ~60px, Title flex, Link ~20px. 
                // 我们测量的只是Title文字。所以 CardMinWidth = TitleWidth + BadgeWidth(80) + Icon(20) + Paddings(40) + Gaps(20)
                // 估算：Title + 140px

                const optimalWidth = Math.max(280, maxTitleWidth + 140);

                console.log('[HeaSec Debug] Measured Max Title Width:', maxTitleWidth, 'Optimal Card Width:', optimalWidth);

                // 5. 应用到整个容器 (利用CSS继承)
                container.style.setProperty('--card-min-width', optimalWidth + 'px');
            });
        },
        // 设置ResizeObserver以监听容器大小变化(虽然主要受内容影响，但布局变化也可能需要重算)
        setupResizeObserver() {
            if (this.resizeObserver) return;
            this.resizeObserver = new ResizeObserver(() => {
                // 防抖，避免过于频繁
                if (this.resizeTimer) clearTimeout(this.resizeTimer);
                this.resizeTimer = setTimeout(() => {
                    this.adjustCardWidths();
                }, 100);
            });
            this.resizeObserver.observe(this.$el);
        }
    },
    mounted() {
        this.adjustCardWidths();
        this.setupResizeObserver();
        // 额外监听窗口resize作为后备
        window.addEventListener('resize', this.adjustCardWidths);
    },
    updated() {
        // 数据更新(如筛选)后必须重算
        this.adjustCardWidths();
    },
    beforeDestroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        window.removeEventListener('resize', this.adjustCardWidths);
    }
});