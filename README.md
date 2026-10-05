# 菜谱合集 · Recipes

值得反复做的菜。慢慢攒，一道一道往里加。

线上地址：[recipes.maxoxo.me](https://recipes.maxoxo.me)

一个纯静态的中文菜谱合集——无构建步骤、无依赖、无框架。每道菜是一个独立 HTML 页面，按食材主类别分文件夹存放，统一风格、统一样式表。

## 特色

- **48 道菜谱**，覆盖牛 / 鸡 / 猪 / 羊 / 鱼海鲜 / 蔬菜六大类。
- **每道菜两个实用视角**（页面底部并排显示）：
  - 💪 **健身视角** —— 宏量营养判断（热量 / 蛋白 / 脂肪 / 碳水），落在「日常 vs 偶尔」维度，不简单贴「能不能吃」的标签。
  - 🥡 **备餐友好度** —— 能否一次做、冷藏 / 冷冻、分批吃，附保存时间速查。
- **统一的页面结构**：食材清单、分阶段步骤、厨房备忘、出处署名。
- 索引页带分类标签和健身 / 备餐小标签，一眼挑菜。
- 适配打印；窄屏自适应。
- **可安装、可离线阅读**：首次联网打开会自动保存全部菜谱；看到「已保存」后，没网也能筛选、打开和阅读尚未浏览过的菜谱。
- 菜谱改编自 RecipeTin Eats、Adam Ragusea、Julia Child 等公开来源，也收录家庭做法讨论；每页页脚注明出处，公开来源附链接。

## 目录结构

```
.
├── index.html          菜谱索引（首页，自带内嵌样式）
├── styles.css          全局共用样式（所有菜谱页链接它）
├── AGENT.md            给 AI / 维护者的开发规范
├── README.md           本文件
├── beef/               牛肉（13）
├── chicken/            鸡肉（18）
├── pork/               猪肉（6）
├── lamb/               羊肉（2）
├── seafood/            鱼 / 海鲜（7）
└── vegetable/          蔬菜（2）
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
- 巨无霸风味高蛋白便当碗
- 西兰花牛肉快炒饭（Chef Jack Ovens，中式快炒备餐）
- 照烧海鲜酱牛肉备餐碗（Chef Jack Ovens，中式快炒备餐）
- 黑椒牛肉奶油意面（Chef Jack Ovens，意式融合备餐）
- 担担风味牛肉拌面（Chef Jack Ovens，川味融合备餐）
- 蜂蜜BBQ牛肉汉堡备餐（Chef Jack Ovens，美式快手即食备餐）

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
- 香煎蘑菇鸡肉高蛋白意面（Chef Jack Ovens，高蛋白备餐意面）
- 奇波雷鸡肉配烟熏番茄饭（Chef Jack Ovens，墨西哥分层备餐碗）
- 糖醋鸡肉备餐饭（Chef Jack Ovens，中式快炒备餐）
- 仁当咖喱鸡备餐饭（Chef Jack Ovens，印尼风味浓郁咖喱）
- 墨西哥风味早餐备餐碗（Chef Jack Ovens，早餐高蛋白备餐）
- 奶油鸡肉土豆焗烤备餐（Chef Jack Ovens，法式家常焗烤）

### 🐖 猪肉 pork
- 台式卤肉饭
- 榄菜肉末四季豆（橄榄菜肉末豆角；Martin’s Cuisine 马蹄厨房，家庭焯炒法）
- 菲律宾猪肉 Adobo
- 极致手撕猪肉 Pulled Pork
- 蜂蜜蒜香猪柳
- 西班牙辣肠鸡蛋马芬（Chef Jack Ovens，早餐即食备餐）

### 🐑 羊肉 lamb
- 玛莎曼咖喱羊肩
- 12 小时慢烤羊肩

### 🐟 鱼 / 海鲜 seafood
- XO 酱炒饭（Martin’s Cuisine 马蹄厨房；依据预览图与字幕整理，配料用量未标）
- 潮汕沙茶炒三鲜（牛肉、鱿鱼、虾仁；2026 年 9 月 26 日家庭做法讨论）
- 柠檬蒜香三文鱼烤盘
- 牙买加 Jerk 香料煎鱼
- 脆皮煎鱼 Crispy Skin Fish
- 脆皮煎白鱼 法粤融合
- 清蒸鱿鱼 葱油豉香

### 🥬 蔬菜 vegetable
- 绿豆芽两吃 清炒 · 肉丝炒
- 豌豆尖三吃 蒜蓉 · 炝炒 · 炝拌

## 本地预览

纯静态站点，无需构建或服务器。直接用浏览器打开 `index.html` 即可。

如需本地起一个服务器（避免某些浏览器对 `file://` 的限制）：

```bash
# Python
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

离线保存和安装需要 HTTPS 或 `localhost`，直接打开 `file://` 只能预览页面。

## 离线阅读与安装

1. 联网访问 [recipes.maxoxo.me](https://recipes.maxoxo.me)，保持页面打开，等状态显示「已保存 48 道菜谱，可离线阅读」。从任意菜谱页打开也会保存整个合集。
2. iPhone / iPad：在 Safari 分享菜单中选择「添加到主屏幕」，如有「作为网页 App 打开」选项，请开启。Android / 电脑：点击出现的「安装菜谱合集」按钮，或使用浏览器菜单中的安装选项。
3. 无网络时打开主屏幕上的菜谱合集或浏览器中原来的地址，即可筛选和阅读全部已保存的菜谱。不安装也可以离线阅读。

下次联网打开会自动检查新版；完整保存成功后才切换版本，下载失败会保留旧版。原始出处链接仍需网络。清除网站数据或浏览器回收存储空间后，需要联网重新保存。

页面没有显示最新内容时，可点击「刷新菜谱」，或滚动到页面顶部后下拉约 100 像素并松手。联网时会先检查更新，等新版完整保存并启用后重新载入当前页面；离线时重新载入已保存的内容。刷新失败会提示重试，并保留当前页面和已有离线菜谱。首页和每道菜谱页都支持刷新。

站点仍是纯静态 HTML / CSS / JS，部署不需要构建步骤。`manifest.webmanifest` 定义安装信息，`pwa.js` 显示离线状态与安装帮助，`sw.js` 保存所有菜谱及本地资源；不使用外部库或 CDN。

更新任何页面、样式、脚本或图标后，请同步离线清单和内容版本，并一起提交 `sw.js`：

```bash
python3 scripts/update-offline.py
python3 scripts/update-offline.py --check
node --test tests/*.test.cjs
```

清单由全部 `类别/*.html` 和共用资源自动生成。`scripts/sw-template.js` 是 service worker 的维护源文件；请修改它而非直接修改生成的 `sw.js`。

## 食材导入 Apple 提醒事项

每道菜的食材区有「加入 Apple 提醒事项」按钮。以菜名创建一个父任务，页面中的每行食材各创建一个子任务，保留分组、用量和可选说明，父任务附菜谱链接。再次导入会创建一组新任务，不合并已有提醒事项。

首次使用（iPhone / iPad / Mac）：

1. 展开「首次使用 · 安装快捷指令」，下载并打开文件，添加「菜谱食材加入提醒事项」，保留这个名称。
2. 在快捷指令的第一个「添加新提醒事项」动作中，选择支持子任务的 iCloud 清单。子任务自动继承该清单；Exchange 等账户可能不支持子任务。
3. 回到菜谱页点击按钮，按系统询问允许快捷指令将食材添加到提醒事项。选择「始终允许」后，后续无需反复授权。浏览器也可能询问是否打开快捷指令。
4. 完成后会显示「已加入提醒事项」。在提醒事项中打开菜名任务，即可逐项勾选。

网页通过 Apple 官方的 [Shortcuts URL scheme](https://support.apple.com/guide/shortcuts/apd624386f42/ios) 传入食材，不能自行确认系统写入结果；网页只显示正在打开快捷指令。未安装、取消授权或其他运行错误由快捷指令提示。其他平台可使用「复制食材清单」。网站不上传食材或读取已有提醒事项；导入使用本机快捷指令和所选提醒事项账户。

快捷指令安装文件与网页脚本都包含在离线缓存中。首次下载系统验证及提醒事项跨设备同步可能需要网络；已安装后可以从离线菜谱运行。

维护快捷指令时，修改 `scripts/create-reminder-shortcut.py` 并在 Mac 上执行 `python3 scripts/create-reminder-shortcut.py`。该脚本使用 Apple 的 `shortcuts sign --mode anyone` 生成可安装文件，Apple 会验证副本，不包含维护者的清单 ID 或联系人信息；部署网站无需运行该脚本。随后重新生成 `sw.js`，运行完整测试。

## 添加新菜谱

简要流程（完整规范见 [AGENT.md](AGENT.md)）：

1. 复制一个同类现有页面作模板，放进对应类别文件夹。
2. `<head>` 链接全局样式 `<link rel="stylesheet" href="../styles.css">`，**不要内嵌 `<style>`**。
3. 顶部加返回链接 `<a class="back" href="../index.html">`。
4. 按既有结构填内容，底部保留健身 + 备餐双视角模块，页脚保留原始出处链接。
5. 更新 `index.html`：计数加一、必要时加分类标签、新增一张卡片（链接指向 `类别/文件.html`）。
6. 保留页面 `<head>` 内的 manifest、图标、`pwa.css` 和 `pwa.js` 引用，运行 `python3 scripts/update-offline.py`，把新菜谱纳入离线合集。

## 设计约定

- 样式集中在根目录 `styles.css`，配色用 CSS 变量，不引入外部字体 / CDN / JS 库。
- 全中文，专有名词保留英文（Picanha、Gai Yang、Shawarma 等）。
- 温度同时标注摄氏与华氏。

## 致谢

所有菜谱归功于原作者，本项目仅作个人整理与中文改写，并在每页注明出处。
