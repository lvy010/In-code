#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地开发服务器
用于本地测试网站
"""

import os
import sys
import http.server
import socketserver
import webbrowser
from pathlib import Path

class HTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """自定义HTTP请求处理器"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)
    
    def end_headers(self):
        # 添加CORS头，允许本地开发
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        # 自定义日志格式
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    # 默认配置
    PORT = 8000
    HOST = 'localhost'
    
    # 检查端口是否被占用
    original_port = PORT
    max_attempts = 10
    
    for attempt in range(max_attempts):
        try:
            with socketserver.TCPServer((HOST, PORT), HTTPRequestHandler) as httpd:
                print(f"🌐 内推宝典网站启动成功!")
                print(f"📍 访问地址: http://{HOST}:{PORT}")
                print(f"📁 服务目录: {Path(__file__).parent}")
                print(f"🔄 按 Ctrl+C 停止服务器")
                
                # 自动打开浏览器
                try:
                    webbrowser.open(f"http://{HOST}:{PORT}")
                    print(f"🚀 浏览器已自动打开")
                except:
                    print(f"💡 请手动在浏览器中打开: http://{HOST}:{PORT}")
                
                print(f"\n{'='*50}")
                print(f"🎯 使用说明:")
                print(f"   1. 运行爬虫: python run_crawler.py")
                print(f"   2. 定时爬虫: python run_crawler.py --mode schedule")
                print(f"   3. 安装依赖: pip install -r requirements.txt")
                print(f"{'='*50}\n")
                
                # 启动服务器
                httpd.serve_forever()
                
        except OSError as e:
            if "Address already in use" in str(e):
                PORT += 1
                if attempt < max_attempts - 1:
                    print(f"⚠️  端口 {PORT-1} 被占用，尝试端口 {PORT}")
                    continue
                else:
                    print(f"❌ 无法找到可用端口 (尝试了 {original_port}-{PORT})")
                    sys.exit(1)
            else:
                print(f"❌ 启动服务器失败: {e}")
                sys.exit(1)
        except KeyboardInterrupt:
            print(f"\n\n🛑 服务器已停止")
            print(f"👋 再见!")
            sys.exit(0)

if __name__ == '__main__':
    main()
