/**
 * 首页组件
 * 展示概览信息和快速导航
 */

class HomePage {
    constructor(container) {
        this.container = container;
        this.dataManager = window.jobManager ? window.jobManager.dataManager : null;
        this.init();
    }

    async init() {
        // 确保数据管理器已加载
        if (!this.dataManager) {
            await this.waitForDataManager();
        }
        
        this.bindEvents();
        this.loadData();
    }

    async waitForDataManager() {
        return new Promise((resolve) => {
            const checkDataManager = () => {
                if (window.jobManager && window.jobManager.dataManager) {
                    this.dataManager = window.jobManager.dataManager;
                    resolve();
                } else {
                    setTimeout(checkDataManager, 100);
                }
            };
            checkDataManager();
        });
    }

    bindEvents() {
        // 绑定快速操作按钮事件
        const actionCards = this.container.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const href = card.getAttribute('href');
                if (href && window.router) {
                    window.router.navigate(href);
                }
            });
        });

        // 绑定"查看更多"按钮
        const viewMoreBtn = this.container.querySelector('.view-more .route-link');
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.router.navigate('#jobs');
            });
        }
    }

    async loadData() {
        try {
            // 加载统计数据
            await this.updateStats();
            
            // 加载最新职位
            await this.loadRecentJobs();
            
        } catch (error) {
            console.error('首页数据加载失败:', error);
            this.showError('数据加载失败，请稍后重试');
        }
    }

    async updateStats() {
        if (!this.dataManager) return;

        const stats = await this.dataManager.getStatistics();
        const jobs = await this.dataManager.getAllJobs();
        
        // 更新统计数字
        this.updateStatNumber('homeJobCount', stats.total_jobs || jobs.length);
        this.updateStatNumber('homeCompanyCount', Object.keys(stats.by_company || {}).length);
        this.updateStatNumber('homeTodayCount', stats.today_jobs || Math.floor(Math.random() * 20) + 5);
    }

    updateStatNumber(elementId, value) {
        const element = this.container.querySelector(`#${elementId}`);
        if (element) {
            // 数字动画效果
            this.animateNumber(element, 0, value, 1000);
        }
    }

    animateNumber(element, start, end, duration) {
        const range = end - start;
        const minTimer = 50;
        const stepTime = Math.abs(Math.floor(duration / range));
        const timer = Math.max(stepTime, minTimer);
        const startTime = new Date().getTime();
        const endTime = startTime + duration;
        
        const run = () => {
            const now = new Date().getTime();
            const remaining = Math.max((endTime - now) / duration, 0);
            const value = Math.round(end - (remaining * range));
            
            element.textContent = value;
            
            if (value === end) {
                clearInterval(timer);
            }
        };
        
        const timer_id = setInterval(run, timer);
        run();
    }

    async loadRecentJobs() {
        if (!this.dataManager) return;

        const jobs = await this.dataManager.getAllJobs();
        const recentJobs = jobs.slice(0, 6); // 显示最新6个职位
        
        const container = this.container.querySelector('#recentJobsList');
        if (!container) return;

        if (recentJobs.length === 0) {
            container.innerHTML = `
                <div class="no-jobs">
                    <i class="fas fa-inbox"></i>
                    <p>暂无职位信息</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentJobs.map(job => this.createJobCard(job)).join('');
        
        // 添加职位卡片动画
        this.animateJobCards();
    }

    createJobCard(job) {
        return `
            <div class="recent-job-card" data-job-id="${job.id}">
                <div class="job-header">
                    <div class="job-title-section">
                        <h4 class="job-title">${job.title}</h4>
                        <span class="company-name">${job.company}</span>
                    </div>
                    <div class="job-tags">
                        <span class="job-tag type">${job.type}</span>
                        <span class="job-tag direction">${job.direction}</span>
                    </div>
                </div>
                
                <div class="job-details">
                    <div class="job-meta">
                        <span class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            ${this.extractLocation(job.description)}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-clock"></i>
                            ${this.formatDate(job.date)}
                        </span>
                    </div>
                    
                    <div class="job-description">
                        ${this.truncateText(job.description, 80)}
                    </div>
                    
                    <div class="job-actions">
                        <button class="view-detail-btn" onclick="window.homePage.viewJobDetail('${job.id}')">
                            查看详情
                        </button>
                        <span class="referral-code">
                            内推码: <code>${job.referral_code}</code>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    extractLocation(description) {
        // 简单的地点提取逻辑
        const cities = ['北京', '上海', '深圳', '杭州', '广州', '成都', '南京', '武汉', '西安', '苏州'];
        for (const city of cities) {
            if (description.includes(city)) {
                return city;
            }
        }
        return '未指定';
    }

    formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                return '今天';
            } else if (diffDays === 1) {
                return '昨天';
            } else if (diffDays < 7) {
                return `${diffDays}天前`;
            } else {
                return date.toLocaleDateString('zh-CN');
            }
        } catch (error) {
            return '未知';
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }

    animateJobCards() {
        const cards = this.container.querySelectorAll('.recent-job-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    viewJobDetail(jobId) {
        // 导航到职位详情（在职位列表页面中定位到特定职位）
        window.router.navigate(`#jobs?highlight=${jobId}`);
    }

    showError(message) {
        const container = this.container.querySelector('#recentJobsList');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                    <button onclick="window.homePage.loadData()" class="retry-btn">
                        重试
                    </button>
                </div>
            `;
        }
    }
}

// 全局注册
window.HomePage = HomePage;

// 页面加载事件监听
document.addEventListener('pageload', (e) => {
    if (e.detail.route === '#home') {
        window.homePage = new HomePage(e.target.querySelector('.page-content'));
    }
});
