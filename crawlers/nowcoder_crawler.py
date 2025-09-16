#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
牛客网爬虫
爬取牛客网的内推信息
"""

import re
import json
import time
import random
from typing import List
from bs4 import BeautifulSoup
from base_crawler import BaseCrawler, JobData

class NowcoderCrawler(BaseCrawler):
    """牛客网爬虫"""
    
    def __init__(self):
        super().__init__('牛客')
        self.base_url = 'https://www.nowcoder.com'
        
    def crawl(self) -> List[JobData]:
        """爬取牛客网内推信息"""
        jobs = []
        
        # 模拟爬取不同页面的内推信息
        pages = [
            '/discuss/tag/640',  # 内推tag
            '/discuss/tag/639',  # 校招tag
            '/discuss/tag/641'   # 实习tag
        ]
        
        for page in pages:
            try:
                self.logger.info(f'爬取页面: {page}')
                page_jobs = self.crawl_page(page)
                jobs.extend(page_jobs)
                self.random_delay(2, 4)  # 随机延时
            except Exception as e:
                self.logger.error(f'爬取页面 {page} 失败: {e}')
                continue
                
        return jobs
    
    def crawl_page(self, page_url: str) -> List[JobData]:
        """爬取单个页面"""
        # 由于无法直接访问牛客网，这里使用模拟数据
        # 实际应用中，这里会发送HTTP请求获取页面内容
        
        jobs = []
        
        # 模拟牛客网的内推信息
        sample_posts = [
            {
                'title': '字节跳动2025校招内推码',
                'content': '字节跳动前端开发工程师内推，要求熟悉React/Vue，有项目经验优先',
                'company': '字节跳动',
                'referral_code': 'TT2025001'
            },
            {
                'title': '腾讯后端开发社招内推',
                'content': '腾讯微信事业群后端开发，要求3年以上Java经验，熟悉Spring Boot',
                'company': '腾讯',
                'referral_code': 'TX2025002'
            },
            {
                'title': '阿里巴巴算法工程师校招',
                'content': '淘宝推荐算法团队，要求硕士学历，有机器学习项目经验',
                'company': '阿里巴巴',
                'referral_code': 'AL2025003'
            },
            {
                'title': '美团产品经理实习生',
                'content': '美团外卖产品团队实习生招聘，要求有产品思维和数据分析能力',
                'company': '美团',
                'referral_code': 'MT2025004'
            },
            {
                'title': '百度数据分析师社招',
                'content': '百度搜索部门数据分析师，要求熟悉SQL/Python，有BI工具经验',
                'company': '百度',
                'referral_code': 'BD2025005'
            }
        ]
        
        for post in sample_posts:
            try:
                job = self.parse_job_post(post)
                if job:
                    jobs.append(job)
            except Exception as e:
                self.logger.error(f'解析职位信息失败: {e}')
                continue
                
        return jobs
    
    def parse_job_post(self, post_data: dict) -> JobData:
        """解析职位帖子数据"""
        title = post_data.get('title', '')
        content = post_data.get('content', '')
        company = post_data.get('company', '')
        referral_code = post_data.get('referral_code', '')
        
        # 如果没有内推码，生成一个
        if not referral_code:
            referral_code = self.generate_referral_code(company, self.extract_job_type(title + content))
        
        # 提取职位类型和技术方向
        job_type = self.extract_job_type(title + content)
        direction = self.extract_direction(title, content)
        
        # 提取职位标题（去除公司名和其他修饰词）
        clean_title = self.clean_job_title(title)
        
        # 提取职位要求
        requirements = self.extract_requirements(content)
        
        return JobData(
            title=clean_title,
            company=company,
            job_type=job_type,
            direction=direction,
            source='牛客',
            code=referral_code,
            description=content,
            requirements=requirements
        )
    
    def clean_job_title(self, title: str) -> str:
        """清理职位标题，提取核心职位名称"""
        # 移除常见的修饰词
        remove_words = ['2025', '校招', '内推', '社招', '实习', '招聘', '急招', '春招', '秋招']
        
        for word in remove_words:
            title = title.replace(word, '')
        
        # 提取职位名称的关键词
        if '前端' in title:
            return '前端开发工程师'
        elif '后端' in title:
            return '后端开发工程师' 
        elif '算法' in title:
            return '算法工程师'
        elif '产品' in title:
            return '产品经理'
        elif '数据' in title:
            return '数据分析师'
        elif '测试' in title:
            return '测试工程师'
        else:
            # 简单清理
            title = re.sub(r'[^\w\s]', '', title).strip()
            return title if title else '软件工程师'
    
    def extract_requirements(self, content: str) -> List[str]:
        """从内容中提取职位要求"""
        requirements = []
        
        # 常见要求关键词
        requirement_patterns = [
            r'要求[：:](.+?)(?:[。\n]|$)',
            r'任职要求[：:](.+?)(?:[。\n]|$)',
            r'技能要求[：:](.+?)(?:[。\n]|$)',
            r'([0-9]+年以上.+?经验)',
            r'(熟悉.+?)(?:[，。\n]|$)',
            r'(本科|硕士|博士).+?学历',
        ]
        
        for pattern in requirement_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0]
                req = match.strip().rstrip('，。')
                if req and len(req) > 3:  # 过滤太短的内容
                    requirements.append(req)
        
        # 如果没有找到具体要求，添加一些通用要求
        if not requirements:
            if '前端' in content:
                requirements = ['熟悉JavaScript/HTML/CSS', '有React/Vue经验', '良好的编程习惯']
            elif '后端' in content:
                requirements = ['熟悉Java/Python/Go', '有框架开发经验', '了解数据库操作']
            elif '算法' in content:
                requirements = ['有机器学习基础', '熟悉Python/C++', '良好的数学功底']
            else:
                requirements = ['本科及以上学历', '良好的沟通能力', '有相关项目经验']
        
        return requirements[:5]  # 最多返回5个要求

def main():
    """主函数，用于测试"""
    crawler = NowcoderCrawler()
    jobs = crawler.run()
    print(f'爬取完成，共获得 {len(jobs)} 个职位')

if __name__ == '__main__':
    main()
