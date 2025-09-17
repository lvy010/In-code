#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
主爬虫脚本
协调运行所有平台的爬虫，并整合数据
"""

import os
import sys
import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from base_crawler import JobData
from nowcoder_crawler import NowcoderCrawler
from leetcode_crawler import LeetcodeCrawler
from xiaohongshu_crawler import XiaohongshuCrawler
from maimai_crawler import MaimaiCrawler
from real_data_crawler import RealDataCrawler

class MainCrawler:
    """主爬虫管理器"""
    
    def __init__(self):
        self.logger = logging.getLogger('main_crawler')
        self.crawlers = {
            '牛客': NowcoderCrawler(),
            '力扣': LeetcodeCrawler(),
            '小红书': XiaohongshuCrawler(),
            '脉脉': MaimaiCrawler(),
            '真实数据': RealDataCrawler()  # 新增真实数据爬虫
        }
        
        # 确保数据目录存在
        self.data_dir = Path('data')
        self.data_dir.mkdir(exist_ok=True)
        
        # 确保前端数据目录存在
        self.frontend_data_dir = Path('../data')
        self.frontend_data_dir.mkdir(exist_ok=True)
    
    def run_all_crawlers(self) -> Dict[str, List[JobData]]:
        """运行所有爬虫"""
        self.logger.info('开始运行所有爬虫...')
        start_time = time.time()
        
        all_jobs = {}
        total_jobs = 0
        
        for platform, crawler in self.crawlers.items():
            try:
                self.logger.info(f'运行 {platform} 爬虫...')
                jobs = crawler.run()
                all_jobs[platform] = jobs
                total_jobs += len(jobs)
                
                self.logger.info(f'{platform} 爬虫完成，获取 {len(jobs)} 个职位')
                
                # 休息一下再运行下一个爬虫
                time.sleep(2)
                
            except Exception as e:
                self.logger.error(f'{platform} 爬虫运行失败: {e}')
                all_jobs[platform] = []
        
        end_time = time.time()
        duration = end_time - start_time
        
        self.logger.info(f'所有爬虫运行完成，总共获取 {total_jobs} 个职位，耗时 {duration:.2f} 秒')
        
        return all_jobs
    
    def merge_and_save_data(self, all_jobs: Dict[str, List[JobData]]):
        """合并并保存所有数据"""
        self.logger.info('开始合并和保存数据...')
        
        # 合并所有职位数据
        merged_jobs = []
        for platform, jobs in all_jobs.items():
            for job in jobs:
                merged_jobs.append(job.to_dict())
        
        # 按日期排序
        merged_jobs.sort(key=lambda x: x['date'], reverse=True)
        
        # 保存到数据文件
        today = datetime.now().strftime('%Y%m%d')
        
        # 保存到爬虫数据目录
        crawler_data_file = self.data_dir / f'all_jobs_{today}.json'
        with open(crawler_data_file, 'w', encoding='utf-8') as f:
            json.dump(merged_jobs, f, ensure_ascii=False, indent=2)
        
        # 保存到前端数据目录（用于网站显示）
        frontend_data_file = self.frontend_data_dir / 'jobs.json'
        with open(frontend_data_file, 'w', encoding='utf-8') as f:
            json.dump(merged_jobs, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f'数据保存完成: {len(merged_jobs)} 个职位')
        self.logger.info(f'爬虫数据文件: {crawler_data_file}')
        self.logger.info(f'前端数据文件: {frontend_data_file}')
        
        return merged_jobs
    
    def generate_statistics(self, merged_jobs: List[Dict]):
        """生成统计信息"""
        self.logger.info('生成统计信息...')
        
        stats = {
            'total_jobs': len(merged_jobs),
            'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'by_source': {},
            'by_type': {},
            'by_direction': {},
            'by_company': {},
            'today_jobs': 0
        }
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        for job in merged_jobs:
            # 按来源统计
            source = job.get('source', '未知')
            stats['by_source'][source] = stats['by_source'].get(source, 0) + 1
            
            # 按类型统计
            job_type = job.get('type', '未知')
            stats['by_type'][job_type] = stats['by_type'].get(job_type, 0) + 1
            
            # 按方向统计
            direction = job.get('direction', '未知')
            stats['by_direction'][direction] = stats['by_direction'].get(direction, 0) + 1
            
            # 按公司统计
            company = job.get('company', '未知')
            stats['by_company'][company] = stats['by_company'].get(company, 0) + 1
            
            # 今日新增统计
            if job.get('date') == today:
                stats['today_jobs'] += 1
        
        # 保存统计信息
        stats_file = self.frontend_data_dir / 'statistics.json'
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f'统计信息已保存到: {stats_file}')
        
        # 打印统计摘要
        self.print_statistics_summary(stats)
        
        return stats
    
    def print_statistics_summary(self, stats: Dict):
        """打印统计摘要"""
        print("\n" + "="*50)
        print("📊 数据统计摘要")
        print("="*50)
        print(f"📅 更新时间: {stats['update_time']}")
        print(f"📦 职位总数: {stats['total_jobs']}")
        print(f"🆕 今日新增: {stats['today_jobs']}")
        
        print("\n📈 按来源分布:")
        for source, count in stats['by_source'].items():
            print(f"  {source}: {count} 个职位")
        
        print("\n🏷️ 按类型分布:")
        for job_type, count in stats['by_type'].items():
            print(f"  {job_type}: {count} 个职位")
        
        print("\n💻 按技术方向分布:")
        for direction, count in stats['by_direction'].items():
            print(f"  {direction}: {count} 个职位")
        
        print("\n🏢 热门公司:")
        sorted_companies = sorted(stats['by_company'].items(), key=lambda x: x[1], reverse=True)
        for company, count in sorted_companies[:10]:  # 显示前10名
            print(f"  {company}: {count} 个职位")
        
        print("="*50)
    
    def cleanup_old_data(self, keep_days: int = 7):
        """清理旧数据文件"""
        self.logger.info(f'清理 {keep_days} 天前的数据文件...')
        
        current_time = time.time()
        cutoff_time = current_time - (keep_days * 24 * 60 * 60)
        
        cleaned_count = 0
        for file_path in self.data_dir.glob('*.json'):
            if file_path.stat().st_mtime < cutoff_time:
                file_path.unlink()
                cleaned_count += 1
                self.logger.info(f'删除旧文件: {file_path.name}')
        
        if cleaned_count > 0:
            self.logger.info(f'已清理 {cleaned_count} 个旧数据文件')
        else:
            self.logger.info('没有需要清理的旧文件')
    
    def run(self, cleanup_old: bool = True):
        """运行主爬虫流程"""
        self.logger.info('🚀 启动内推码爬虫系统')
        
        try:
            # 1. 运行所有爬虫
            all_jobs = self.run_all_crawlers()
            
            # 2. 合并和保存数据
            merged_jobs = self.merge_and_save_data(all_jobs)
            
            # 3. 生成统计信息
            stats = self.generate_statistics(merged_jobs)
            
            # 4. 清理旧数据（可选）
            if cleanup_old:
                self.cleanup_old_data()
            
            self.logger.info('✅ 爬虫系统运行完成')
            return merged_jobs, stats
            
        except Exception as e:
            self.logger.error(f'❌ 爬虫系统运行失败: {e}')
            raise

def main():
    """主函数"""
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('crawler_main.log', encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    
    # 运行主爬虫
    crawler = MainCrawler()
    jobs, stats = crawler.run()
    
    print(f"\n🎉 爬虫运行完成！共获取 {len(jobs)} 个内推职位")
    print("💡 提示: 数据已保存到 ../data/jobs.json，前端网站将自动显示最新数据")

if __name__ == '__main__':
    main()
