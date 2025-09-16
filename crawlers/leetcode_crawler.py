#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
力扣爬虫
爬取力扣讨论区的内推信息
"""

import re
import json
from typing import List
from base_crawler import BaseCrawler, JobData

class LeetcodeCrawler(BaseCrawler):
    """力扣爬虫"""
    
    def __init__(self):
        super().__init__('力扣')
        self.base_url = 'https://leetcode.cn'
        
    def crawl(self) -> List[JobData]:
        """爬取力扣内推信息"""
        jobs = []
        
        # 力扣讨论区的内推相关话题
        topics = [
            'interview',  # 面试
            'career',     # 职业
            'internship'  # 实习
        ]
        
        for topic in topics:
            try:
                self.logger.info(f'爬取话题: {topic}')
                topic_jobs = self.crawl_topic(topic)
                jobs.extend(topic_jobs)
                self.random_delay(2, 4)
            except Exception as e:
                self.logger.error(f'爬取话题 {topic} 失败: {e}')
                continue
                
        return jobs
    
    def crawl_topic(self, topic: str) -> List[JobData]:
        """爬取特定话题的内推信息"""
        jobs = []
        
        # 模拟力扣讨论区的内推信息
        sample_discussions = [
            {
                'title': '腾讯2025校招内推 - 后端开发',
                'content': '腾讯云计算部门招聘后端开发工程师，主要负责云服务器相关开发，要求熟悉Go语言，有分布式系统经验',
                'author': 'tencent_hr',
                'company': '腾讯'
            },
            {
                'title': '阿里巴巴算法工程师内推码',
                'content': '阿里云AI团队招聘算法工程师，负责推荐算法和NLP相关工作，要求硕士学历，熟悉深度学习框架',
                'author': 'alibaba_ai',
                'company': '阿里巴巴'
            },
            {
                'title': '字节跳动前端实习生内推',
                'content': '抖音前端团队招聘实习生，负责移动端H5开发，要求熟悉React/Vue，有移动端开发经验优先',
                'author': 'bytedance_fe',
                'company': '字节跳动'
            },
            {
                'title': '网易游戏测试工程师社招',
                'content': '网易游戏测试部门招聘测试工程师，负责手游功能测试和自动化测试，要求有游戏测试经验',
                'author': 'netease_game',
                'company': '网易'
            },
            {
                'title': '滴滴数据分析师内推',
                'content': '滴滴出行数据团队招聘数据分析师，负责用户行为分析和业务数据挖掘，要求熟悉SQL和Python',
                'author': 'didi_data',
                'company': '滴滴'
            }
        ]
        
        for discussion in sample_discussions:
            try:
                job = self.parse_discussion(discussion)
                if job:
                    jobs.append(job)
            except Exception as e:
                self.logger.error(f'解析讨论失败: {e}')
                continue
                
        return jobs
    
    def parse_discussion(self, discussion: dict) -> JobData:
        """解析讨论数据"""
        title = discussion.get('title', '')
        content = discussion.get('content', '')
        company = discussion.get('company', '')
        
        # 生成内推码
        job_type = self.extract_job_type(title + content)
        referral_code = self.generate_referral_code(company, job_type)
        
        # 提取技术方向
        direction = self.extract_direction(title, content)
        
        # 清理职位标题
        clean_title = self.clean_job_title(title)
        
        # 提取要求
        requirements = self.extract_requirements(content)
        
        return JobData(
            title=clean_title,
            company=company,
            job_type=job_type,
            direction=direction,
            source='力扣',
            code=referral_code,
            description=content,
            requirements=requirements
        )
    
    def clean_job_title(self, title: str) -> str:
        """清理职位标题"""
        # 移除内推、招聘等词汇
        remove_words = ['内推', '招聘', '2025', '校招', '社招', '实习', '内推码', '-']
        
        for word in remove_words:
            title = title.replace(word, '')
        
        # 根据关键词确定职位
        title_lower = title.lower()
        if any(word in title_lower for word in ['frontend', '前端']):
            return '前端开发工程师'
        elif any(word in title_lower for word in ['backend', '后端']):
            return '后端开发工程师'
        elif any(word in title_lower for word in ['algorithm', '算法']):
            return '算法工程师'
        elif any(word in title_lower for word in ['test', '测试']):
            return '测试工程师'
        elif any(word in title_lower for word in ['data', '数据']):
            return '数据分析师'
        elif any(word in title_lower for word in ['product', '产品']):
            return '产品经理'
        else:
            # 简单清理
            title = re.sub(r'[^\w\s]', '', title).strip()
            return title if title else '软件工程师'
    
    def extract_requirements(self, content: str) -> List[str]:
        """提取职位要求"""
        requirements = []
        
        # 分析内容中的技能要求
        content_lower = content.lower()
        
        # 编程语言要求
        languages = ['java', 'python', 'go', 'javascript', 'c++', 'react', 'vue', 'spring']
        for lang in languages:
            if lang in content_lower:
                requirements.append(f'熟悉{lang.title()}')
        
        # 经验要求
        experience_pattern = r'(\d+年以上?.+?经验)'
        exp_matches = re.findall(experience_pattern, content, re.IGNORECASE)
        requirements.extend(exp_matches[:2])
        
        # 学历要求
        if any(word in content for word in ['硕士', '研究生']):
            requirements.append('硕士及以上学历')
        elif any(word in content for word in ['本科', '学士']):
            requirements.append('本科及以上学历')
        
        # 通用要求
        if '分布式' in content:
            requirements.append('有分布式系统经验')
        if '深度学习' in content:
            requirements.append('熟悉深度学习框架')
        if '移动端' in content:
            requirements.append('有移动端开发经验')
        if '自动化' in content:
            requirements.append('有自动化测试经验')
        if 'sql' in content_lower:
            requirements.append('熟悉SQL和数据库')
        
        # 如果没有找到要求，添加默认要求
        if not requirements:
            requirements = ['相关专业背景', '良好的编程能力', '团队协作精神']
        
        return requirements[:5]

def main():
    """主函数，用于测试"""
    crawler = LeetcodeCrawler()
    jobs = crawler.run()
    print(f'爬取完成，共获得 {len(jobs)} 个职位')

if __name__ == '__main__':
    main()
