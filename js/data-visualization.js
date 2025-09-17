/**
 * 数据可视化模块
 * 提供图表和统计分析功能
 */

class DataVisualization {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.charts = {};
        this.init();
    }

    init() {
        this.createVisualizationSection();
        this.loadChartLibrary().then(() => {
            this.renderAllCharts();
        });
    }

    async loadChartLibrary() {
        // 动态加载Chart.js
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            document.head.appendChild(script);
            
            return new Promise((resolve) => {
                script.onload = resolve;
            });
        }
        return Promise.resolve();
    }

    createVisualizationSection() {
        const mainContent = document.querySelector('.main-content');
        
        const visualizationHTML = `
            <section class="data-visualization-section">
                <div class="visualization-container">
                    <div class="section-header">
                        <h2>数据分析</h2>
                        <div class="chart-controls">
                            <button class="chart-toggle active" data-chart="overview">总览</button>
                            <button class="chart-toggle" data-chart="trends">趋势</button>
                            <button class="chart-toggle" data-chart="detailed">详细</button>
                        </div>
                    </div>

                    <!-- 总览图表 -->
                    <div class="chart-panel active" id="overviewPanel">
                        <div class="charts-grid">
                            <div class="chart-card">
                                <h3>职位类型分布</h3>
                                <canvas id="jobTypeChart"></canvas>
                            </div>
                            <div class="chart-card">
                                <h3>技术方向分布</h3>
                                <canvas id="directionChart"></canvas>
                            </div>
                            <div class="chart-card">
                                <h3>数据来源分布</h3>
                                <canvas id="sourceChart"></canvas>
                            </div>
                            <div class="chart-card">
                                <h3>热门公司TOP10</h3>
                                <canvas id="companyChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- 趋势图表 -->
                    <div class="chart-panel" id="trendsPanel">
                        <div class="charts-grid">
                            <div class="chart-card full-width">
                                <h3>职位发布趋势 (最近30天)</h3>
                                <canvas id="trendsChart"></canvas>
                            </div>
                            <div class="chart-card">
                                <h3>技术方向趋势</h3>
                                <canvas id="directionTrendsChart"></canvas>
                            </div>
                            <div class="chart-card">
                                <h3>职位类型趋势</h3>
                                <canvas id="typeTrendsChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- 详细分析 -->
                    <div class="chart-panel" id="detailedPanel">
                        <div class="detailed-stats">
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <h4>总职位数</h4>
                                    <div class="stat-value" id="totalJobsStat">-</div>
                                    <div class="stat-change positive" id="totalJobsChange">+0</div>
                                </div>
                                <div class="stat-card">
                                    <h4>今日新增</h4>
                                    <div class="stat-value" id="todayJobsStat">-</div>
                                    <div class="stat-change" id="todayJobsChange">+0</div>
                                </div>
                                <div class="stat-card">
                                    <h4>活跃公司</h4>
                                    <div class="stat-value" id="activeCompaniesStat">-</div>
                                    <div class="stat-change" id="activeCompaniesChange">+0</div>
                                </div>
                                <div class="stat-card">
                                    <h4>平均薪资</h4>
                                    <div class="stat-value" id="avgSalaryStat">-</div>
                                    <div class="stat-change" id="avgSalaryChange">+0%</div>
                                </div>
                            </div>

                            <div class="detailed-analysis">
                                <div class="analysis-card">
                                    <h4>热门技能需求</h4>
                                    <div class="skills-cloud" id="skillsCloud">
                                        <!-- 技能云图 -->
                                    </div>
                                </div>
                                <div class="analysis-card">
                                    <h4>竞争激烈度分析</h4>
                                    <div class="competition-analysis" id="competitionAnalysis">
                                        <!-- 竞争分析 -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;

        // 在筛选部分后插入
        const filterSection = document.querySelector('.filter-section');
        filterSection.insertAdjacentHTML('afterend', visualizationHTML);

        this.addVisualizationStyles();
        this.bindVisualizationEvents();
    }

    addVisualizationStyles() {
        const styles = `
            <style>
            .data-visualization-section {
                background: var(--background-color);
                padding: 2rem 1rem;
                border-top: 1px solid var(--border-color);
            }

            .visualization-container {
                max-width: 1200px;
                margin: 0 auto;
            }

            .chart-controls {
                display: flex;
                gap: 0.5rem;
            }

            .chart-toggle {
                background: var(--background-color);
                border: 1px solid var(--border-color);
                color: var(--text-secondary);
                padding: 0.5rem 1rem;
                border-radius: var(--border-radius);
                cursor: pointer;
                transition: var(--transition);
                font-size: 0.875rem;
            }

            .chart-toggle.active,
            .chart-toggle:hover {
                background: var(--primary-color);
                color: var(--text-primary);
                border-color: var(--primary-hover);
            }

            .chart-panel {
                display: none;
                margin-top: 2rem;
            }

            .chart-panel.active {
                display: block;
            }

            .charts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
            }

            .chart-card {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                box-shadow: var(--shadow-sm);
                transition: var(--transition);
            }

            .chart-card:hover {
                box-shadow: var(--shadow-md);
                transform: translateY(-2px);
            }

            .chart-card.full-width {
                grid-column: 1 / -1;
            }

            .chart-card h3 {
                margin: 0 0 1rem 0;
                font-size: 1.1rem;
                color: var(--text-primary);
                text-align: center;
            }

            .chart-card canvas {
                max-height: 250px;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .stat-card {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                text-align: center;
                box-shadow: var(--shadow-sm);
                transition: var(--transition);
            }

            .stat-card:hover {
                box-shadow: var(--shadow-md);
                transform: translateY(-2px);
            }

            .stat-card h4 {
                margin: 0 0 0.5rem 0;
                color: var(--text-secondary);
                font-size: 0.875rem;
                font-weight: 500;
            }

            .stat-value {
                font-size: 2rem;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
            }

            .stat-change {
                font-size: 0.8rem;
                font-weight: 500;
            }

            .stat-change.positive {
                color: var(--success-color);
            }

            .stat-change.negative {
                color: var(--danger-color);
            }

            .detailed-analysis {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 1.5rem;
            }

            .analysis-card {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                box-shadow: var(--shadow-sm);
            }

            .analysis-card h4 {
                margin: 0 0 1rem 0;
                color: var(--text-primary);
                font-size: 1.1rem;
            }

            .skills-cloud {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .skill-tag {
                background: var(--primary-light);
                color: var(--text-primary);
                padding: 0.5rem 1rem;
                border-radius: 1rem;
                font-size: 0.875rem;
                border: 1px solid var(--primary-color);
                transition: var(--transition);
            }

            .skill-tag:hover {
                background: var(--primary-color);
                transform: scale(1.05);
            }

            .competition-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid var(--border-color);
            }

            .competition-item:last-child {
                border-bottom: none;
            }

            .competition-level {
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.8rem;
                font-weight: 500;
            }

            .competition-level.high {
                background: var(--danger-color);
                color: white;
            }

            .competition-level.medium {
                background: var(--warning-color);
                color: var(--text-primary);
            }

            .competition-level.low {
                background: var(--success-color);
                color: var(--text-primary);
            }

            @media (max-width: 768px) {
                .chart-controls {
                    flex-wrap: wrap;
                }

                .charts-grid {
                    grid-template-columns: 1fr;
                }

                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .detailed-analysis {
                    grid-template-columns: 1fr;
                }
            }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindVisualizationEvents() {
        // 图表切换
        document.querySelectorAll('.chart-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchChartPanel(btn.dataset.chart);
            });
        });
    }

    switchChartPanel(panelType) {
        // 切换活跃按钮
        document.querySelectorAll('.chart-toggle').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-chart="${panelType}"]`).classList.add('active');

        // 切换面板
        document.querySelectorAll('.chart-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${panelType}Panel`).classList.add('active');

        // 根据面板类型渲染对应图表
        if (panelType === 'detailed') {
            this.renderDetailedStats();
        }
    }

    renderAllCharts() {
        this.renderJobTypeChart();
        this.renderDirectionChart();
        this.renderSourceChart();
        this.renderCompanyChart();
        this.renderTrendsChart();
        this.renderDirectionTrendsChart();
        this.renderTypeTrendsChart();
        this.renderDetailedStats();
    }

    renderJobTypeChart() {
        const ctx = document.getElementById('jobTypeChart').getContext('2d');
        const stats = this.dataManager.getStatistics();
        
        const data = {
            labels: Object.keys(stats.by_type || {}),
            datasets: [{
                data: Object.values(stats.by_type || {}),
                backgroundColor: [
                    'rgba(168, 216, 234, 0.8)',
                    'rgba(154, 197, 212, 0.8)',
                    'rgba(143, 206, 217, 0.8)'
                ],
                borderColor: [
                    'rgb(168, 216, 234)',
                    'rgb(154, 197, 212)',
                    'rgb(143, 206, 217)'
                ],
                borderWidth: 2
            }]
        };

        this.charts.jobType = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderDirectionChart() {
        const ctx = document.getElementById('directionChart').getContext('2d');
        const stats = this.dataManager.getStatistics();
        
        const directions = Object.entries(stats.by_direction || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);

        this.charts.direction = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: directions.map(([name]) => name),
                datasets: [{
                    label: '职位数量',
                    data: directions.map(([,count]) => count),
                    backgroundColor: 'rgba(168, 216, 234, 0.6)',
                    borderColor: 'rgb(168, 216, 234)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderSourceChart() {
        const ctx = document.getElementById('sourceChart').getContext('2d');
        const stats = this.dataManager.getStatistics();
        
        this.charts.source = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(stats.by_source || {}),
                datasets: [{
                    data: Object.values(stats.by_source || {}),
                    backgroundColor: [
                        'rgba(168, 216, 234, 0.8)',
                        'rgba(154, 197, 212, 0.8)',
                        'rgba(143, 206, 217, 0.8)',
                        'rgba(127, 184, 209, 0.8)',
                        'rgba(184, 198, 219, 0.8)',
                        'rgba(255, 211, 165, 0.8)',
                        'rgba(168, 230, 207, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderCompanyChart() {
        const ctx = document.getElementById('companyChart').getContext('2d');
        const stats = this.dataManager.getStatistics();
        
        const companies = Object.entries(stats.by_company || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        this.charts.company = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: companies.map(([name]) => name),
                datasets: [{
                    label: '职位数量',
                    data: companies.map(([,count]) => count),
                    backgroundColor: 'rgba(143, 206, 217, 0.6)',
                    borderColor: 'rgb(143, 206, 217)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderTrendsChart() {
        const ctx = document.getElementById('trendsChart').getContext('2d');
        
        // 生成最近30天的趋势数据
        const trendData = this.generateTrendData(30);
        
        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: '每日新增职位',
                    data: trendData.values,
                    borderColor: 'rgb(168, 216, 234)',
                    backgroundColor: 'rgba(168, 216, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderDirectionTrendsChart() {
        const ctx = document.getElementById('directionTrendsChart').getContext('2d');
        
        // 模拟不同技术方向的趋势数据
        const directions = ['前端', '后端', '算法', '数据'];
        const labels = this.getLast7Days();
        
        this.charts.directionTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: directions.map((direction, index) => ({
                    label: direction,
                    data: this.generateRandomTrendData(7),
                    borderColor: `hsla(${200 + index * 20}, 70%, 60%, 1)`,
                    backgroundColor: `hsla(${200 + index * 20}, 70%, 60%, 0.1)`,
                    tension: 0.4
                }))
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderTypeTrendsChart() {
        const ctx = document.getElementById('typeTrendsChart').getContext('2d');
        
        const types = ['校招', '社招', '实习'];
        const labels = this.getLast7Days();
        
        this.charts.typeTrends = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: types.map((type, index) => ({
                    label: type,
                    data: this.generateRandomTrendData(7),
                    backgroundColor: `hsla(${190 + index * 15}, 60%, 70%, 0.8)`,
                    borderColor: `hsla(${190 + index * 15}, 60%, 50%, 1)`,
                    borderWidth: 1
                }))
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderDetailedStats() {
        const stats = this.dataManager.getStatistics();
        
        // 更新统计卡片
        document.getElementById('totalJobsStat').textContent = stats.total_jobs || 0;
        document.getElementById('todayJobsStat').textContent = stats.today_jobs || 0;
        document.getElementById('activeCompaniesStat').textContent = Object.keys(stats.by_company || {}).length;
        document.getElementById('avgSalaryStat').textContent = '15-30万'; // 模拟数据
        
        // 渲染技能云图
        this.renderSkillsCloud();
        
        // 渲染竞争分析
        this.renderCompetitionAnalysis();
    }

    renderSkillsCloud() {
        const container = document.getElementById('skillsCloud');
        
        // 模拟热门技能数据
        const skills = [
            { name: 'JavaScript', count: 120 },
            { name: 'Python', count: 98 },
            { name: 'Java', count: 89 },
            { name: 'React', count: 76 },
            { name: 'Vue.js', count: 65 },
            { name: 'Spring Boot', count: 54 },
            { name: 'MySQL', count: 78 },
            { name: 'Redis', count: 45 },
            { name: 'Docker', count: 42 },
            { name: 'Git', count: 95 }
        ];
        
        container.innerHTML = skills.map(skill => 
            `<span class="skill-tag" style="font-size: ${0.8 + (skill.count / 120) * 0.5}rem">
                ${skill.name} (${skill.count})
            </span>`
        ).join('');
    }

    renderCompetitionAnalysis() {
        const container = document.getElementById('competitionAnalysis');
        
        // 模拟竞争分析数据
        const competition = [
            { direction: '前端开发', level: 'high', ratio: '1:45' },
            { direction: '算法工程师', level: 'high', ratio: '1:67' },
            { direction: '产品经理', level: 'medium', ratio: '1:23' },
            { direction: '后端开发', level: 'medium', ratio: '1:28' },
            { direction: '测试工程师', level: 'low', ratio: '1:12' },
            { direction: '运维工程师', level: 'low', ratio: '1:8' }
        ];
        
        container.innerHTML = competition.map(item => 
            `<div class="competition-item">
                <span>${item.direction}</span>
                <div>
                    <span class="competition-level ${item.level}">
                        ${item.level === 'high' ? '激烈' : item.level === 'medium' ? '一般' : '较低'}
                    </span>
                    <span style="margin-left: 0.5rem; color: var(--text-secondary);">${item.ratio}</span>
                </div>
            </div>`
        ).join('');
    }

    // 辅助方法
    generateTrendData(days) {
        const labels = [];
        const values = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
            values.push(Math.floor(Math.random() * 20) + 5);
        }
        
        return { labels, values };
    }

    generateRandomTrendData(days) {
        return Array.from({ length: days }, () => Math.floor(Math.random() * 15) + 2);
    }

    getLast7Days() {
        const labels = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
        }
        
        return labels;
    }

    // 更新数据时刷新图表
    refreshCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.update === 'function') {
                chart.update();
            }
        });
    }

    // 清理资源
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// 导出类
window.DataVisualization = DataVisualization;
