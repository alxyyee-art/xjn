# AI Eating Lab — 设计说明书

## 概述

AI Eating Lab 是一个"这顿吃什么"的 AI 推荐网页应用。用户选择餐段和多维偏好（可多选），DeepSeek 大模型一次生成 5 条不同风格的组合套餐推荐，支持复制、收藏、查看历史。当用户多选口味（如甜+咸），AI 会推荐甜咸搭配合理的组合餐（例如一道甜点 + 一道咸味主食），而非割裂的单品。

---

## 架构

```
浏览器 (Client)
  ├─ 偏好选择 → POST /api/recommend → DeepSeek API
  ├─ 推荐卡片展示
  ├─ 收藏/历史 → localStorage
  └─ 纯前端，无数据库

Next.js Server
  └─ /api/recommend (Route Handler)
       ├─ 读取 DEEPSEEK_API_KEY (仅服务端可访问)
       ├─ 构建 prompt
       ├─ 调用 DeepSeek Chat API
       └─ 返回 JSON
```

**关键决策：**
- API Key 仅存于 `.env.local`，API Route 在服务端运行，前端不暴露
- 历史/收藏存 `localStorage`，上限 50 条
- 一次 API 调用返回 5 条推荐

---

## API 设计

### POST /api/recommend

**请求体：**
```json
{
  "meal": "lunch",
  "tastes": ["sweet", "salty"],
  "budgets": ["value"],
  "cuisines": ["chinese", "japanese"],
  "custom": "想吃点开胃的"
}
```

字段说明（均支持多选，传数组）：
- `meal`: `breakfast` | `lunch` | `afternoon_tea` | `dinner` | `midnight_snack`（单选）
- `tastes`: 数组，可选值 `sweet` | `salty` | `spicy` | `light` | `heavy`，空数组 = 无所谓
- `budgets`: 数组，可选值 `premium` | `value`，空数组 = 无所谓
- `cuisines`: 数组，可选值 `chinese` | `western` | `japanese` | `southeast_asian`，空数组 = 无所谓
- `custom`: 用户自由输入，可为空

**多选语义：** 当用户选了多个口味（如甜+咸），AI 推荐的是一套**组合餐**——而非两个独立菜品。例如午饭选了甜+咸+性价比，AI 推荐：「红烧肉套餐 + 桂花糖藕」，有主菜有甜点，搭配合理。每条推荐是一个组合，不是单品。

**成功响应：**
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "style": "classic",
      "name": "豆浆油条套餐",
      "reason": "经典中式早餐搭配，蛋白质+碳水均衡...",
      "rating": 4.5,
      "comment": "30年老店的味道，永远不会错"
    }
  ],
  "generatedAt": "2026-05-28T10:30:00Z"
}
```

**错误响应：**
```json
{
  "error": "API_KEY_MISSING"
}
```

错误码：`API_KEY_MISSING` | `UPSTREAM_ERROR` | `INVALID_RESPONSE` | `RATE_LIMITED`

---

## 5 种风格标签

| 标签 | 标识 | 说明 |
|------|------|------|
| 经典稳妥 | `classic` | 不出错的大众选择 |
| 大胆尝鲜 | `adventurous` | 冷门但惊喜的搭配 |
| 健康轻食 | `healthy` | 低卡、营养均衡 |
| 碳水快乐 | `comfort` | 满足感拉满 |
| 惊喜盲盒 | `wildcard` | AI 自由发挥 |

---

## 页面结构（单页，无路由拆分）

```
┌──────────────────────────────────────────┐
│  Header: 🍽️ AI Eating Lab  [历史] [收藏]  │
├──────────────────────────────────────────┤
│  Step 1: 选餐段（5 个卡片式按钮，单选）     │
│  早饭 | 午饭 | 下午茶 | 晚饭 | 夜宵          │
├──────────────────────────────────────────┤
│  Step 2: 选偏好（每栏可多选，不选=无所谓）    │
│  口味: 甜 | 咸 | 辣 | 清淡 | 重口            │
│  价位: 贵 | 性价比                          │
│  菜系: 中餐 | 西餐 | 日料 | 东南亚           │
│  其他: [_____________]                    │
├──────────────────────────────────────────┤
│  [🔥 AI 推荐] CTA 按钮                     │
├──────────────────────────────────────────┤
│  结果区（生成后显示）                       │
│  5 张推荐卡片垂直排列，每张含：              │
│  - 风格标签                                │
│  - 推荐名称                                │
│  - 评分 (⭐ 1-5)                           │
│  - 推荐理由                                │
│  - 简评                                    │
│  - [复制] [收藏] 操作按钮                   │
├──────────────────────────────────────────┤
│  Powered by DeepSeek                      │
└──────────────────────────────────────────┘
```

### Modal/Drawer
- 历史记录列表：从右滑出，最近 50 条，点击可回顾
- 收藏列表：从右滑出，已收藏推荐

---

## 错误处理矩阵

| 场景 | 处理 |
|------|------|
| API Key 未配置 | 醒目的错误提示卡片，引导检查 `.env.local` |
| 网络/超时错误 | 提示 + 重试按钮 |
| 响应格式异常 | 兜底提示 + 建议换偏好 |
| 加载中 | 骨架屏 + 趣味 loading 文案轮播 |
| 空结果 | 建议调整偏好重试 |
| localStorage 满 | 超出 50 条自动淘汰最早记录 |
| 复制失败 | 降级到 prompt 手动复制 |

---

## 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Next.js 15 App Router |
| 样式 | Tailwind CSS 4 |
| 大模型 | DeepSeek (deepseek-chat), via OpenAI 兼容 SDK |
| 状态管理 | React useState + useReducer + 自定义 hooks |
| 存储 | localStorage |
| 字体 | 系统默认中文字体栈 |

---

## 组件树

```
App (layout.tsx)
└── HomePage
    ├── Header (logo + 历史/收藏图标按钮)
    ├── MealSelector (5 个餐段按钮)
    ├── PreferencePanel
    │   ├── TastePicker
    │   ├── BudgetPicker
    │   ├── CuisinePicker
    │   └── CustomInput
    ├── GenerateButton
    ├── RecommendationList
    │   └── RecommendationCard × 5
    │       ├── StyleBadge
    │       ├── StarRating
    │       └── ActionButtons (复制/收藏)
    ├── HistoryDrawer
    └── FavoritesDrawer
```

## 不使用

- 路由系统（纯单页）
- 数据库 / ORM
- 登录 / 认证
- 任何第三方组件库
