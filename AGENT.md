# AGENT.md — 菜谱合集项目维护指南

本文件写给后续维护本项目的 AI Agent / 开发者。修改本项目前请先通读，遵守以下规范，保持结构与风格统一。

## 项目是什么

一个纯静态的中文菜谱合集网站，无构建步骤、无依赖、无 JavaScript 框架。
入口是根目录的 `index.html`（菜谱索引），每道菜是一个独立的 HTML 页面，按食材主类别分文件夹存放。
所有菜谱改编自 RecipeTin Eats、Adam Ragusea、Julia Child 等公开来源，页脚均注明出处链接。

## 目录结构

```
recipes_site/
├── index.html          ← 菜谱索引（首页），自带内嵌 <style>（卡片/标签样式，与菜谱页不同）
├── styles.css          ← 全局共用样式，所有菜谱页都链接它
├── AGENT.md            ← 本文件
├── beef/               ← 牛肉
├── chicken/            ← 鸡肉
├── pork/               ← 猪肉
├── lamb/               ← 羊肉
└── seafood/            ← 鱼 / 海鲜
```

- 菜谱页都在「某个类别文件夹」里，深度固定为一层。
- 文件名用英文 kebab-case，对应菜名（如 `beef/beef-tataki.html`）。

## 添加一道新菜谱

1. **确定类别**，放进对应文件夹（`beef`/`chicken`/`pork`/`lamb`/`seafood`）。没有合适类别时再新建文件夹，并在 index 的标签和（如需要）说明里同步。
2. **复制一个同类现有页面作模板**，改内容即可。新页面必做三件事：
   - `<head>` 里链接全局样式：`<link rel="stylesheet" href="../styles.css">`（注意是 `../`，因为页面在子文件夹里）
   - 顶部返回链接：`<a class="back" href="../index.html">← 返回菜谱合集</a>`
   - **不要内嵌 `<style>`**。所有样式都在 `styles.css` 里。若某页确实需要独有样式（极少见），把通用部分留在 `styles.css`，把独有类加进 `styles.css` 并注明用途（见下方「全局样式」）。
3. **页面结构**（class 名固定，已由 styles.css 定义，照搬即可）：
   - `header.hero`：`.eyebrow` / `h1.title`（可含 `.accent`）/ `.subtitle` / `.meta-strip`（内含若干 `.meta-item` > `.k`+`.v`）/ `.credit`（含出处链接）
   - `.body-grid`：左 `aside.ingredients`（若干 `.ing-block` > `.ing-head` + `ul.ing-list`），右 `main.steps`（若干 `.phase` > `.phase-tag` + `h2` + `.note` + `ol.step-list`）
   - `section.tips`：`h2` + `.lead` + `.tip-grid`（若干 `.tip`）
   - `.lens-row`：两栏 —— `section.fitness`（健身视角）+ `section.prep`（备餐友好度），见下方「双视角模块」
   - `footer.foot`：出处链接
4. **更新 `index.html`**：
   - 顶部计数 `<div class="count"><b>N</b> 道菜谱</div>` 加一
   - 如有新类别/菜系，在 `.tags` 里加 `.tag-pill`
   - 在 `<ul class="recipe-list">` 里加一张 `.recipe-card`，`href` 指向 `类别/文件名.html`，包含 emoji、`.r-kicker`、`h2`、`.r-desc`，以及两个 `.r-tags`（健身 + 备餐标签，class 见下）

## 全局样式（styles.css）

- 所有菜谱页共用根目录 `styles.css`，**改样式只改这一个文件**，会影响全部菜谱页。
- 配色用 CSS 变量（`:root` 里）：`--paper`、`--ink`、`--rust`、`--olive`、`--gold`、`--teal`、`--line` 等。新样式尽量复用变量，不要硬编码颜色。
- 字体：标题用 `--serif`，正文用 `--sans`，已定义好，别引入外部字体（CSP 会拦截）。
- 文件里带注释标明了哪些样式是个别页面专用（如 `.alt*` / `.bonus*` 仅勃艮第炖牛肉的"变体标记"和"四个版本速览"用），新增专用样式时也请加注释说明用途。
- `index.html` 目前自带内嵌 `<style>`（卡片网格、标签等首页专属样式），与菜谱页样式不同，**刻意不共用**。若要改首页外观，改 index 内嵌样式。

## 双视角模块（每道菜底部必备）

每道菜谱页底部有一个 `.lens-row`，并排两个评估卡片，措辞避免简单的"适合/不适合"，而是落在"日常 vs 偶尔""能否批量备餐"的维度：

- **`section.fitness`（💪 健身视角）**：宏量营养判断。徽章 class：
  - `.lens-verdict`（默认金色）/ `.lens-verdict.lean`（橄榄绿=很友好）/ `.lens-verdict.rich`（红色=偏丰盛）
  - 有营养数据时放 `.macro-row`（4 个 `.macro` > `.mv`+`.mk`：热量/蛋白/脂肪/碳水）
  - 数据来自原菜谱营养表，结尾用 `.micro` 注明来源「仅供参考」
- **`section.prep`（🥡 备餐友好度）**：能否一次做、冷藏/冷冻、分批吃。徽章 `.lens-verdict`（青绿，默认）/ `.lens-verdict.low`（红色=不适合批量、现做现吃）。
  - 用 `.prep-facts`（若干 `li` > `.pk`+`.pv`）列保存时间速查（冷藏/冷冻/复热/风味变化）。

index 卡片上的对应小标签用 `.r-tag.fit`（可加 `.mid` 琥珀色）和 `.r-tag.prep`（可加 `.low` 红色），与详情页徽章颜色语义一致。

## 写作与内容规范

- 全中文，专有名词保留英文（如 Picanha、Gai Yang、Shawarma）。
- 步骤分阶段（`.phase`），每阶段一句 `.note` 点出关键，`ol.step-list` 列步骤，关键动作/温度用 `<b>` 或 `.temp` 高亮。
- 温度同时给摄氏和华氏。
- 「厨房备忘」`.tip` 收原作者的实用提示。
- 页脚务必保留**原始出处链接**，不要去掉署名。

## 沙盒/环境注意

- 纯静态站点，直接用浏览器打开 `index.html` 即可预览，无需服务器或构建。
- 不要引入外部 CDN、字体、JS 库（演示环境的 CSP 会静默拦截）。少量交互（如勃艮第页的变体展开）用内联原生 JS，写在该页 `<body>` 末尾的 `<script>` 里。
- 编辑后若用上传工具预览，记得指向根目录 `recipes_site/`。

## 维护检查清单

修改后自查：
- [ ] 新页面链接的是 `../styles.css`，没有内嵌 `<style>`
- [ ] 返回链接是 `../index.html`
- [ ] index 计数、标签、卡片链接（指向 `类别/文件.html`）都已更新
- [ ] 健身 + 备餐双模块都在，措辞落在"日常 vs 偶尔/能否备餐"维度
- [ ] 页脚保留原始出处链接
- [ ] 没有引入外部依赖
