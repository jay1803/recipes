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

- 食材数量未知时统一写「适量」，详见 [AGENTS.md 的食材数量规则](AGENTS.md#食材数量)。
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

### 离线 Web App

- 所有首页 / 菜谱页 `<head>` 保留相对路径引用：`manifest.webmanifest`、`icons/apple-touch-icon.png`、`pwa.css`、带 `defer` 的 `pwa.js`，以及 `theme-color`。
- 新增菜谱、修改页面 / CSS / JS / 图标后，运行 `python3 scripts/update-offline.py`，一起提交生成的 `sw.js`。`python3 scripts/update-offline.py --check` 可验证清单和版本没有过期。
- Service worker 逻辑维护在 `scripts/sw-template.js`，不要直接改生成文件；每版自动保存整个合集，全部成功后才切换，不依赖用户逐页访问。
- 离线 / 安装 UI 的共用样式放在 `pwa.css`，保留中文提示、打印隐藏和真实缓存完成状态。离线功能测试用 HTTP localhost / HTTPS，`file://` 不支持。
- 运行 `node --test tests/*.test.cjs` 验证离线、更新与刷新行为。

修改后自查：
- [ ] 新页面链接的是 `../styles.css`，没有内嵌 `<style>`
- [ ] 返回链接是 `../index.html`
- [ ] index 计数、标签、卡片链接（指向 `类别/文件.html`）都已更新
- [ ] 健身 + 备餐双模块都在，措辞落在"日常 vs 偶尔/能否备餐"维度
- [ ] 页脚保留原始出处链接
- [ ] 没有引入外部依赖

## 公共步骤维护

- 公共步骤放在 `techniques/`，入口为 `techniques/index.html`，复用 `styles.css` 和离线 Web App 元数据，不添加食材导出按钮或菜谱专属双视角模块。
- 公共页供编写菜谱参考，不在菜谱步骤中要求读者跳转。共同操作的维护源为 `techniques/steps.json`；菜谱的 `<!-- preparation: {"method":"...","params":{...}} -->` 与 `<!-- /preparation -->` 注释间由 `scripts/preparations.py` 生成完整 `<li>`。读者、打印和离线阅读直接使用已提交 HTML。
- 新菜谱复用已有方法和本菜参数，不重新手写共同操作。添加、省略、替换材料、等待时间与操作顺序差异写进注释参数；参数是普通文字，生成时自动转义。不得把某道菜的比例或熟度升级成通用默认值，也不要直接编辑生成块内的步骤。
- 牛肉的加油版与小苏打版、猪肉的肉丝版与肉末版分别维护。数量未知写“适量”，不编造比例、腌制时间或来源信息。虾仁清淡家常腌法注明家庭补充，不冒充原视频或原讨论配方。
- 完整食材和用量保留在各菜谱的 `.ing-list`，食材导出仍读取本页；各菜谱原始出处保持不变。公共页注明适用菜谱并链接回去。
- 新增公共页时更新供维护者参考的公共步骤索引，不添加首页入口或菜谱卡片、不增加菜谱计数。`python3 scripts/update-offline.py` 先同步公共步骤，再生成离线清单；`--check` 检查两者是否过期。运行生成、`--check` 与完整 `node --test tests/*.test.cjs`。
