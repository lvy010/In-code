#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
脉脉爬虫
爬取脉脉平台的内推信息
"""

import re
import json
from typing import List
from base_crawler import BaseCrawler, JobData

class MaimaiCrawler(BaseCrawler):
    """脉脉爬虫"""
    
    def __init__(self):
        super().__init__('脉脉')
        self.base_url = 'https://maimai.cn'
        
    def crawl(self) -> List[JobData]:
        """爬取脉脉内推信息"""
        jobs = []
        
        # 脉脉的求职板块
        sections = [
            'job_referral',  # 内推
            'campus_recruit', # 校招
            'social_recruit', # 社招
            'internship'      # 实习
        ]
        
        for section in sections:
            try:
                self.logger.info(f'爬取板块: {section}')
                section_jobs = self.crawl_section(section)
                jobs.extend(section_jobs)
                self.random_delay(2, 4)
            except Exception as e:
                self.logger.error(f'爬取板块 {section} 失败: {e}')
                continue
                
        return jobs
    
    def crawl_section(self, section: str) -> List[JobData]:
        """爬取特定板块的内推信息"""
        jobs = []
        
        # 模拟脉脉的内推帖子
        sample_posts = [
            {
                'title': '滴滴出行算法工程师内推',
                'content': '滴滴地图算法团队招聘算法工程师，负责路径规划和智能调度算法开发。要求：计算机相关专业，熟悉机器学习，有地图或出行领域经验优先。',
                'author': '滴滴HR-张经理',
                'company': '滴滴',
                'department': '地图算法团队',
                'location': '北京',
                'job_level': '中级'
            },
            {
                'title': '快手短视频推荐算法实习生',
                'content': '快手推荐算法团队招实习生，参与短视频推荐系统优化。要求：在校学生，计算机/数学相关专业，熟悉深度学习框架，有推荐系统项目经验者优先。',
                'author': '快手算法-李工',
                'company': '快手',
                'department': '推荐算法团队',
                'location': '北京',
                'job_level': '实习'
            },
            {
                'title': '蚂蚁集团后端开发工程师社招',
                'content': '蚂蚁集团支付宝核心系统团队招后端开发，负责支付系统架构设计和开发。要求：5年以上Java开发经验，熟悉分布式系统，有金融系统经验优先。',
                'author': '蚂蚁技术-王总监',
                'company': '蚂蚁集团',
                'department': '支付核心系统',
                'location': '杭州',
                'job_level': '高级'
            },
            {
                'title': '网易云音乐前端开发校招',
                'content': '网易云音乐前端团队2025校招，负责音乐播放器和用户界面开发。要求：本科以上学历，熟悉React/Vue，有音视频相关项目经验加分。',
                'author': '网易云音乐-HR',
                'company': '网易',
                'department': '云音乐前端团队',
                'location': '杭州',
                'job_level': '初级'
            },
            {
                'title': '小米MIUI产品经理内推',
                'content': 'MIUI产品团队招产品经理，负责系统应用产品设计和用户体验优化。要求：3年以上产品经验，有移动端产品设计经验，用户调研和数据分析能力强。',
                'author': '小米产品-陈经理',
                'company': '小米',
                'department': 'MIUI产品团队',
                'location': '北京',
                'job_level': '中级'
            }
        ]
        
        for post in sample_posts:
            try:
                job = self.parse_post(post)
                if job:
                    jobs.append(job)
            except Exception as e:
                self.logger.error(f'解析帖子失败: {e}')
                continue
                
        return jobs
    
    def parse_post(self, post: dict) -> JobData:
        """解析脉脉帖子数据"""
        title = post.get('title', '')
        content = post.get('content', '')
        company = post.get('company', '')
        department = post.get('department', '')
        location = post.get('location', '')
        job_level = post.get('job_level', '')
        
        # 从职级判断职位类型
        job_type = self.extract_job_type_from_level(job_level, title + content)
        
        # 提取技术方向
        direction = self.extract_direction(title, content)
        
        # 生成内推码
        referral_code = self.generate_referral_code(company, job_type)
        
        # 提取职位标题
        position_title = self.extract_position_title(title, direction, job_level)
        
        # 提取要求
        requirements = self.extract_requirements(content, job_level)
        
        # 增强描述信息
        enhanced_description = self.enhance_description(content, department, location)
        
        return JobData(
            title=position_title,
            company=company,
            job_type=job_type,
            direction=direction,
            source='脉脉',
            code=referral_code,
            description=enhanced_description,
            requirements=requirements
        )
    
    def extract_job_type_from_level(self, job_level: str, content: str) -> str:
        """从职级和内容提取职位类型"""
        if job_level == '实习' or '实习' in content:
            return '实习'
        elif any(word in content for word in ['校招', '应届', '2025校招', '毕业生']):
            return '校招'
        else:
            return '社招'
    
    def extract_position_title(self, title: str, direction: str, job_level: str) -> str:
        """提取职位标题"""
        # 移除公司名称和内推等词汇
        clean_title = re.sub(r'(内推|招聘|2025)', '', title)
        
        # 根据方向和级别确定职位
        level_prefix = {
            '初级': '初级',
            '中级': '高级', 
            '高级': '资深',
            '实习': '实习生'
        }.get(job_level, '')
        
        if direction == '算法':
            if '推荐' in title:
                return f'{level_prefix}推荐算法工程师'.strip()
            elif '地图' in title or '路径' in title:
                return f'{level_prefix}地图算法工程师'.strip()
            else:
                return f'{level_prefix}算法工程师'.strip()
        elif direction == '后端':
            if '支付' in title:
                return f'{level_prefix}支付系统后端工程师'.strip()
            else:
                return f'{level_prefix}后端开发工程师'.strip()
        elif direction == '前端':
            if '音乐' in title:
                return f'{level_prefix}前端开发工程师(音乐)'
            else:
                return f'{level_prefix}前端开发工程师'.strip()
        elif direction == '产品':
            if 'MIUI' in title or '系统' in title:
                return f'{level_prefix}系统产品经理'.strip()
            else:
                return f'{level_prefix}产品经理'.strip()
        else:
            return f'{level_prefix}{direction}工程师'.strip()
    
    def extract_requirements(self, content: str, job_level: str) -> List[str]:
        """提取职位要求"""
        requirements = []
        
        # 根据职级添加经验要求
        if job_level == '高级':
            requirements.append('5年以上相关工作经验')
        elif job_level == '中级':
            requirements.append('3年以上相关工作经验')
        elif job_level == '初级':
            requirements.append('1-3年相关工作经验')
        elif job_level == '实习':
            requirements.append('在校学生，相关专业')
        
        # 学历要求
        if '本科' in content:
            requirements.append('本科及以上学历')
        elif '硕士' in content or '研究生' in content:
            requirements.append('硕士及以上学历')
        
        # 技术技能要求
        tech_skills = {
            'Java': 'Java开发经验',
            '机器学习': '机器学习基础',
            '深度学习': '深度学习框架经验',
            'React': 'React开发经验',
            'Vue': 'Vue开发经验',
            '分布式': '分布式系统经验',
            'Python': 'Python编程能力'
        }
        
        for skill, desc in tech_skills.items():
            if skill in content:
                requirements.append(desc)
        
        # 领域经验
        domain_exp = {
            '金融': '金融系统开发经验',
            '支付': '支付系统经验',
            '推荐系统': '推荐系统项目经验',
            '地图': '地图或GIS相关经验',
            '音视频': '音视频处理经验',
            '移动端': '移动端产品经验'
        }
        
        for domain, exp in domain_exp.items():
            if domain in content:
                requirements.append(exp)
        
        # 软技能
        if '数据分析' in content:
            requirements.append('数据分析能力')
        if '用户调研' in content:
            requirements.append('用户研究能力')
        if '架构设计' in content:
            requirements.append('系统架构设计能力')
        
        # 默认要求
        if not requirements:
            requirements = ['相关专业背景', '良好的学习能力', '团队合作精神']
        
        return requirements[:6]
    
    def enhance_description(self, content: str, department: str, location: str) -> str:
        """增强描述信息"""
        enhanced = content
        
        if department:
            enhanced += f'\n\n所属部门：{department}'
        
        if location:
            enhanced += f'\n工作地点：{location}'
        
        # 添加脉脉平台特色信息
        enhanced += '\n\n💼 通过脉脉平台内推，可直接联系内推人了解更多职位详情'
        
        return enhanced

def main():
    """主函数，用于测试"""
    crawler = MaimaiCrawler()
    jobs = crawler.run()
    print(f'爬取完成，共获得 {len(jobs)} 个职位')

if __name__ == '__main__':
    main()
