// 全局状态管理
class JobManager {
    constructor() {
        this.dataManager = new DataManager();
        this.jobs = [];
        this.filteredJobs = [];
        this.filters = {
            type: 'all',
            direction: 'all',
            source: 'all',
            search: ''
        };
        this.sortBy = 'date';
        this.init();
    }

    async init() {
        this.showLoading(true);
        await this.loadJobs();
        this.bindEvents();
        this.renderJobs();
        this.updateStats();
        this.showLoading(false);
    }

    // 加载职位数据
    async loadJobs() {
        try {
            // 使用数据管理器加载数据
            this.jobs = await this.dataManager.loadData();
            this.filteredJobs = [...this.jobs];
            console.log(`成功加载 ${this.jobs.length} 个职位数据`);
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showError('数据加载失败，请稍后重试');
        }
    }

    // 绑定事件
    bindEvents() {
        // 筛选按钮事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e);
            });
        });

        // 搜索框事件
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        // 排序选择事件
        const sortSelect = document.getElementById('sortSelect');
        sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applySorting();
        });

        // 刷新按钮事件
        const refreshBtn = document.getElementById('refreshData');
        refreshBtn.addEventListener('click', () => {
            this.refreshData();
        });
    }

    // 处理筛选按钮点击
    handleFilterClick(e) {
        const btn = e.target;
        const filterType = btn.dataset.type || btn.dataset.direction || btn.dataset.source;
        const filterCategory = btn.dataset.type ? 'type' : 
                             btn.dataset.direction ? 'direction' : 'source';

        // 移除同组其他按钮的active状态
        btn.parentElement.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active');
        });

        // 添加当前按钮的active状态
        btn.classList.add('active');

        // 更新筛选条件
        this.filters[filterCategory] = filterType;
        this.applyFilters();
    }

    // 应用筛选
    applyFilters() {
        // 使用数据管理器的筛选功能
        this.filteredJobs = this.dataManager.filterJobs(this.filters);
        this.applySorting();
    }

    // 应用排序
    applySorting() {
        // 使用数据管理器的排序功能
        this.filteredJobs = this.dataManager.sortJobs(this.filteredJobs, this.sortBy);
        this.renderJobs();
    }

    // 渲染职位列表
    renderJobs() {
        const jobsGrid = document.getElementById('jobsGrid');
        const loading = document.getElementById('loading');
        const noResults = document.getElementById('noResults');

        loading.style.display = 'none';

        if (this.filteredJobs.length === 0) {
            jobsGrid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        
        jobsGrid.innerHTML = this.filteredJobs.map(job => `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-header">
                    <div>
                        <h3 class="job-title">${job.title}</h3>
                        <p class="job-company">${job.company}</p>
                    </div>
                    <span class="job-source">${job.source}</span>
                </div>
                
                <div class="job-tags">
                    <span class="job-tag type">${job.type}</span>
                    <span class="job-tag direction">${job.direction}</span>
                </div>
                
                <div class="job-info">
                    <div class="job-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(job.date)}
                    </div>
                    <div class="job-code">内推码: ${job.code}</div>
                </div>
            </div>
        `).join('');

        // 添加职位卡片点击事件
        jobsGrid.querySelectorAll('.job-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const jobId = parseInt(card.dataset.jobId);
                this.showJobDetail(jobId);
            });
        });
    }

    // 显示职位详情
    showJobDetail(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        // 创建模态框显示详情
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${job.title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="job-detail-info">
                        <p><strong>公司:</strong> ${job.company}</p>
                        <p><strong>职位类型:</strong> ${job.type}</p>
                        <p><strong>技术方向:</strong> ${job.direction}</p>
                        <p><strong>数据来源:</strong> ${job.source}</p>
                        <p><strong>发布时间:</strong> ${this.formatDate(job.date)}</p>
                        <p><strong>内推码:</strong> <code>${job.code}</code></p>
                    </div>
                    <div class="job-description">
                        <h3>职位描述</h3>
                        <p>${job.description}</p>
                    </div>
                    <div class="job-requirements">
                        <h3>任职要求</h3>
                        <ul>
                            ${job.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="copy-code-btn" data-code="${job.code}">
                        <i class="fas fa-copy"></i>
                        复制内推码
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 模态框事件
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                document.body.removeChild(modal);
            }
        });

        // 复制内推码事件
        modal.querySelector('.copy-code-btn').addEventListener('click', (e) => {
            const code = e.target.dataset.code;
            navigator.clipboard.writeText(code).then(() => {
                this.showToast('内推码已复制到剪贴板');
            });
        });
    }

    // 更新统计数据
    updateStats() {
        const totalJobs = document.getElementById('totalJobs');
        const todayUpdate = document.getElementById('todayUpdate');

        // 使用数据管理器的统计数据
        const stats = this.dataManager.getStatistics();
        
        totalJobs.textContent = stats.total_jobs || this.jobs.length;
        todayUpdate.textContent = stats.today_jobs || 0;

        // 更新页面标题的更新时间（如果有的话）
        const updateTime = this.dataManager.getLastUpdateTime();
        if (updateTime) {
            console.log(`数据最后更新时间: ${updateTime}`);
        }
    }

    // 刷新数据
    async refreshData() {
        const refreshBtn = document.getElementById('refreshData');
        const originalHTML = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 刷新中...';
        refreshBtn.disabled = true;

        try {
            // 使用数据管理器刷新数据
            this.jobs = await this.dataManager.refreshData();
            this.filteredJobs = [...this.jobs];
            this.applyFilters();
            this.updateStats();
            this.showToast('数据已更新');
        } catch (error) {
            this.showError('刷新失败，请稍后重试');
        } finally {
            refreshBtn.innerHTML = originalHTML;
            refreshBtn.disabled = false;
        }
    }

    // 显示/隐藏加载状态
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // 显示提示信息
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // 显示错误信息
    showError(message) {
        this.showToast(message, 'error');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new JobManager();
});

// 添加模态框和提示框的CSS样式
const additionalStyles = `
<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal-content {
    background: white;
    border-radius: var(--border-radius);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
    margin: 0;
    color: var(--text-primary);
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
}

.modal-close:hover {
    background: var(--background-color);
}

.modal-body {
    padding: 1.5rem;
}

.job-detail-info {
    margin-bottom: 1.5rem;
}

.job-detail-info p {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.job-detail-info code {
    background: var(--background-color);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-family: 'Courier New', monospace;
    color: var(--primary-color);
    font-weight: 600;
}

.job-description,
.job-requirements {
    margin-bottom: 1.5rem;
}

.job-description h3,
.job-requirements h3 {
    margin-bottom: 0.75rem;
    color: var(--text-primary);
    font-size: 1.125rem;
}

.job-requirements ul {
    margin-left: 1.5rem;
}

.job-requirements li {
    margin-bottom: 0.5rem;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
}

.copy-code-btn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.copy-code-btn:hover {
    background: var(--primary-hover);
}

.toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: var(--surface-color);
    color: var(--text-primary);
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    z-index: 3000;
    max-width: 300px;
}

.toast.show {
    transform: translateX(0);
}

.toast-success {
    border-left: 4px solid var(--accent-color);
}

.toast-error {
    border-left: 4px solid var(--danger-color);
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        margin: 1rem;
    }
    
    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }
    
    .toast {
        right: 1rem;
        left: 1rem;
        max-width: none;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);
