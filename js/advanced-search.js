/**
 * 高级搜索和智能筛选模块
 * 提供更强大的搜索和筛选功能
 */

class AdvancedSearch {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.searchHistory = this.loadSearchHistory();
        this.savedFilters = this.loadSavedFilters();
        this.init();
    }

    init() {
        this.createAdvancedSearchUI();
        this.bindEvents();
        this.loadUserPreferences();
    }

    createAdvancedSearchUI() {
        // 创建高级搜索面板
        const searchSection = document.querySelector('.filter-section');
        
        const advancedSearchHTML = `
            <div class="advanced-search-container" id="advancedSearch">
                <div class="advanced-search-header">
                    <h3>高级搜索</h3>
                    <button class="toggle-advanced" id="toggleAdvanced">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="advanced-search-content" style="display: none;">
                    <!-- 薪资范围筛选 -->
                    <div class="filter-group">
                        <label>薪资范围 (万/年)</label>
                        <div class="salary-range">
                            <input type="range" id="salaryMin" min="5" max="100" value="10" step="5">
                            <input type="range" id="salaryMax" min="5" max="100" value="50" step="5">
                            <div class="range-labels">
                                <span id="salaryMinLabel">10万</span>
                                <span id="salaryMaxLabel">50万</span>
                            </div>
                        </div>
                    </div>

                    <!-- 工作地点筛选 -->
                    <div class="filter-group">
                        <label>工作地点</label>
                        <div class="location-filter">
                            <select id="citySelect" multiple>
                                <option value="北京">北京</option>
                                <option value="上海">上海</option>
                                <option value="深圳">深圳</option>
                                <option value="杭州">杭州</option>
                                <option value="广州">广州</option>
                                <option value="成都">成都</option>
                                <option value="南京">南京</option>
                                <option value="武汉">武汉</option>
                            </select>
                        </div>
                    </div>

                    <!-- 学历要求 -->
                    <div class="filter-group">
                        <label>学历要求</label>
                        <div class="education-filter">
                            <label class="checkbox-label">
                                <input type="checkbox" value="不限" checked> 不限
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="大专"> 大专
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="本科"> 本科
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="硕士"> 硕士
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="博士"> 博士
                            </label>
                        </div>
                    </div>

                    <!-- 工作经验 -->
                    <div class="filter-group">
                        <label>工作经验</label>
                        <div class="experience-filter">
                            <label class="checkbox-label">
                                <input type="checkbox" value="不限" checked> 不限
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="应届"> 应届毕业生
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="1-3年"> 1-3年
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="3-5年"> 3-5年
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="5年以上"> 5年以上
                            </label>
                        </div>
                    </div>

                    <!-- 公司规模 -->
                    <div class="filter-group">
                        <label>公司规模</label>
                        <div class="company-size-filter">
                            <label class="checkbox-label">
                                <input type="checkbox" value="初创" checked> 初创公司 (0-50人)
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="中型" checked> 中型公司 (50-500人)
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="大型" checked> 大型公司 (500+人)
                            </label>
                        </div>
                    </div>

                    <!-- 搜索历史 -->
                    <div class="filter-group">
                        <label>搜索历史</label>
                        <div class="search-history" id="searchHistory">
                            <!-- 动态生成搜索历史 -->
                        </div>
                    </div>

                    <!-- 保存的筛选条件 -->
                    <div class="filter-group">
                        <label>保存的筛选</label>
                        <div class="saved-filters">
                            <button class="save-filter-btn" id="saveFilter">
                                <i class="fas fa-save"></i> 保存当前筛选
                            </button>
                            <div class="saved-filters-list" id="savedFiltersList">
                                <!-- 动态生成保存的筛选 -->
                            </div>
                        </div>
                    </div>

                    <!-- 重置和应用按钮 -->
                    <div class="filter-actions">
                        <button class="reset-filters-btn" id="resetFilters">
                            <i class="fas fa-undo"></i> 重置筛选
                        </button>
                        <button class="apply-filters-btn" id="applyFilters">
                            <i class="fas fa-search"></i> 应用筛选
                        </button>
                    </div>
                </div>
            </div>
        `;

        searchSection.insertAdjacentHTML('beforeend', advancedSearchHTML);
        this.addAdvancedSearchStyles();
    }

    addAdvancedSearchStyles() {
        const styles = `
            <style>
            .advanced-search-container {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                margin-top: 2rem;
                overflow: hidden;
                box-shadow: var(--shadow-sm);
            }

            .advanced-search-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.5rem;
                background: var(--primary-light);
                cursor: pointer;
                transition: var(--transition);
            }

            .advanced-search-header:hover {
                background: var(--primary-color);
            }

            .advanced-search-header h3 {
                margin: 0;
                color: var(--text-primary);
                font-size: 1.1rem;
            }

            .toggle-advanced {
                background: none;
                border: none;
                color: var(--text-primary);
                font-size: 1rem;
                cursor: pointer;
                transition: var(--transition);
            }

            .toggle-advanced.expanded {
                transform: rotate(180deg);
            }

            .advanced-search-content {
                padding: 1.5rem;
                display: grid;
                gap: 1.5rem;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            }

            .salary-range {
                position: relative;
                margin: 1rem 0;
            }

            .salary-range input[type="range"] {
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: var(--border-color);
                outline: none;
                -webkit-appearance: none;
                margin: 0.5rem 0;
            }

            .salary-range input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: var(--primary-color);
                cursor: pointer;
                box-shadow: var(--shadow-sm);
            }

            .range-labels {
                display: flex;
                justify-content: space-between;
                font-size: 0.875rem;
                color: var(--text-secondary);
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin: 0.5rem 0;
                cursor: pointer;
                font-size: 0.875rem;
            }

            .checkbox-label input[type="checkbox"] {
                width: 16px;
                height: 16px;
                accent-color: var(--primary-color);
            }

            .search-history {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .history-item {
                background: var(--background-color);
                color: var(--text-secondary);
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.8rem;
                cursor: pointer;
                transition: var(--transition);
                border: 1px solid var(--border-color);
            }

            .history-item:hover {
                background: var(--primary-color);
                color: var(--text-primary);
            }

            .filter-actions {
                grid-column: 1 / -1;
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 1rem;
            }

            .reset-filters-btn,
            .apply-filters-btn,
            .save-filter-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: var(--border-radius);
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .reset-filters-btn {
                background: var(--danger-color);
                color: var(--text-primary);
            }

            .apply-filters-btn {
                background: var(--accent-color);
                color: var(--text-primary);
            }

            .save-filter-btn {
                background: var(--success-color);
                color: var(--text-primary);
            }

            .reset-filters-btn:hover,
            .apply-filters-btn:hover,
            .save-filter-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }

            #citySelect {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                background: var(--surface-color);
            }

            @media (max-width: 768px) {
                .advanced-search-content {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                
                .filter-actions {
                    flex-direction: column;
                }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        // 切换高级搜索面板
        document.getElementById('toggleAdvanced').addEventListener('click', () => {
            this.toggleAdvancedSearch();
        });

        // 薪资范围滑块
        const salaryMin = document.getElementById('salaryMin');
        const salaryMax = document.getElementById('salaryMax');
        
        salaryMin.addEventListener('input', () => this.updateSalaryLabels());
        salaryMax.addEventListener('input', () => this.updateSalaryLabels());

        // 保存筛选条件
        document.getElementById('saveFilter').addEventListener('click', () => {
            this.saveCurrentFilter();
        });

        // 重置筛选条件
        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });

        // 应用筛选条件
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyAdvancedFilters();
        });

        // 搜索输入增强
        this.enhanceSearchInput();
    }

    toggleAdvancedSearch() {
        const content = document.querySelector('.advanced-search-content');
        const toggle = document.getElementById('toggleAdvanced');
        
        if (content.style.display === 'none') {
            content.style.display = 'grid';
            toggle.classList.add('expanded');
        } else {
            content.style.display = 'none';
            toggle.classList.remove('expanded');
        }
    }

    updateSalaryLabels() {
        const minVal = document.getElementById('salaryMin').value;
        const maxVal = document.getElementById('salaryMax').value;
        
        document.getElementById('salaryMinLabel').textContent = `${minVal}万`;
        document.getElementById('salaryMaxLabel').textContent = `${maxVal}万`;
    }

    enhanceSearchInput() {
        const searchInput = document.getElementById('searchInput');
        
        // 添加搜索建议
        this.createSearchSuggestions(searchInput);
        
        // 保存搜索历史
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                this.addToSearchHistory(searchInput.value.trim());
            }
        });
    }

    createSearchSuggestions(input) {
        // 创建搜索建议下拉框
        const suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions';
        suggestions.style.display = 'none';
        input.parentNode.appendChild(suggestions);

        input.addEventListener('input', () => {
            const value = input.value.toLowerCase();
            if (value.length < 2) {
                suggestions.style.display = 'none';
                return;
            }

            const matches = this.getSearchSuggestions(value);
            this.displaySuggestions(suggestions, matches, input);
        });

        // 点击外部隐藏建议
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.style.display = 'none';
            }
        });
    }

    getSearchSuggestions(query) {
        const jobs = this.dataManager.getAllJobs();
        const suggestions = new Set();

        jobs.forEach(job => {
            // 匹配公司名
            if (job.company.toLowerCase().includes(query)) {
                suggestions.add(job.company);
            }
            // 匹配职位名
            if (job.title.toLowerCase().includes(query)) {
                suggestions.add(job.title);
            }
            // 匹配技术方向
            if (job.direction.toLowerCase().includes(query)) {
                suggestions.add(job.direction);
            }
        });

        return Array.from(suggestions).slice(0, 8);
    }

    displaySuggestions(container, suggestions, input) {
        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = suggestions.map(suggestion => 
            `<div class="suggestion-item" data-value="${suggestion}">${suggestion}</div>`
        ).join('');

        container.style.display = 'block';

        // 添加点击事件
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                input.value = item.dataset.value;
                container.style.display = 'none';
                input.dispatchEvent(new Event('input'));
            });
        });
    }

    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // 只保留最近10个
            this.saveSearchHistory();
            this.renderSearchHistory();
        }
    }

    renderSearchHistory() {
        const container = document.getElementById('searchHistory');
        container.innerHTML = this.searchHistory.map(item => 
            `<span class="history-item" data-query="${item}">${item}</span>`
        ).join('');

        // 添加点击事件
        container.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('searchInput').value = item.dataset.query;
                document.getElementById('searchInput').dispatchEvent(new Event('input'));
            });
        });
    }

    saveCurrentFilter() {
        const filterName = prompt('请输入筛选条件名称:');
        if (!filterName) return;

        const currentFilter = this.getCurrentFilterState();
        this.savedFilters[filterName] = currentFilter;
        this.saveSavedFilters();
        this.renderSavedFilters();
    }

    getCurrentFilterState() {
        // 获取当前所有筛选条件的状态
        return {
            type: this.getActiveFilterValues('type'),
            direction: this.getActiveFilterValues('direction'),
            source: this.getActiveFilterValues('source'),
            search: document.getElementById('searchInput').value,
            salaryMin: document.getElementById('salaryMin').value,
            salaryMax: document.getElementById('salaryMax').value,
            cities: this.getSelectedCities(),
            education: this.getCheckedValues('.education-filter input[type="checkbox"]'),
            experience: this.getCheckedValues('.experience-filter input[type="checkbox"]'),
            companySize: this.getCheckedValues('.company-size-filter input[type="checkbox"]')
        };
    }

    getActiveFilterValues(type) {
        const activeBtn = document.querySelector(`[data-${type}].active`);
        return activeBtn ? activeBtn.dataset[type] : 'all';
    }

    getSelectedCities() {
        const select = document.getElementById('citySelect');
        return Array.from(select.selectedOptions).map(option => option.value);
    }

    getCheckedValues(selector) {
        return Array.from(document.querySelectorAll(selector + ':checked')).map(cb => cb.value);
    }

    resetFilters() {
        // 重置所有筛选条件到默认状态
        document.getElementById('searchInput').value = '';
        document.getElementById('salaryMin').value = '10';
        document.getElementById('salaryMax').value = '50';
        this.updateSalaryLabels();
        
        // 重置所有复选框
        document.querySelectorAll('.advanced-search-content input[type="checkbox"]').forEach(cb => {
            cb.checked = cb.value === '不限';
        });

        // 重置城市选择
        document.getElementById('citySelect').selectedIndex = -1;

        // 重置基础筛选按钮
        document.querySelectorAll('.filter-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.filter-btn[data-type="all"], .filter-btn[data-direction="all"], .filter-btn[data-source="all"]').forEach(btn => {
            btn.classList.add('active');
        });
    }

    applyAdvancedFilters() {
        // 这里会触发主搜索系统的筛选逻辑
        const event = new CustomEvent('advancedFilterApplied', {
            detail: this.getCurrentFilterState()
        });
        document.dispatchEvent(event);
    }

    // 本地存储相关方法
    loadSearchHistory() {
        const stored = localStorage.getItem('job_search_history');
        return stored ? JSON.parse(stored) : [];
    }

    saveSearchHistory() {
        localStorage.setItem('job_search_history', JSON.stringify(this.searchHistory));
    }

    loadSavedFilters() {
        const stored = localStorage.getItem('job_saved_filters');
        return stored ? JSON.parse(stored) : {};
    }

    saveSavedFilters() {
        localStorage.setItem('job_saved_filters', JSON.stringify(this.savedFilters));
    }

    loadUserPreferences() {
        // 加载用户偏好设置
        this.renderSearchHistory();
        this.renderSavedFilters();
    }

    renderSavedFilters() {
        const container = document.getElementById('savedFiltersList');
        const filterEntries = Object.entries(this.savedFilters);
        
        if (filterEntries.length === 0) {
            container.innerHTML = '<p class="no-saved-filters">暂无保存的筛选条件</p>';
            return;
        }

        container.innerHTML = filterEntries.map(([name, filter]) => 
            `<div class="saved-filter-item">
                <span class="filter-name">${name}</span>
                <div class="filter-actions">
                    <button class="load-filter" data-name="${name}">应用</button>
                    <button class="delete-filter" data-name="${name}">删除</button>
                </div>
            </div>`
        ).join('');

        // 绑定事件
        container.querySelectorAll('.load-filter').forEach(btn => {
            btn.addEventListener('click', () => this.loadSavedFilter(btn.dataset.name));
        });

        container.querySelectorAll('.delete-filter').forEach(btn => {
            btn.addEventListener('click', () => this.deleteSavedFilter(btn.dataset.name));
        });
    }

    loadSavedFilter(name) {
        const filter = this.savedFilters[name];
        if (!filter) return;

        // 应用保存的筛选条件
        // 这里需要根据具体的UI结构来设置各个筛选控件的值
        console.log('Loading saved filter:', name, filter);
        this.applyAdvancedFilters();
    }

    deleteSavedFilter(name) {
        if (confirm(`确认删除筛选条件"${name}"吗？`)) {
            delete this.savedFilters[name];
            this.saveSavedFilters();
            this.renderSavedFilters();
        }
    }
}

// 导出类
window.AdvancedSearch = AdvancedSearch;
