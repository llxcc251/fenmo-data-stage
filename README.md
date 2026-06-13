# 粉墨数据台 — 京剧数据集沉浸式可视化系统

基于 1473 部京剧剧本数据，构建的"数字戏台"沉浸式可视化系统。

## 技术栈

- 前端：React + Vite + Tailwind CSS + ECharts + Zustand
- 后端：Flask (Python)

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

Vite 运行在 http://localhost:5173

## 页面

- 数据总览 — 统计卡片 + 朝代/题材分布图
- 角色之相 — 行当饼图 + 子类柱状图
- 声腔之流 — 声腔统计 + 桑基流向图
- 剧目之脉 — 搜索 + 分类筛选
- 传承之路 — 时代趋势 + 来源分布
- 脸谱生成 — 角色选择 → SVG 脸谱
