#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
爬虫运行脚本
支持手动运行和定时任务
"""

import os
import sys
import argparse
import schedule
import time
from datetime import datetime
from pathlib import Path

# 添加crawlers目录到Python路径
current_dir = Path(__file__).parent
crawlers_dir = current_dir / 'crawlers'
sys.path.append(str(crawlers_dir))

from crawlers.main_crawler import MainCrawler

def run_crawler():
    """运行爬虫"""
    print(f"\n{'='*60}")
    print(f"🕒 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - 开始运行爬虫")
    print(f"{'='*60}")
    
    try:
        crawler = MainCrawler()
        jobs, stats = crawler.run()
        
        print(f"\n✅ 爬虫运行成功!")
        print(f"📊 获取职位: {len(jobs)} 个")
        print(f"🕐 今日新增: {stats.get('today_jobs', 0)} 个")
        print(f"📅 更新时间: {stats.get('update_time', '未知')}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 爬虫运行失败: {e}")
        return False

def setup_schedule():
    """设置定时任务"""
    # 每天早上9点运行
    schedule.every().day.at("09:00").do(run_crawler)
    
    # 每天下午2点运行
    schedule.every().day.at("14:00").do(run_crawler)
    
    # 每天晚上8点运行
    schedule.every().day.at("20:00").do(run_crawler)
    
    print("📅 定时任务已设置:")
    print("   - 每天 09:00 自动运行")
    print("   - 每天 14:00 自动运行") 
    print("   - 每天 20:00 自动运行")

def main():
    parser = argparse.ArgumentParser(description='内推码爬虫系统')
    parser.add_argument('--mode', choices=['once', 'schedule'], default='once',
                       help='运行模式: once=单次运行, schedule=定时运行')
    parser.add_argument('--interval', type=int, default=60,
                       help='定时模式下的检查间隔(秒), 默认60秒')
    
    args = parser.parse_args()
    
    print("🤖 内推码爬虫系统启动")
    print(f"📁 工作目录: {current_dir}")
    print(f"🔧 运行模式: {args.mode}")
    
    if args.mode == 'once':
        # 单次运行
        print("\n🚀 开始单次爬虫运行...")
        success = run_crawler()
        sys.exit(0 if success else 1)
        
    elif args.mode == 'schedule':
        # 定时运行
        print(f"\n⏰ 启动定时爬虫 (检查间隔: {args.interval}秒)")
        setup_schedule()
        
        print(f"\n🔄 系统正在运行中... (按 Ctrl+C 停止)")
        print(f"💡 提示: 可以访问网站查看最新数据")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(args.interval)
                
        except KeyboardInterrupt:
            print(f"\n\n🛑 用户中断，系统停止运行")
            print("👋 再见!")

if __name__ == '__main__':
    main()
