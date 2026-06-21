# 菜谱合集 · Recipe Index

值得反复做的菜。慢慢攒，一道一道往里加。

A personal, hand-built collection of recipes — pure static HTML, no build step, no dependencies. Just open it in a browser.

## 在线浏览 · Getting started

打开 [`index.html`](index.html) 即可，它是所有菜谱的入口。

```bash
# 直接打开
open index.html

# 或起一个本地服务器（可选）
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

## 目录结构 · Structure

```
.
├── index.html                 # 首页：菜谱合集索引
└── beef-recipe/               # 牛肉类
    ├── low-and-slow-eye-of-round.html      # 慢烤牛眼肉 配蘑菇肉汁与焗薯泥
    └── mexican-shredded-beef-tacos.html    # 墨西哥手撕牛肉 配玉米饼
```

每个菜谱都是一个独立、自包含的 HTML 文件（样式内联，无外部依赖），按食材／类别分文件夹存放。

## 现有菜谱 · Recipes

| 菜谱 | 类别 | 时间 |
| --- | --- | --- |
| [慢烤牛眼肉 配蘑菇肉汁与焗薯泥](beef-recipe/low-and-slow-eye-of-round.html) | 牛肉 · 主菜 | 5–6h 慢烤 |
| [墨西哥手撕牛肉 配玉米饼](beef-recipe/mexican-shredded-beef-tacos.html) | 牛肉 · 墨西哥 | 3h 炖煮 |

## 新增菜谱 · Adding a recipe

1. 在合适的类别文件夹下新建一个 HTML 文件（没有合适的就新建一个，如 `chicken-recipe/`）。
2. 在 [`index.html`](index.html) 的 `.recipe-list` 里加一张卡片，链接到新文件，并更新顶部的菜谱计数。
3. 沿用现有页面的配色与排版（`:root` 里的 CSS 变量），保持风格统一。

## License

个人收藏，自用为主 · Personal collection, for home-kitchen use.
