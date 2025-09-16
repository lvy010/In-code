#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基础爬虫类
提供通用的爬虫功能和数据结构
"""

import json
import time
import random
import requests
from datetime import datetime
from typing import List, Dict, Any
from abc import ABC, abstractmethod
import logging
from pathlib import Path

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('crawler.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class JobData:
    """职位数据结构"""
    def __init__(self, title: str, company: str, job_type: str, direction: str, 
                 source: str, code: str, description: str = "", requirements: List[str] = None):
        self.id = int(time.time() * 1000) + random.randint(1000, 9999)  # 生成唯一ID
        self.title = title
        self.company = company
        self.type = job_type  # 校招/社招/实习
        self.direction = direction  # 前端/后端/算法/数据/产品/测试
        self.source = source  # 牛客/力扣/小红书/脉脉
        self.code = code  # 内推码
        self.date = datetime.now().strftime('%Y-%m-%d')
        self.description = description
        self.requirements = requirements or []
        
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'type': self.type,
            'direction': self.direction,
            'source': self.source,
            'code': self.code,
            'date': self.date,
            'description': self.description,
            'requirements': self.requirements
        }

class BaseCrawler(ABC):
    """基础爬虫抽象类"""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f'crawler.{name}')
        self.session = requests.Session()
        self.setup_session()
        
    def setup_session(self):
        """设置请求会话"""
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def random_delay(self, min_seconds: float = 1.0, max_seconds: float = 3.0):
        """随机延时，避免请求过于频繁"""
        delay = random.uniform(min_seconds, max_seconds)
        time.sleep(delay)
    
    @abstractmethod
    def crawl(self) -> List[JobData]:
        """爬取数据的抽象方法，子类必须实现"""
        pass
    
    def save_data(self, jobs: List[JobData], filename: str = None):
        """保存数据到JSON文件"""
        if not filename:
            filename = f'{self.name}_jobs_{datetime.now().strftime("%Y%m%d")}.json'
        
        # 确保目录存在
        data_dir = Path('data')
        data_dir.mkdir(exist_ok=True)
        
        filepath = data_dir / filename
        
        # 转换为字典列表
        jobs_dict = [job.to_dict() for job in jobs]
        
        # 如果文件已存在，则追加数据（去重）
        existing_jobs = []
        if filepath.exists():
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    existing_jobs = json.load(f)
            except Exception as e:
                self.logger.warning(f'读取现有数据失败: {e}')
        
        # 合并数据并去重（基于内推码）
        existing_codes = {job.get('code', '') for job in existing_jobs}
        new_jobs = [job for job in jobs_dict if job['code'] not in existing_codes]
        
        if new_jobs:
            all_jobs = existing_jobs + new_jobs
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(all_jobs, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f'保存了 {len(new_jobs)} 个新职位到 {filepath}')
        else:
            self.logger.info('没有新职位需要保存')
        
        return len(new_jobs)
    
    def load_existing_data(self, filename: str = None) -> List[Dict]:
        """加载现有数据"""
        if not filename:
            filename = f'{self.name}_jobs_{datetime.now().strftime("%Y%m%d")}.json'
        
        filepath = Path('data') / filename
        
        if not filepath.exists():
            return []
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f'加载数据失败: {e}')
            return []
    
    def extract_job_type(self, text: str) -> str:
        """从文本中提取职位类型"""
        text = text.lower()
        if any(word in text for word in ['校招', '秋招', '春招', '校园招聘', '应届']):
            return '校招'
        elif any(word in text for word in ['实习', '暑期', '寒假']):
            return '实习'
        else:
            return '社招'
    
    def extract_direction(self, title: str, description: str = "") -> str:
        """从职位标题和描述中提取技术方向"""
        text = (title + " " + description).lower()
        
        if any(word in text for word in ['前端', 'frontend', 'react', 'vue', 'angular', 'javascript', 'html', 'css']):
            return '前端'
        elif any(word in text for word in ['后端', 'backend', 'java', 'python', 'go', 'node.js', 'spring', 'django']):
            return '后端'
        elif any(word in text for word in ['算法', 'algorithm', '机器学习', 'ai', '深度学习', 'nlp', 'cv']):
            return '算法'
        elif any(word in text for word in ['数据', 'data', '分析师', 'bi', 'sql', '数据库']):
            return '数据'
        elif any(word in text for word in ['产品', 'product', '产品经理', 'pm']):
            return '产品'
        elif any(word in text for word in ['测试', 'test', 'qa', '质量']):
            return '测试'
        else:
            return '其他'
    
    def generate_referral_code(self, company: str, job_type: str) -> str:
        """生成内推码（模拟）"""
        company_code = {
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
        }.get(company, 'XX')
        
        year = datetime.now().year
        sequence = random.randint(1000, 9999)
        
        return f'{company_code}{year}{sequence}'
    
    def run(self):
        """运行爬虫"""
        self.logger.info(f'开始爬取 {self.name} 数据...')
        start_time = time.time()
        
        try:
            jobs = self.crawl()
            count = self.save_data(jobs)
            
            end_time = time.time()
            duration = end_time - start_time
            
            self.logger.info(f'{self.name} 爬取完成: 获取 {len(jobs)} 个职位，新增 {count} 个，耗时 {duration:.2f} 秒')
            return jobs
            
        except Exception as e:
            self.logger.error(f'{self.name} 爬取失败: {e}')
            raise
