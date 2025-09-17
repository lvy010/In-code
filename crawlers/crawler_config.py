#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
爬虫配置文件
基于Anti-Anti-Spider项目的配置管理
"""

import json
from pathlib import Path

class CrawlerConfig:
    """爬虫配置管理器"""
    
    def __init__(self):
        self.config_file = Path(__file__).parent / 'config.json'
        self.load_config()
    
    def load_config(self):
        """加载配置"""
        if self.config_file.exists():
            with open(self.config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        else:
            self.config = self.get_default_config()
            self.save_config()
    
    def get_default_config(self):
        """获取默认配置"""
        return {
            "anti_detection": {
                "enable": True,
                "user_agents": [
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
                ],
                "delay_range": [2, 5],
                "retry_times": 3
            },
            "platforms": {
                "nowcoder": {
                    "enable": True,
                    "base_url": "https://www.nowcoder.com",
                    "endpoints": [
                        "/discuss/tag/640",  # 内推
                        "/discuss/tag/639",  # 校招
                        "/discuss/tag/641"   # 实习
                    ]
                },
                "leetcode": {
                    "enable": True,
                    "base_url": "https://leetcode.cn",
                    "endpoints": [
                        "/circle/discuss/",
                        "/careers/"
                    ]
                },
                "xiaohongshu": {
                    "enable": False,  # 小红书反爬虫较强，默认关闭
                    "base_url": "https://www.xiaohongshu.com",
                    "keywords": ["内推", "校招", "实习", "求职"]
                },
                "maimai": {
                    "enable": False,  # 脉脉需要登录，默认关闭
                    "base_url": "https://maimai.cn"
                }
            },
            "data_processing": {
                "enable_deduplication": True,
                "max_age_days": 60,
                "min_code_length": 4,
                "max_code_length": 20
            },
            "output": {
                "save_raw_data": True,
                "save_processed_data": True,
                "data_dir": "data",
                "backup_dir": "backup"
            }
        }
    
    def save_config(self):
        """保存配置"""
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, ensure_ascii=False, indent=2)
    
    def get(self, key, default=None):
        """获取配置项"""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key, value):
        """设置配置项"""
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value
        self.save_config()

# 全局配置实例
config = CrawlerConfig()
