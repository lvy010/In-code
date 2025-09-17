/**
 * 单页应用路由管理器
 * 实现页面间的无刷新切换和模块化管理
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = '';
        this.history = [];
        this.init();
    }

    init() {
        // 注册路由
        this.registerRoutes();
        
        // 监听浏览器前进后退
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.hash || '#home');
        });
        
        // 监听链接点击
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link, .route-link')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                this.navigate(href);
            }
        });
        
        // 处理初始路由
        const initialRoute = window.location.hash || '#home';
        this.handleRoute(initialRoute);
    }

    registerRoutes() {
        // 注册所有页面路由
        this.routes.set('#home', {
            title: '首页',
            component: 'HomePage',
            template: this.getHomeTemplate(),
            scripts: ['js/home-page.js']
        });

        this.routes.set('#jobs', {
            title: '职位列表',
            component: 'JobsPage', 
            template: this.getJobsTemplate(),
            scripts: ['js/jobs-page.js']
        });

        this.routes.set('#search', {
            title: '高级搜索',
            component: 'SearchPage',
            template: this.getSearchTemplate(),
            scripts: ['js/search-page.js']
        });

        this.routes.set('#analytics', {
            title: '数据分析',
            component: 'AnalyticsPage',
            template: this.getAnalyticsTemplate(),
            scripts: ['js/analytics-page.js']
        });

        this.routes.set('#about', {
            title: '关于我们',
            component: 'AboutPage',
            template: this.getAboutTemplate(),
            scripts: []
        });

        this.routes.set('#settings', {
            title: '设置',
            component: 'SettingsPage',
            template: this.getSettingsTemplate(),
            scripts: ['js/settings-page.js']
        });
    }

    navigate(route) {
        if (route === this.currentRoute) return;
        
        // 更新浏览器历史
        window.history.pushState({ route }, '', route);
        this.handleRoute(route);
    }

    async handleRoute(route) {
        const routeConfig = this.routes.get(route);
        
        if (!routeConfig) {
            console.error('路由不存在:', route);
            return this.navigate('#home');
        }

        // 显示加载状态
        this.showPageLoading();
        
        try {
            // 更新当前路由
            this.currentRoute = route;
            this.history.push(route);
            
            // 更新导航状态
            this.updateNavigation(route);
            
            // 更新页面标题
            document.title = `${routeConfig.title} - 内推宝典`;
            
            // 渲染页面内容
            await this.renderPage(routeConfig);
            
            // 触发页面加载完成事件
            this.triggerPageLoadEvent(route);
            
        } catch (error) {
            console.error('路由处理失败:', error);
            this.showError('页面加载失败');
        } finally {
            this.hidePageLoading();
        }
    }

    async renderPage(routeConfig) {
        const mainContent = document.querySelector('.page-content');
        
        // 页面切换动画
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        
        // 加载必要的脚本
        await this.loadScripts(routeConfig.scripts);
        
        // 渲染模板
        mainContent.innerHTML = routeConfig.template;
        
        // 初始化页面组件
        if (window[routeConfig.component]) {
            new window[routeConfig.component](mainContent);
        }
        
        // 动画恢复
        setTimeout(() => {
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 50);
    }

    async loadScripts(scripts) {
        const promises = scripts.map(src => {
            return new Promise((resolve, reject) => {
                // 检查脚本是否已加载
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        });
        
        await Promise.all(promises);
    }

    updateNavigation(route) {
        // 更新导航栏活跃状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === route) {
                link.classList.add('active');
            }
        });
        
        // 更新面包屑导航
        this.updateBreadcrumb(route);
    }

    updateBreadcrumb(route) {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (!breadcrumb) return;
        
        const routeConfig = this.routes.get(route);
        const breadcrumbHTML = `
            <span class="breadcrumb-item">
                <a href="#home" class="route-link">首页</a>
            </span>
            ${route !== '#home' ? `
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item active">${routeConfig.title}</span>
            ` : ''}
        `;
        
        breadcrumb.innerHTML = breadcrumbHTML;
    }

    showPageLoading() {
        const loadingHTML = `
            <div class="page-loading">
                <div class="loading-spinner"></div>
                <p>加载中...</p>
            </div>
        `;
        
        document.querySelector('.page-content').innerHTML = loadingHTML;
    }

    hidePageLoading() {
        const loading = document.querySelector('.page-loading');
        if (loading) {
            loading.remove();
        }
    }

    showError(message) {
        const errorHTML = `
            <div class="page-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>出错了</h3>
                <p>${message}</p>
                <button onclick="window.router.navigate('#home')" class="btn-primary">
                    返回首页
                </button>
            </div>
        `;
        
        document.querySelector('.page-content').innerHTML = errorHTML;
    }

    triggerPageLoadEvent(route) {
        const event = new CustomEvent('pageload', {
            detail: { route, config: this.routes.get(route) }
        });
        document.dispatchEvent(event);
    }

    // 页面模板定义
    getHomeTemplate() {
        return `
            <div class="home-page">
                <section class="welcome-section">
                    <div class="welcome-content">
                        <h2>欢迎使用内推宝典</h2>
                        <p>专业的计算机求职内推信息整合平台</p>
                        <div class="quick-actions">
                            <a href="#jobs" class="route-link action-card">
                                <i class="fas fa-briefcase"></i>
                                <h3>浏览职位</h3>
                                <p>查看最新内推职位信息</p>
                            </a>
                            <a href="#search" class="route-link action-card">
                                <i class="fas fa-search"></i>
                                <h3>高级搜索</h3>
                                <p>精准筛选心仪职位</p>
                            </a>
                            <a href="#analytics" class="route-link action-card">
                                <i class="fas fa-chart-bar"></i>
                                <h3>数据分析</h3>
                                <p>了解求职市场趋势</p>
                            </a>
                        </div>
                    </div>
                </section>
                
                <section class="stats-overview">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <i class="fas fa-briefcase"></i>
                            <div class="stat-info">
                                <span class="stat-number" id="homeJobCount">0</span>
                                <span class="stat-label">总职位数</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-building"></i>
                            <div class="stat-info">
                                <span class="stat-number" id="homeCompanyCount">0</span>
                                <span class="stat-label">合作企业</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-clock"></i>
                            <div class="stat-info">
                                <span class="stat-number" id="homeTodayCount">0</span>
                                <span class="stat-label">今日更新</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-database"></i>
                            <div class="stat-info">
                                <span class="stat-number">5</span>
                                <span class="stat-label">数据来源</span>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section class="recent-jobs">
                    <h3>最新职位</h3>
                    <div class="recent-jobs-list" id="recentJobsList">
                        <!-- 动态生成最新职位 -->
                    </div>
                    <div class="view-more">
                        <a href="#jobs" class="route-link btn-outline">查看更多职位</a>
                    </div>
                </section>
            </div>
        `;
    }

    getJobsTemplate() {
        return `
            <div class="jobs-page">
                <div class="page-header">
                    <h2>职位列表</h2>
                    <div class="page-actions">
                        <button class="refresh-btn" id="refreshJobs">
                            <i class="fas fa-sync-alt"></i> 刷新数据
                        </button>
                        <a href="#search" class="route-link btn-primary">
                            <i class="fas fa-search"></i> 高级搜索
                        </a>
                    </div>
                </div>
                
                <div class="jobs-filters">
                    <div class="filter-row">
                        <div class="filter-group">
                            <label>职位类型</label>
                            <select id="jobTypeFilter">
                                <option value="">全部</option>
                                <option value="校招">校招</option>
                                <option value="社招">社招</option>
                                <option value="实习">实习</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>技术方向</label>
                            <select id="directionFilter">
                                <option value="">全部</option>
                                <option value="前端">前端</option>
                                <option value="后端">后端</option>
                                <option value="算法">算法</option>
                                <option value="数据">数据</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>搜索</label>
                            <input type="text" id="jobSearchInput" placeholder="搜索公司或职位...">
                        </div>
                    </div>
                </div>
                
                <div class="jobs-results">
                    <div class="results-info">
                        <span id="jobsCount">加载中...</span>
                        <div class="sort-options">
                            <label>排序:</label>
                            <select id="sortJobs">
                                <option value="date">最新发布</option>
                                <option value="company">公司名称</option>
                                <option value="type">职位类型</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="jobs-grid" id="jobsGrid">
                        <!-- 动态生成职位列表 -->
                    </div>
                    
                    <div class="pagination" id="jobsPagination">
                        <!-- 分页控件 -->
                    </div>
                </div>
            </div>
        `;
    }

    getSearchTemplate() {
        return `
            <div class="search-page">
                <div class="page-header">
                    <h2>高级搜索</h2>
                    <p>使用高级筛选条件精准查找心仪职位</p>
                </div>
                
                <div class="search-form">
                    <div class="form-section">
                        <h3>基本条件</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>关键词搜索</label>
                                <input type="text" id="advSearchKeyword" placeholder="输入公司名、职位名或技术栈...">
                            </div>
                            <div class="form-group">
                                <label>职位类型</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" value="校招"> 校招</label>
                                    <label><input type="checkbox" value="社招"> 社招</label>
                                    <label><input type="checkbox" value="实习"> 实习</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>技术方向</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" value="前端"> 前端开发</label>
                                    <label><input type="checkbox" value="后端"> 后端开发</label>
                                    <label><input type="checkbox" value="算法"> 算法工程师</label>
                                    <label><input type="checkbox" value="数据"> 数据科学</label>
                                    <label><input type="checkbox" value="测试"> 测试工程师</label>
                                    <label><input type="checkbox" value="运维"> 运维工程师</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>详细筛选</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>工作地点</label>
                                <select multiple id="citySelect">
                                    <option value="北京">北京</option>
                                    <option value="上海">上海</option>
                                    <option value="深圳">深圳</option>
                                    <option value="杭州">杭州</option>
                                    <option value="广州">广州</option>
                                    <option value="成都">成都</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>数据来源</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" value="牛客"> 牛客网</label>
                                    <label><input type="checkbox" value="力扣"> 力扣</label>
                                    <label><input type="checkbox" value="小红书"> 小红书</label>
                                    <label><input type="checkbox" value="脉脉"> 脉脉</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" id="performSearch" class="btn-primary">
                            <i class="fas fa-search"></i> 搜索
                        </button>
                        <button type="button" id="resetSearch" class="btn-outline">
                            <i class="fas fa-undo"></i> 重置
                        </button>
                        <button type="button" id="saveSearch" class="btn-secondary">
                            <i class="fas fa-save"></i> 保存搜索
                        </button>
                    </div>
                </div>
                
                <div class="search-results" id="searchResults" style="display: none;">
                    <h3>搜索结果</h3>
                    <div class="results-grid" id="searchResultsGrid">
                        <!-- 搜索结果 -->
                    </div>
                </div>
                
                <div class="saved-searches">
                    <h3>保存的搜索</h3>
                    <div class="saved-searches-list" id="savedSearchesList">
                        <!-- 保存的搜索条件 -->
                    </div>
                </div>
            </div>
        `;
    }

    getAnalyticsTemplate() {
        return `
            <div class="analytics-page">
                <div class="page-header">
                    <h2>数据分析</h2>
                    <p>深入了解求职市场趋势和数据洞察</p>
                </div>
                
                <div class="analytics-dashboard">
                    <div class="dashboard-grid">
                        <div class="chart-section">
                            <h3>职位类型分布</h3>
                            <canvas id="typeDistributionChart"></canvas>
                        </div>
                        <div class="chart-section">
                            <h3>技术方向热度</h3>
                            <canvas id="directionHeatChart"></canvas>
                        </div>
                        <div class="chart-section">
                            <h3>发布趋势</h3>
                            <canvas id="trendChart"></canvas>
                        </div>
                        <div class="chart-section">
                            <h3>热门公司</h3>
                            <canvas id="companyChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="insights-section">
                        <h3>市场洞察</h3>
                        <div class="insights-grid">
                            <div class="insight-card">
                                <i class="fas fa-trending-up"></i>
                                <h4>热门技术栈</h4>
                                <p>前端React、后端Spring Boot、算法Python需求最高</p>
                            </div>
                            <div class="insight-card">
                                <i class="fas fa-map-marker-alt"></i>
                                <h4>热门城市</h4>
                                <p>北京、上海、深圳依然是求职热门城市</p>
                            </div>
                            <div class="insight-card">
                                <i class="fas fa-calendar-alt"></i>
                                <h4>最佳时机</h4>
                                <p>秋招季和春招季是内推高峰期</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAboutTemplate() {
        return `
            <div class="about-page">
                <div class="page-header">
                    <h2>关于内推宝典</h2>
                    <p>专业的计算机求职内推信息整合平台</p>
                </div>
                
                <div class="about-content">
                    <section class="intro-section">
                        <h3>项目介绍</h3>
                        <p>内推宝典是一个专为计算机专业学生和从业者打造的求职服务平台。我们致力于整合来自牛客网、力扣、小红书、脉脉等多个平台的内推信息，为求职者提供一站式的求职服务。</p>
                    </section>
                    
                    <section class="features-section">
                        <h3>核心功能</h3>
                        <div class="features-grid">
                            <div class="feature-card">
                                <i class="fas fa-search"></i>
                                <h4>智能搜索</h4>
                                <p>支持多维度筛选和智能推荐</p>
                            </div>
                            <div class="feature-card">
                                <i class="fas fa-chart-line"></i>
                                <h4>数据分析</h4>
                                <p>提供市场趋势和求职洞察</p>
                            </div>
                            <div class="feature-card">
                                <i class="fas fa-mobile-alt"></i>
                                <h4>响应式设计</h4>
                                <p>完美适配各种设备</p>
                            </div>
                            <div class="feature-card">
                                <i class="fas fa-sync"></i>
                                <h4>实时更新</h4>
                                <p>每日自动同步最新数据</p>
                            </div>
                        </div>
                    </section>
                    
                    <section class="contact-section">
                        <h3>联系我们</h3>
                        <div class="contact-info">
                            <div class="contact-item">
                                <i class="fas fa-envelope"></i>
                                <span>lvyovo01@gmail.com</span>
                            </div>
                            <div class="contact-item">
                                <i class="fab fa-github"></i>
                                <span>GitHub开源项目</span>
                            </div>
                        </div>
                    </section>
                    
                    <section class="disclaimer-section">
                        <h3>免责声明</h3>
                        <p>本平台展示的内推信息仅供参考，实际求职时请以官方发布的信息为准。我们不对内推结果承担任何责任，建议用户在使用内推信息时谨慎核实。</p>
                    </section>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div class="settings-page">
                <div class="page-header">
                    <h2>设置</h2>
                    <p>个性化您的使用体验</p>
                </div>
                
                <div class="settings-content">
                    <section class="settings-section">
                        <h3>显示设置</h3>
                        <div class="setting-item">
                            <label>主题模式</label>
                            <select id="themeMode">
                                <option value="light">浅色模式</option>
                                <option value="dark">深色模式</option>
                                <option value="auto">跟随系统</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <label>每页显示数量</label>
                            <select id="pageSize">
                                <option value="10">10条</option>
                                <option value="20">20条</option>
                                <option value="50">50条</option>
                            </select>
                        </div>
                    </section>
                    
                    <section class="settings-section">
                        <h3>数据设置</h3>
                        <div class="setting-item">
                            <label>自动刷新</label>
                            <input type="checkbox" id="autoRefresh">
                            <span>每30分钟自动刷新数据</span>
                        </div>
                        <div class="setting-item">
                            <label>数据来源</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" value="nowcoder" checked> 牛客网</label>
                                <label><input type="checkbox" value="leetcode" checked> 力扣</label>
                                <label><input type="checkbox" value="xiaohongshu" checked> 小红书</label>
                                <label><input type="checkbox" value="maimai" checked> 脉脉</label>
                            </div>
                        </div>
                    </section>
                    
                    <section class="settings-section">
                        <h3>通知设置</h3>
                        <div class="setting-item">
                            <label>桌面通知</label>
                            <input type="checkbox" id="desktopNotifications">
                            <span>有新职位时发送桌面通知</span>
                        </div>
                        <div class="setting-item">
                            <label>关键词提醒</label>
                            <input type="text" id="keywordAlerts" placeholder="输入关键词，用逗号分隔">
                        </div>
                    </section>
                    
                    <div class="settings-actions">
                        <button id="saveSettings" class="btn-primary">
                            <i class="fas fa-save"></i> 保存设置
                        </button>
                        <button id="resetSettings" class="btn-outline">
                            <i class="fas fa-undo"></i> 恢复默认
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// 导出路由器
window.Router = Router;
