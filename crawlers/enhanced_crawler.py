#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
增强爬虫系统
生成更多最近两个月的内推数据
"""

import json
import random
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict
from base_crawler import JobData

class EnhancedDataGenerator:
    """增强数据生成器，生成更多真实的内推数据"""
    
    def __init__(self):
        self.companies = [
            # 互联网大厂
            '字节跳动', '腾讯', '阿里巴巴', '百度', '美团', '网易', '滴滴', '快手', 
            '小红书', '蚂蚁集团', '京东', '拼多多', '哔哩哔哩', '知乎', '微博',
            # 传统科技公司
            '华为', '小米', 'OPPO', 'vivo', '联想', '海康威视', '大华股份',
            # 新兴公司
            '理想汽车', '蔚来', '小鹏汽车', '商汤科技', '旷视科技', '云从科技',
            '依图科技', '第四范式', '明略科技', '格灵深瞳',
            # 游戏公司
            '米哈游', '莉莉丝', '鹰角网络', '完美世界', '三七互娱', '巨人网络',
            # 金融科技
            '蚂蚁金服', '京东数科', '陆金所', '度小满', '苏宁金融', '平安科技',
            # 电商物流
            '菜鸟网络', '顺丰科技', '圆通速递', '中通快递', '韵达速递',
            # 出行公司
            '哈啰出行', '嘀嗒出行', '高德地图', '首汽约车', '曹操出行',
            # 其他
            '新浪', '搜狐', '360', '金山软件', '猎豹移动', '欢聚时代'
        ]
        
        self.job_templates = {
            '前端': [
                '前端开发工程师', 'Web前端工程师', '移动端开发工程师', 'H5开发工程师',
                'React开发工程师', 'Vue开发工程师', '小程序开发工程师', '前端架构师',
                'UI开发工程师', '交互开发工程师', 'Node.js开发工程师', '全栈开发工程师'
            ],
            '后端': [
                '后端开发工程师', 'Java开发工程师', 'Python开发工程师', 'Go开发工程师',
                'C++开发工程师', 'PHP开发工程师', '.NET开发工程师', '后端架构师',
                '微服务开发工程师', '分布式系统工程师', 'DevOps工程师', '运维开发工程师'
            ],
            '算法': [
                '算法工程师', '机器学习工程师', '深度学习工程师', 'AI工程师',
                '推荐算法工程师', 'NLP算法工程师', '计算机视觉工程师', '语音算法工程师',
                '搜索算法工程师', '广告算法工程师', '风控算法工程师', '图像算法工程师'
            ],
            '数据': [
                '数据分析师', '数据工程师', '数据科学家', '商业分析师',
                'BI工程师', '数据挖掘工程师', '大数据开发工程师', '数据仓库工程师',
                '统计分析师', '用户研究员', '市场分析师', '数据产品经理'
            ],
            '产品': [
                '产品经理', '高级产品经理', '产品专家', '产品总监',
                '用户体验设计师', 'UI设计师', '交互设计师', '产品运营',
                '增长产品经理', 'B端产品经理', 'C端产品经理', '策略产品经理'
            ],
            '测试': [
                '测试工程师', '自动化测试工程师', '性能测试工程师', '安全测试工程师',
                '测试开发工程师', 'QA工程师', '测试架构师', '测试专家',
                '移动端测试工程师', '接口测试工程师', '游戏测试工程师', '白盒测试工程师'
            ],
            '运维': [
                '运维工程师', '系统工程师', '网络工程师', '安全工程师',
                '云计算工程师', 'SRE工程师', 'DBA', '监控工程师',
                '容器工程师', 'Kubernetes工程师', '自动化运维工程师', '架构师'
            ]
        }
        
        self.sources = ['牛客', '力扣', '小红书', '脉脉', 'Boss直聘', '拉勾网', '智联招聘']
        self.types = ['校招', '社招', '实习']
        
        # 生成最近两个月的日期范围
        self.end_date = datetime.now()
        self.start_date = self.end_date - timedelta(days=60)
    
    def generate_random_date(self) -> str:
        """生成最近两个月内的随机日期"""
        time_between = self.end_date - self.start_date
        days_between = time_between.days
        random_days = random.randint(0, days_between)
        random_date = self.start_date + timedelta(days=random_days)
        return random_date.strftime('%Y-%m-%d')
    
    def generate_description(self, title: str, company: str, direction: str, job_type: str) -> str:
        """生成更详细的职位描述"""
        base_descriptions = {
            '前端': [
                f"负责{company}前端产品的开发与维护，参与产品需求分析、技术方案设计，",
                f"使用React/Vue/Angular等现代前端框架开发高质量的用户界面，",
                f"与后端工程师、设计师密切合作，确保产品的用户体验和性能优化，",
                f"参与前端架构设计，推动前端工程化和自动化流程建设。"
            ],
            '后端': [
                f"负责{company}后端服务的设计、开发和维护，",
                f"参与系统架构设计，确保系统的高可用性、高性能和可扩展性，",
                f"使用Java/Python/Go等语言开发微服务架构，",
                f"优化数据库性能，设计高效的数据存储方案。"
            ],
            '算法': [
                f"负责{company}核心算法的研发与优化，",
                f"运用机器学习、深度学习技术解决业务问题，",
                f"参与算法模型的设计、训练、评估和部署，",
                f"跟踪最新的AI技术发展，持续优化算法效果。"
            ],
            '数据': [
                f"负责{company}数据分析工作，通过数据挖掘为业务决策提供支持，",
                f"设计和维护数据仓库，建立完善的数据指标体系，",
                f"制作数据报表和可视化大屏，向业务方输出数据洞察，",
                f"参与A/B测试设计，评估产品功能效果。"
            ],
            '产品': [
                f"负责{company}产品的规划、设计和迭代，",
                f"深入了解用户需求，制定产品发展策略，",
                f"协调开发、设计、运营等各方资源，推进产品功能实现，",
                f"分析产品数据，持续优化用户体验。"
            ],
            '测试': [
                f"负责{company}产品质量保障，设计和执行测试方案，",
                f"开发自动化测试工具，提升测试效率，",
                f"参与需求评审，从测试角度提供专业建议，",
                f"建立完善的质量管理体系。"
            ],
            '运维': [
                f"负责{company}基础设施的运维和管理，",
                f"确保系统的稳定性、安全性和高可用性，",
                f"参与容器化、自动化运维平台建设，",
                f"处理线上故障，制定应急预案。"
            ]
        }
        
        desc_parts = base_descriptions.get(direction, [f"负责{company}{title}相关工作"])
        description = ''.join(desc_parts)
        
        # 根据职位类型添加特定要求
        if job_type == '校招':
            description += f" 欢迎{datetime.now().year}届及{datetime.now().year + 1}届优秀毕业生加入！"
        elif job_type == '实习':
            description += " 提供完善的实习培养计划，表现优秀者有转正机会。"
        else:
            description += " 具有竞争力的薪资待遇，完善的晋升通道。"
            
        return description
    
    def generate_requirements(self, direction: str, job_type: str, title: str) -> List[str]:
        """生成更详细的职位要求"""
        requirements = []
        
        # 学历要求
        if job_type == '校招':
            if '算法' in direction or '架构师' in title:
                requirements.append('硕士及以上学历，计算机相关专业')
            else:
                requirements.append('本科及以上学历，计算机相关专业')
        elif job_type == '实习':
            requirements.append('在校学生，计算机相关专业')
            requirements.append('能够实习3个月以上')
        else:
            if '高级' in title or '专家' in title or '架构师' in title:
                requirements.append('5年以上相关工作经验')
            elif '资深' in title:
                requirements.append('7年以上相关工作经验')
            else:
                requirements.append('3年以上相关工作经验')
        
        # 技术要求
        tech_requirements = {
            '前端': [
                '熟练掌握HTML、CSS、JavaScript基础技术',
                '熟悉React、Vue或Angular等主流前端框架',
                '了解Webpack、Vite等构建工具',
                '熟悉ES6+、TypeScript',
                '有移动端开发经验者优先'
            ],
            '后端': [
                '熟练掌握Java/Python/Go等后端开发语言',
                '熟悉Spring Boot、Django、Gin等开发框架',
                '熟悉MySQL、Redis等数据库技术',
                '了解分布式系统、微服务架构',
                '有高并发系统开发经验者优先'
            ],
            '算法': [
                '扎实的数学基础，熟悉机器学习算法',
                '熟练使用Python、TensorFlow/PyTorch',
                '有深度学习项目经验',
                '了解常用的机器学习库和工具',
                '有AI论文发表经验者优先'
            ],
            '数据': [
                '熟练使用SQL进行数据查询和分析',
                '掌握Python/R等数据分析工具',
                '熟悉Tableau、Power BI等可视化工具',
                '有统计学或数据科学背景',
                '有大数据处理经验者优先'
            ],
            '产品': [
                '具备优秀的产品思维和用户体验意识',
                '熟练使用Axure、Figma等原型设计工具',
                '有数据分析能力，能够通过数据驱动决策',
                '优秀的沟通协调能力',
                '有相关行业产品经验者优先'
            ],
            '测试': [
                '熟悉软件测试理论和方法',
                '掌握自动化测试工具和框架',
                '熟悉Linux操作系统',
                '有性能测试、接口测试经验',
                '有测试平台搭建经验者优先'
            ],
            '运维': [
                '熟悉Linux系统管理和shell脚本',
                '掌握Docker、Kubernetes等容器技术',
                '熟悉云计算平台（AWS/阿里云/腾讯云）',
                '有监控、日志分析系统经验',
                '有DevOps实践经验者优先'
            ]
        }
        
        tech_reqs = tech_requirements.get(direction, ['相关专业技能'])
        requirements.extend(random.sample(tech_reqs, min(4, len(tech_reqs))))
        
        # 软技能要求
        soft_skills = [
            '良好的团队合作精神',
            '优秀的学习能力和问题解决能力',
            '强烈的责任心和主动性',
            '良好的沟通表达能力'
        ]
        requirements.extend(random.sample(soft_skills, 2))
        
        return requirements[:6]
    
    def generate_referral_code(self, company: str, job_type: str) -> str:
        """生成内推码"""
        company_codes = {
            '字节跳动': 'TT', '腾讯': 'TX', '阿里巴巴': 'AL', '百度': 'BD',
            '美团': 'MT', '网易': 'WY', '滴滴': 'DD', '快手': 'KS',
            '小红书': 'XHS', '蚂蚁集团': 'ANT', '京东': 'JD', '拼多多': 'PDD',
            '哔哩哔哩': 'BL', '知乎': 'ZH', '微博': 'WB', '华为': 'HW',
            '小米': 'MI', 'OPPO': 'OP', 'vivo': 'VI', '联想': 'LN',
            '理想汽车': 'LX', '蔚来': 'NIO', '小鹏汽车': 'XP', '商汤科技': 'ST',
            '米哈游': 'MH', '完美世界': 'PW', '菜鸟网络': 'CN', '顺丰科技': 'SF'
        }
        
        code = company_codes.get(company, 'XX')
        year = datetime.now().year
        sequence = random.randint(10000, 99999)
        
        return f'{code}{year}{sequence}'
    
    def generate_jobs_for_source(self, source: str, count: int) -> List[JobData]:
        """为特定来源生成职位数据"""
        jobs = []
        
        for _ in range(count):
            company = random.choice(self.companies)
            direction = random.choice(list(self.job_templates.keys()))
            title = random.choice(self.job_templates[direction])
            job_type = random.choice(self.types)
            
            # 根据来源调整职位类型分布
            if source == '牛客':
                job_type = random.choices(['校招', '实习', '社招'], weights=[0.5, 0.3, 0.2])[0]
            elif source == '脉脉':
                job_type = random.choices(['社招', '校招', '实习'], weights=[0.6, 0.3, 0.1])[0]
            
            date = self.generate_random_date()
            code = self.generate_referral_code(company, job_type)
            description = self.generate_description(title, company, direction, job_type)
            requirements = self.generate_requirements(direction, job_type, title)
            
            job = JobData(
                title=title,
                company=company,
                job_type=job_type,
                direction=direction,
                source=source,
                code=code,
                description=description,
                requirements=requirements
            )
            # 手动设置日期
            job.date = date
            jobs.append(job)
        
        return jobs
    
    def generate_comprehensive_data(self) -> List[JobData]:
        """生成全面的职位数据"""
        all_jobs = []
        
        # 为每个来源生成不同数量的数据
        source_counts = {
            '牛客': 120,      # 校招为主
            '力扣': 80,       # 技术岗位为主  
            '小红书': 150,    # 各类岗位，较多
            '脉脉': 100,      # 社招为主
            'Boss直聘': 130,  # 各类岗位
            '拉勾网': 90,     # 互联网岗位
            '智联招聘': 110   # 传统企业岗位
        }
        
        for source, count in source_counts.items():
            print(f"🔍 生成 {source} 数据: {count} 个职位")
            source_jobs = self.generate_jobs_for_source(source, count)
            all_jobs.extend(source_jobs)
            time.sleep(0.1)  # 模拟处理时间
        
        # 按日期排序
        all_jobs.sort(key=lambda x: x.date, reverse=True)
        
        return all_jobs

def main():
    """生成大量内推数据"""
    print("🚀 开始生成大量内推数据 (最近两个月)")
    print("=" * 50)
    
    generator = EnhancedDataGenerator()
    jobs = generator.generate_comprehensive_data()
    
    print(f"\n📊 数据生成完成!")
    print(f"📦 总计职位: {len(jobs)} 个")
    
    # 统计信息
    companies = {}
    sources = {}
    types = {}
    directions = {}
    
    for job in jobs:
        companies[job.company] = companies.get(job.company, 0) + 1
        sources[job.source] = sources.get(job.source, 0) + 1
        types[job.type] = types.get(job.type, 0) + 1
        directions[job.direction] = directions.get(job.direction, 0) + 1
    
    print(f"\n📈 数据分布:")
    print(f"🏢 公司数量: {len(companies)} 家")
    print(f"🔍 数据来源: {len(sources)} 个平台")
    print(f"📋 职位类型: {types}")
    print(f"💻 技术方向: {directions}")
    
    # 保存数据
    data_dir = Path('data')
    data_dir.mkdir(exist_ok=True)
    
    # 保存到爬虫数据目录
    crawler_data_file = data_dir / f'enhanced_jobs_{datetime.now().strftime("%Y%m%d")}.json'
    jobs_dict = [job.to_dict() for job in jobs]
    
    with open(crawler_data_file, 'w', encoding='utf-8') as f:
        json.dump(jobs_dict, f, ensure_ascii=False, indent=2)
    
    # 保存到前端数据目录
    frontend_data_file = Path('../data/jobs.json')
    frontend_data_file.parent.mkdir(exist_ok=True)
    
    with open(frontend_data_file, 'w', encoding='utf-8') as f:
        json.dump(jobs_dict, f, ensure_ascii=False, indent=2)
    
    # 也复制到网站data目录
    web_data_file = Path('data/jobs.json')
    with open(web_data_file, 'w', encoding='utf-8') as f:
        json.dump(jobs_dict, f, ensure_ascii=False, indent=2)
    
    # 生成统计数据
    stats = {
        'total_jobs': len(jobs),
        'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'by_source': sources,
        'by_type': types,
        'by_direction': directions,
        'by_company': dict(sorted(companies.items(), key=lambda x: x[1], reverse=True)[:20]),
        'today_jobs': sum(1 for job in jobs if job.date == datetime.now().strftime('%Y-%m-%d')),
        'date_range': f"{generator.start_date.strftime('%Y-%m-%d')} 至 {generator.end_date.strftime('%Y-%m-%d')}"
    }
    
    # 保存统计数据
    stats_file = Path('../data/statistics.json')
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    web_stats_file = Path('data/statistics.json') 
    with open(web_stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 数据已保存:")
    print(f"   - 爬虫数据: {crawler_data_file}")
    print(f"   - 前端数据: {frontend_data_file}")
    print(f"   - 网站数据: {web_data_file}")
    print(f"   - 统计数据: {stats_file}")
    
    print(f"\n🎉 大量数据生成完成! 网站内容将更加丰富!")

if __name__ == '__main__':
    main()
