# 菜谱合集 · Recipes

值得反复做的菜。慢慢攒，一道一道往里加。

线上地址：[recipes.maxoxo.me](https://recipes.maxoxo.me)

一个纯静态的中文菜谱合集——无构建步骤、无依赖、无框架。每道菜是一个独立 HTML 页面，按食材主类别分文件夹存放，统一风格、统一样式表。

## 特色

- **27 道菜谱**，覆盖牛 / 鸡 / 猪 / 羊 / 鱼海鲜五大类。
- **每道菜两个实用视角**（页面底部并排显示）：
  - 💪 **健身视角** —— 宏量营养判断（热量 / 蛋白 / 脂肪 / 碳水），落在「日常 vs 偶尔」维度，不简单贴「能不能吃」的标签。
  - 🥡 **备餐友好度** —— 能否一次做、冷藏 / 冷冻、分批吃，附保存时间速查。
- **统一的页面结构**：食材清单、分阶段步骤、厨房备忘、出处署名。
- 索引页带分类标签和健身 / 备餐小标签，一眼挑菜。
- 适配打印；窄屏自适应。
- 菜谱改编自 RecipeTin Eats、Adam Ragusea、Julia Child 等公开来源，每页页脚均注明出处链接。

## 目录结构

```
.
├── index.html          菜谱索引（首页，自带内嵌样式）
├── styles.css          全局共用样式（所有菜谱页链接它）
├── AGENT.md            给 AI / 维护者的开发规范
├── README.md           本文件
├── beef/               牛肉（7）
├── chicken/            鸡肉（12）
├── pork/               猪肉（3）
├── lamb/               羊肉（2）
└── seafood/            鱼 / 海鲜（3）
```

每个菜谱页深度固定为一层，文件名用英文 kebab-case 对应菜名（如 `beef/beef-tataki.html`）。

## 菜谱一览

### 🥩 牛肉 beef
- 慢烤牛眼肉 配蘑菇肉汁与焗薯泥（Adam Ragusea）
- 墨西哥手撕牛肉 配玉米饼
- 勃艮第红酒炖牛肉 Boeuf Bourguignon（Julia Child，附四个版本变体对照）
- 慢烤牛臀盖 Picanha 配酱
- 牛肉 Tataki 配柚子汁
- 腌烤牛肉 Marinated Roast Beef
- 烤牛里脊 配奶油蘑菇酱

### 🍗 鸡肉 chicken
- 法式猎人鸡 Chicken Chasseur
- 意式猎人炖鸡 Chicken Cacciatore
- 非洲椰香咖喱鸡 Kuku Paka
- 一锅墨西哥鸡肉饭
- 一锅鸡肉时蔬饭
- 慢炖锅墨西哥鸡肉汤
- 鸡肉羽衣甘蓝沙拉 配芝麻酱
- 多汁烤鸡胸
- 中东鸡肉沙威玛 Shawarma
- 泰式烤鸡 Gai Yang
- 墨西哥手撕鸡 Shredded Chicken
- 万无一失多汁水煮鸡胸

### 🐖 猪肉 pork
- 菲律宾猪肉 Adobo
- 极致手撕猪肉 Pulled Pork
- 蜂蜜蒜香猪柳

### 🐑 羊肉 lamb
- 玛莎曼咖喱羊肩
- 12 小时慢烤羊肩

### 🐟 鱼 / 海鲜 seafood
- 柠檬蒜香三文鱼烤盘
- 牙买加 Jerk 香料煎鱼
- 脆皮煎鱼 Crispy Skin Fish

## 本地预览

纯静态站点，无需构建或服务器。直接用浏览器打开 `index.html` 即可。

如需本地起一个服务器（避免某些浏览器对 `file://` 的限制）：

```bash
# Python
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

## 添加新菜谱

简要流程（完整规范见 [AGENT.md](AGENT.md)）：

1. 复制一个同类现有页面作模板，放进对应类别文件夹。
2. `<head>` 链接全局样式 `<link rel="stylesheet" href="../styles.css">`，**不要内嵌 `<style>`**。
3. 顶部加返回链接 `<a class="back" href="../index.html">`。
4. 按既有结构填内容，底部保留健身 + 备餐双视角模块，页脚保留原始出处链接。
5. 更新 `index.html`：计数加一、必要时加分类标签、新增一张卡片（链接指向 `类别/文件.html`）。

## 设计约定

- 样式集中在根目录 `styles.css`，配色用 CSS 变量，不引入外部字体 / CDN / JS 库。
- 全中文，专有名词保留英文（Picanha、Gai Yang、Shawarma 等）。
- 温度同时标注摄氏与华氏。

## 致谢

所有菜谱归功于原作者，本项目仅作个人整理与中文改写，并在每页注明出处。
