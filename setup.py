#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目安装和配置脚本
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, description):
    """运行命令并处理结果"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description}完成")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description}失败: {e.stderr}")
        return False

def check_python_version():
    """检查Python版本"""
    version = sys.version_info
    print(f"🐍 Python版本: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ 错误: 需要Python 3.8或更高版本")
        return False
    
    print("✅ Python版本检查通过")
    return True

def install_dependencies():
    """安装依赖"""
    requirements_file = Path(__file__).parent / 'requirements.txt'
    
    if not requirements_file.exists():
        print("❌ 找不到requirements.txt文件")
        return False
    
    # 先升级pip
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "升级pip"):
        print("⚠️  升级pip失败，继续安装依赖...")
    
    # 安装依赖
    command = f"{sys.executable} -m pip install -r {requirements_file}"
    return run_command(command, "安装Python依赖")

def create_directories():
    """创建必要的目录"""
    directories = ['data', 'logs']
    
    for dir_name in directories:
        dir_path = Path(__file__).parent / dir_name
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"📁 创建目录: {dir_name}")
        else:
            print(f"📁 目录已存在: {dir_name}")
    
    return True

def create_sample_data():
    """创建示例数据"""
    data_dir = Path(__file__).parent / 'data'
    jobs_file = data_dir / 'jobs.json'
    
    if not jobs_file.exists():
        print("📄 创建示例数据文件...")
        
        # 运行爬虫生成示例数据
        crawler_script = Path(__file__).parent / 'run_crawler.py'
        if crawler_script.exists():
            command = f"{sys.executable} {crawler_script}"
            if run_command(command, "生成示例数据"):
                print("✅ 示例数据创建成功")
                return True
        
        print("⚠️  无法自动生成示例数据，网站将使用内置示例数据")
    else:
        print("📄 数据文件已存在")
    
    return True

def check_port_availability(port=8000):
    """检查端口是否可用"""
    import socket
    
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            print(f"✅ 端口 {port} 可用")
            return True
    except OSError:
        print(f"⚠️  端口 {port} 被占用，服务器将自动选择其他端口")
        return False

def show_completion_message():
    """显示完成信息"""
    print("\n" + "="*60)
    print("🎉 内推宝典安装完成！")
    print("="*60)
    print("📋 后续步骤:")
    print()
    print("1. 启动网站服务器:")
    print("   python start_server.py")
    print()
    print("2. 运行爬虫获取数据:")
    print("   python run_crawler.py")
    print()
    print("3. 设置定时爬虫 (可选):")
    print("   python run_crawler.py --mode schedule")
    print()
    print("💡 提示:")
    print("   - 网站默认运行在 http://localhost:8000")
    print("   - 爬虫数据保存在 data/ 目录")
    print("   - 日志文件保存在 logs/ 目录")
    print()
    print("📚 更多信息请查看 README.md 文件")
    print("="*60)

def main():
    """主安装流程"""
    print("🚀 开始安装内推码宝典...")
    print(f"💻 操作系统: {platform.system()} {platform.release()}")
    print(f"📁 安装目录: {Path(__file__).parent}")
    print()
    
    # 检查Python版本
    if not check_python_version():
        sys.exit(1)
    
    # 创建目录
    if not create_directories():
        sys.exit(1)
    
    # 安装依赖
    if not install_dependencies():
        print("❌ 依赖安装失败，请手动运行: pip install -r requirements.txt")
        sys.exit(1)
    
    # 检查端口
    check_port_availability()
    
    # 创建示例数据
    create_sample_data()
    
    # 显示完成信息
    show_completion_message()

if __name__ == '__main__':
    main()
