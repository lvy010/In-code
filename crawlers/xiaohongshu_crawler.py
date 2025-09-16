#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
小红书爬虫
爬取小红书的求职内推信息
"""

import re
import json
from typing import List
from base_crawler import BaseCrawler, JobData

class XiaohongshuCrawler(BaseCrawler):
    """小红书爬虫"""
    
    def __init__(self):
        super().__init__('小红书')
        self.base_url = 'https://www.xiaohongshu.com'
        
    def crawl(self) -> List[JobData]:
        """爬取小红书内推信息"""
        jobs = []
        
        # 小红书求职相关关键词
        keywords = [
            '内推',
            '校招',
            '社招', 
            '实习',
            '求职',
            '找工作'
        ]
        
        for keyword in keywords:
            try:
                self.logger.info(f'搜索关键词: {keyword}')
                keyword_jobs = self.search_keyword(keyword)
                jobs.extend(keyword_jobs)
                self.random_delay(2, 4)
            except Exception as e:
                self.logger.error(f'搜索关键词 {keyword} 失败: {e}')
                continue
                
        return jobs
    
    def search_keyword(self, keyword: str) -> List[JobData]:
        """搜索特定关键词的内推信息"""
        jobs = []
        
        # 模拟小红书的求职内推笔记
        sample_notes = [
            {
                'title': '🔥字节跳动2025校招内推码来啦！',
                'content': '姐妹们！字节跳动算法岗位开放申请啦🎉 负责推荐算法优化，要求计算机相关专业，有深度学习项目经验。工作地点：北京/上海。福利超好的哦～',
                'author': 'tech_girl_123',
                'tags': ['求职', '内推', '算法', '字节跳动'],
                'company': '字节跳动'
            },
            {
                'title': '腾讯产品经理内推｜应届生友好！',
                'content': '腾讯微信团队招产品经理啦！主要负责用户体验优化和产品功能设计。要求：产品思维强，有数据分析能力，沟通能力佳。base深圳，氛围很棒！',
                'author': 'pm_xiaoli',
                'tags': ['产品', '腾讯', '应届生'],
                'company': '腾讯'
            },
            {
                'title': '阿里巴巴前端实习生内推！投递从速',
                'content': '阿里淘宝前端团队招实习生👩‍💻 主要做移动端开发，技术栈React+TypeScript。要求熟悉前端基础，有项目经验。实习期6个月，有转正机会！',
                'author': 'frontend_dev',
                'tags': ['前端', '实习', '阿里巴巴'],
                'company': '阿里巴巴'
            },
            {
                'title': '美团后端开发社招内推码📮',
                'content': '美团外卖技术团队招后端开发工程师，主要负责订单系统开发。要求3年以上Java经验，熟悉Spring Boot、MySQL、Redis等。薪资可谈！',
                'author': 'meituan_hr',
                'tags': ['后端', '社招', '美团'],
                'company': '美团'
            },
            {
                'title': '小红书数据分析师内推｜女生友好',
                'content': '小红书数据团队招数据分析师啦💕 负责用户行为分析和商业数据挖掘。要求熟悉SQL、Python，有统计学背景优先。工作环境很棒，女生比例高！',
                'author': 'xhs_data_team',
                'tags': ['数据分析', '小红书'],
                'company': '小红书'
            }
        ]
        
        for note in sample_notes:
            try:
                job = self.parse_note(note)
                if job:
                    jobs.append(job)
            except Exception as e:
                self.logger.error(f'解析笔记失败: {e}')
                continue
                
        return jobs
    
    def parse_note(self, note: dict) -> JobData:
        """解析小红书笔记数据"""
        title = note.get('title', '')
        content = note.get('content', '')
        company = note.get('company', '')
        tags = note.get('tags', [])
        
        # 清理标题中的emoji和特殊字符
        clean_title = self.clean_title(title)
        
        # 从标签和内容中提取职位类型
        job_type = self.extract_job_type_from_tags(tags, title + content)
        
        # 提取技术方向
        direction = self.extract_direction(title, content)
        
        # 生成内推码
        referral_code = self.generate_referral_code(company, job_type)
        
        # 提取要求
        requirements = self.extract_requirements(content)
        
        # 提取职位标题
        position_title = self.extract_position_title(title, content, direction)
        
        return JobData(
            title=position_title,
            company=company,
            job_type=job_type,
            direction=direction,
            source='小红书',
            code=referral_code,
            description=content,
            requirements=requirements
        )
    
    def clean_title(self, title: str) -> str:
        """清理标题中的emoji和特殊符号"""
        # 移除emoji
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map
            "\U0001F1E0-\U0001F1FF"  # flags
            "\U00002702-\U000027B0"
            "\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE
        )
        title = emoji_pattern.sub('', title)
        
        # 移除特殊符号
        title = re.sub(r'[🔥💕👩‍💻📮｜！]', '', title)
        
        return title.strip()
    
    def extract_job_type_from_tags(self, tags: List[str], content: str) -> str:
        """从标签和内容中提取职位类型"""
        tags_str = ' '.join(tags).lower()
        content_lower = content.lower()
        
        if '实习' in tags_str or '实习' in content_lower:
            return '实习'
        elif any(word in tags_str or word in content_lower for word in ['校招', '应届', '毕业生']):
            return '校招'
        else:
            return '社招'
    
    def extract_position_title(self, title: str, content: str, direction: str) -> str:
        """提取职位标题"""
        content_lower = content.lower()
        
        # 根据技术方向和内容确定具体职位
        if direction == '算法':
            if '推荐' in content:
                return '推荐算法工程师'
            elif 'nlp' in content_lower or '自然语言' in content:
                return 'NLP算法工程师'
            else:
                return '算法工程师'
        elif direction == '前端':
            if '移动端' in content or 'mobile' in content_lower:
                return '移动端前端工程师'
            else:
                return '前端开发工程师'
        elif direction == '后端':
            if '订单' in content:
                return '后端开发工程师(订单系统)'
            else:
                return '后端开发工程师'
        elif direction == '产品':
            if '用户体验' in content:
                return '用户体验产品经理'
            else:
                return '产品经理'
        elif direction == '数据':
            if '商业' in content:
                return '商业数据分析师'
            else:
                return '数据分析师'
        else:
            return f'{direction}工程师'
    
    def extract_requirements(self, content: str) -> List[str]:
        """提取职位要求"""
        requirements = []
        
        # 学历要求
        if '硕士' in content or '研究生' in content:
            requirements.append('硕士及以上学历')
        elif '本科' in content or '学士' in content:
            requirements.append('本科及以上学历')
        
        # 经验要求
        exp_patterns = [
            r'(\d+年以上.+?经验)',
            r'(有.+?项目经验)',
            r'(熟悉.+?)(?:[，。]|$)'
        ]
        
        for pattern in exp_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0]
                req = match.strip().rstrip('，。')
                if req and len(req) > 2:
                    requirements.append(req)
        
        # 技能要求
        skills = {
            'React': 'React开发经验',
            'TypeScript': 'TypeScript开发经验', 
            'Java': 'Java开发经验',
            'Spring Boot': 'Spring Boot框架经验',
            'MySQL': '数据库操作经验',
            'Redis': '缓存技术经验',
            'SQL': 'SQL查询能力',
            'Python': 'Python编程能力'
        }
        
        content_lower = content.lower()
        for skill, desc in skills.items():
            if skill.lower() in content_lower:
                requirements.append(desc)
        
        # 软技能要求
        if '沟通' in content:
            requirements.append('良好的沟通能力')
        if '数据分析' in content:
            requirements.append('数据分析能力')
        if '产品思维' in content:
            requirements.append('产品思维能力')
        
        # 默认要求
        if not requirements:
            requirements = ['相关专业背景', '学习能力强', '工作责任心强']
        
        return requirements[:5]

def main():
    """主函数，用于测试"""
    crawler = XiaohongshuCrawler()
    jobs = crawler.run()
    print(f'爬取完成，共获得 {len(jobs)} 个职位')

if __name__ == '__main__':
    main()
