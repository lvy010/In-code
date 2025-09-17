# 内推宝典 - 计算机求职内推信息整合平台

🚀 一个专业的内推码整合网站，聚合牛客、力扣、小红书、脉脉等平台的最新内推信息，助力您的求职之路！

## ✨ 功能特性

### 🌐 前端功能
- **现代化界面设计** - 响应式布局，支持移动端访问
- **智能筛选系统** - 按职位类型(校招/社招/实习)、技术方向、数据来源筛选
- **实时搜索** - 支持公司名、职位名称、内推码关键词搜索
- **职位详情展示** - 点击查看详细职位信息和要求
- **内推码复制** - 一键复制内推码到剪贴板
- **数据统计** - 实时显示职位总数、今日更新等统计信息

### 🔍 爬虫系统
- **多平台支持** - 牛客网、力扣、小红书、脉脉四大平台
- **智能数据提取** - 自动识别职位类型、技术方向、公司信息
- **去重机制** - 基于内推码自动去重，避免重复数据
- **增量更新** - 只添加新数据，保持历史记录
- **错误处理** - 完善的异常处理和日志记录

### 🛠️ 技术栈
- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **爬虫**: Python + Requests + BeautifulSoup
- **数据存储**: JSON文件 (轻量级，易于维护)
- **部署**: 静态网站 (可部署到任何Web服务器)

## 🚀 快速开始

### 环境要求
- Python 3.8+
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd In-code
```

2. **安装Python依赖**
```bash
pip install -r requirements.txt
```

3. **启动本地服务器**
```bash
python start_server.py
```

4. **运行爬虫获取数据**
```bash
# 单次运行
python run_crawler.py

# 定时运行 (每天自动运行3次)
python run_crawler.py --mode schedule
```

5. **访问网站**
打开浏览器访问 `http://localhost:8000`

## 📖 使用说明

### 爬虫使用

#### 单次运行爬虫
```bash
python run_crawler.py
```

#### 定时运行爬虫
```bash
python run_crawler.py --mode schedule
```
定时任务会在每天的 09:00、14:00、20:00 自动运行爬虫

#### 自定义参数
```bash
# 修改定时检查间隔
python run_crawler.py --mode schedule --interval 120
```

### 网站功能

1. **筛选职位**
   - 选择职位类型：秋招、社招、实习
   - 选择技术方向：前端、后端、算法、数据、产品、测试
   - 选择数据来源：牛客、力扣、小红书、脉脉
   - 关键词搜索：支持公司名、职位名、内推码搜索

2. **查看详情**
   - 点击职位卡片查看详细信息
   - 包含职位描述、任职要求、内推码等

3. **复制内推码**
   - 点击"复制内推码"按钮一键复制
   - 支持快速分享和使用

## 📁 项目结构

```
In-code/
├── index.html              # 主页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── main.js            # 主要JavaScript逻辑
│   └── data-manager.js    # 数据管理模块
├── crawlers/              # 爬虫模块
│   ├── base_crawler.py    # 基础爬虫类
│   ├── nowcoder_crawler.py    # 牛客网爬虫
│   ├── leetcode_crawler.py    # 力扣爬虫
│   ├── xiaohongshu_crawler.py # 小红书爬虫
│   ├── maimai_crawler.py      # 脉脉爬虫
│   └── main_crawler.py        # 主爬虫控制器
├── data/                  # 数据目录
│   ├── jobs.json         # 职位数据 (前端使用)
│   └── statistics.json   # 统计数据
├── run_crawler.py        # 爬虫运行脚本
├── start_server.py       # 本地服务器启动脚本
├── requirements.txt      # Python依赖
└── README.md            # 项目说明
```

## 🔧 配置说明

### 爬虫配置
- 默认每天运行3次 (09:00, 14:00, 20:00)
- 数据保存在 `data/` 目录
- 支持增量更新和去重
- 完整的日志记录

### 数据格式
职位数据结构：
```json
{
  "id": 1,
  "title": "前端开发工程师",
  "company": "字节跳动", 
  "type": "校招",
  "direction": "前端",
  "source": "牛客",
  "code": "TT2025001",
  "date": "2025-09-17",
  "description": "职位描述...",
  "requirements": ["要求1", "要求2"]
}
```

## 🌟 特色功能

### 智能数据提取
- 自动识别职位类型 (校招/社招/实习)
- 智能分类技术方向 (前端/后端/算法等)
- 自动生成内推码 (模拟真实场景)

### 用户友好设计
- 现代化Material Design风格
- 响应式布局，适配各种设备
- 直观的筛选和搜索功能
- 流畅的动画效果

### 可扩展架构
- 模块化爬虫设计，易于添加新平台
- 插件式前端组件，便于功能扩展
- 标准化数据格式，支持多种数据源

## 🔮 未来规划

- [ ] 添加更多招聘平台支持
- [ ] 实现用户收藏和关注功能
- [ ] 添加邮件/微信通知功能
- [ ] 支持数据库存储 (MySQL/PostgreSQL)
- [ ] 开发移动端App
- [ ] 添加数据分析和趋势图表

## 🤝 贡献指南

欢迎提交Issue和Pull Request来完善这个项目！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## ⚠️ 免责声明

本项目仅供学习和研究使用，请遵守各平台的使用条款和robots.txt规定。使用爬虫功能时请合理控制请求频率，避免对目标网站造成过大负担。

## 📞 联系我们

如有问题或建议，欢迎通过以下方式联系：

- 📧 Email: lvyovo01@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

⭐ 如果这个项目对您有帮助，请给一个Star支持一下！
Computer internal collection website
