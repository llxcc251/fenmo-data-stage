# 粉墨数据台 — 京剧数据集沉浸式可视化系统

基于 1473 部京剧剧本数据，构建的"数字戏台"沉浸式可视化系统。  
中山大学 · 智能工程学院 · 《可视化与可视分析》课程项目

## 技术栈

| 技术 | 用途 |
|------|------|
| **React 18 + Vite 5** | 前端框架 |
| **Tailwind CSS 3** | 样式与主题（京剧暗色舞台风格） |
| **Flask 3.0** | 后端 REST API |
| **ECharts 5** | 统计图表（饼图/柱状图/桑基图/旭日图） |
| **D3.js 7** | 力导向关系图（Force-Directed Graph） |
| **Zustand** | 前端状态管理 |
| **Framer Motion** | 页面入场动画 |
| **Python + PyMuPDF** | PDF 数据提取与清洗 |

## 可视化技术（课程应用）

本项目中应用的《可视化与可视分析》课程技术：

| 技术 | 课程章节 | 页面 | 说明 |
|------|----------|------|------|
| **D3 力导向图** | 第5-6周 D3.js + 第14周 图结构可视化 | `/roles` 角色之相 | 角色同现关系网络：节点=角色、边=共同出演，支持拖拽/缩放/悬停高亮 |
| **Sunburst 旭日图** | 第13周 层次数据可视化 | `/roles` 角色之相 | 行当层级展示（生旦净丑 → 子类），支持点击钻取 |
| **交互式时间序列** | 第11周 时间数据可视化 + 第7周 颜色与交互 | `/heritage` 传承之路 | 朝代趋势折线图 + 滑块刷选，联动过滤下方图表 |
| **视觉编码** | 第3章 基本的数据可视化 | 全局 | 颜色映射（行当→色相）、节点大小编码（参演数→面积） |
| **颜色与交互** | 第7章 颜色与交互 | 全局 | 暗色舞台配色方案、tooltip、筛选联动、悬停高亮 |

## 页面

- **首页**（`/`）— "开戏"舞台开场，Framer Motion 逐层显现动画
- **数据总览**（`/overview`）— 6 统计卡片 + 朝代柱状图 + 题材饼图
- **角色之相**（`/roles`）— 行当饼图 + Sunburst 层级图 + **D3 力导向关系网络**（角色同现分析）
- **声腔之流**（`/melody`）— 声腔统计卡片 + 桑基流向图
- **剧目之脉**（`/plays`）— 搜索 + 分类筛选 + 剧目卡片列表
- **传承之路**（`/heritage`）— **交互式朝代趋势线图**（滑块刷选联动）+ 来源饼图 + 流派列表
- **脸谱生成**（`/face-generator`）— 角色选择 → SVG 脸谱 + 颜色寓意图例

## 数据

1473 个京剧剧本，提取为结构化 JSON：

- **plays.json** — 1473 剧目（id, title, dynasty, genres, roles, melodies, plot 等）
- **roles.json** — 3576 角色（name, type, category, faceColor, plays[]）
- **melodies.json** — 10 种声腔（name, patterns[], plays[]）
- **relations.json** — 7876 条角色-剧目关系（用于力导向图）

## 开发

### 1. 启动后端

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Flask 运行在 http://localhost:5000

### 2. 启动前端

新开一个终端：

```bash
cd frontend
npm install
npm run dev
```

Vite 运行在 http://localhost:5173（自动代理 `/api` → 后端）
