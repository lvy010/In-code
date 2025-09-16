// 数据管理器
class DataManager {
    constructor() {
        this.jobs = [];
        this.statistics = {};
        this.dataUrl = 'data/jobs.json';
        this.statsUrl = 'data/statistics.json';
        this.lastUpdateTime = null;
    }

    // 加载数据
    async loadData() {
        try {
            // 并行加载职位数据和统计数据
            const [jobsResponse, statsResponse] = await Promise.all([
                fetch(this.dataUrl).catch(() => null),
                fetch(this.statsUrl).catch(() => null)
            ]);

            // 加载职位数据
            if (jobsResponse && jobsResponse.ok) {
                this.jobs = await jobsResponse.json();
                console.log(`已加载 ${this.jobs.length} 个职位数据`);
            } else {
                console.warn('无法加载职位数据，使用示例数据');
                this.jobs = this.generateSampleData();
            }

            // 加载统计数据
            if (statsResponse && statsResponse.ok) {
                this.statistics = await statsResponse.json();
                this.lastUpdateTime = this.statistics.update_time;
                console.log('统计数据加载成功');
            } else {
                console.warn('无法加载统计数据，生成默认统计');
                this.generateStatistics();
            }

            return this.jobs;
        } catch (error) {
            console.error('数据加载失败:', error);
            this.jobs = this.generateSampleData();
            this.generateStatistics();
            return this.jobs;
        }
    }

    // 生成示例数据（当无法加载真实数据时使用）
    generateSampleData() {
        const companies = ['字节跳动', '腾讯', '阿里巴巴', '百度', '美团', '网易', '滴滴', '快手', '小红书', '蚂蚁集团'];
        const types = ['校招', '社招', '实习'];
        const directions = ['前端', '后端', '算法', '数据', '产品', '测试'];
        const sources = ['牛客', '力扣', '小红书', '脉脉'];
        
        const positions = {
            '前端': ['前端开发工程师', '移动端开发工程师', 'H5开发工程师'],
            '后端': ['后端开发工程师', 'Java开发工程师', 'Python开发工程师', 'Go开发工程师'],
            '算法': ['算法工程师', '推荐算法工程师', 'NLP算法工程师', '计算机视觉工程师'],
            '数据': ['数据分析师', '数据工程师', '商业分析师'],
            '产品': ['产品经理', '产品运营', '用户体验设计师'],
            '测试': ['测试工程师', '自动化测试工程师', '性能测试工程师']
        };

        const sampleJobs = [];
        const today = new Date();

        for (let i = 0; i < 50; i++) {
            const company = companies[Math.floor(Math.random() * companies.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const source = sources[Math.floor(Math.random() * sources.length)];
            const positionList = positions[direction];
            const title = positionList[Math.floor(Math.random() * positionList.length)];
            
            // 生成日期（最近30天内）
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            
            sampleJobs.push({
                id: i + 1,
                title: title,
                company: company,
                type: type,
                direction: direction,
                source: source,
                code: this.generateReferralCode(company, type),
                date: date.toISOString().split('T')[0],
                description: this.generateDescription(title, company, direction),
                requirements: this.generateRequirements(direction, type)
            });
        }

        return sampleJobs.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // 生成内推码
    generateReferralCode(company, type) {
        const companyCode = {
            '字节跳动': 'TT',
            '腾讯': 'TX',
            '阿里巴巴': 'AL',
            '百度': 'BD',
            '美团': 'MT',
            '网易': 'WY',
            '滴滴': 'DD',
            '快手': 'KS',
            '小红书': 'XHS',
            '蚂蚁集团': 'ANT'
        }[company] || 'XX';

        const year = new Date().getFullYear();
        const sequence = Math.floor(Math.random() * 9000) + 1000;
        
        return `${companyCode}${year}${sequence}`;
    }

    // 生成职位描述
    generateDescription(title, company, direction) {
        const descriptions = {
            '前端': `负责${company}前端产品的开发和维护，使用现代化的前端技术栈，与设计师和后端工程师紧密合作，提升用户体验。`,
            '后端': `负责${company}后端服务的设计和开发，构建高性能、高可用的分布式系统，支撑业务快速发展。`,
            '算法': `负责${company}算法相关工作，包括机器学习模型的设计与优化，为产品提供智能化解决方案。`,
            '数据': `负责${company}数据分析工作，通过数据挖掘和分析为业务决策提供支持，优化产品和运营策略。`,
            '产品': `负责${company}产品设计和规划，深入理解用户需求，制定产品策略，推动产品功能迭代。`,
            '测试': `负责${company}产品质量保障，设计测试方案，执行功能测试和自动化测试，确保产品质量。`
        };

        return descriptions[direction] || `负责${title}相关工作，为${company}的业务发展贡献力量。`;
    }

    // 生成职位要求
    generateRequirements(direction, type) {
        const baseRequirements = {
            '前端': ['熟悉HTML/CSS/JavaScript', '掌握React/Vue等前端框架', '有良好的编程习惯'],
            '后端': ['熟悉Java/Python/Go等后端语言', '了解常用框架和中间件', '有数据库操作经验'],
            '算法': ['有机器学习基础', '熟悉Python/C++编程', '有算法项目经验'],
            '数据': ['熟悉SQL和数据库', '掌握Python/R等分析工具', '有统计学基础'],
            '产品': ['有产品思维和用户意识', '具备数据分析能力', '沟通协调能力强'],
            '测试': ['熟悉测试理论和方法', '有自动化测试经验', '细心负责，质量意识强']
        };

        const requirements = [...(baseRequirements[direction] || ['相关专业背景', '学习能力强', '工作责任心强'])];

        // 根据类型添加额外要求
        if (type === '校招') {
            requirements.unshift('本科及以上学历');
            requirements.push('应届毕业生优先');
        } else if (type === '社招') {
            requirements.unshift('3年以上相关工作经验');
        } else if (type === '实习') {
            requirements.unshift('在校学生');
            requirements.push('可实习3个月以上');
        }

        return requirements.slice(0, 5);
    }

    // 生成统计数据
    generateStatistics() {
        const stats = {
            total_jobs: this.jobs.length,
            update_time: new Date().toLocaleString('zh-CN'),
            by_source: {},
            by_type: {},
            by_direction: {},
            by_company: {},
            today_jobs: 0
        };

        const today = new Date().toISOString().split('T')[0];

        this.jobs.forEach(job => {
            // 按来源统计
            stats.by_source[job.source] = (stats.by_source[job.source] || 0) + 1;
            
            // 按类型统计
            stats.by_type[job.type] = (stats.by_type[job.type] || 0) + 1;
            
            // 按方向统计
            stats.by_direction[job.direction] = (stats.by_direction[job.direction] || 0) + 1;
            
            // 按公司统计
            stats.by_company[job.company] = (stats.by_company[job.company] || 0) + 1;
            
            // 今日职位统计
            if (job.date === today) {
                stats.today_jobs++;
            }
        });

        this.statistics = stats;
        this.lastUpdateTime = stats.update_time;
    }

    // 获取所有职位
    getAllJobs() {
        return this.jobs;
    }

    // 根据ID获取职位
    getJobById(id) {
        return this.jobs.find(job => job.id === parseInt(id));
    }

    // 筛选职位
    filterJobs(filters) {
        return this.jobs.filter(job => {
            const typeMatch = !filters.type || filters.type === 'all' || job.type === filters.type;
            const directionMatch = !filters.direction || filters.direction === 'all' || job.direction === filters.direction;
            const sourceMatch = !filters.source || filters.source === 'all' || job.source === filters.source;
            const searchMatch = !filters.search || 
                               job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                               job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
                               job.code.toLowerCase().includes(filters.search.toLowerCase());

            return typeMatch && directionMatch && sourceMatch && searchMatch;
        });
    }

    // 排序职位
    sortJobs(jobs, sortBy) {
        const sortedJobs = [...jobs];
        
        switch (sortBy) {
            case 'date':
                return sortedJobs.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'company':
                return sortedJobs.sort((a, b) => a.company.localeCompare(b.company));
            case 'position':
                return sortedJobs.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return sortedJobs;
        }
    }

    // 获取统计数据
    getStatistics() {
        return this.statistics;
    }

    // 获取最后更新时间
    getLastUpdateTime() {
        return this.lastUpdateTime;
    }

    // 刷新数据
    async refreshData() {
        console.log('刷新数据中...');
        await this.loadData();
        return this.jobs;
    }

    // 获取热门公司
    getPopularCompanies(limit = 10) {
        const companyCounts = this.statistics.by_company || {};
        return Object.entries(companyCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([company, count]) => ({ company, count }));
    }

    // 获取最新职位
    getLatestJobs(limit = 10) {
        return this.jobs
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // 根据公司获取职位
    getJobsByCompany(company) {
        return this.jobs.filter(job => job.company === company);
    }

    // 根据技术方向获取职位
    getJobsByDirection(direction) {
        return this.jobs.filter(job => job.direction === direction);
    }

    // 获取今日新增职位
    getTodayJobs() {
        const today = new Date().toISOString().split('T')[0];
        return this.jobs.filter(job => job.date === today);
    }
}

// 导出数据管理器实例
window.DataManager = DataManager;
