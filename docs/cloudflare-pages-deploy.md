# ForMyLove · Cloudflare Pages 部署指南

> 本指南将带你使用 Cloudflare Pages 将 ForMyLove 静态告白页上线，覆盖 GitHub 仓库自动部署与 Direct Upload 两种方式。所有步骤均以简体中文撰写，并保留 Cloudflare 控制台中的英文按钮/字段名，方便对照操作。

## 1. 项目概览与部署前检查

- 代码结构（关键静态资源均位于仓库根目录）：

  ```text
  .
  ├─ index.html              # 唯一入口文件
  ├─ assets/
  │  ├─ css/                 # 样式（style.css）
  │  ├─ js/                  # 逻辑脚本（script.js，含配置对象）
  │  └─ audio/               # 背景音乐（love_song.mp3）
  ├─ README.md
  └─ LICENSE
  ```
- 站点完全由原生 HTML/CSS/JavaScript 构成，无需任何构建或打包流程。
- `index.html` 通过相对路径加载 `assets/...` 下的资源，天然兼容 Cloudflare Pages 提供的静态托管环境。
- 如需自定义文案、昵称或音乐，直接修改 `assets/js/script.js` 中的 `config` 对象或替换 `assets/audio/` 下的文件即可。

> ✅ 确认上述条件后即可开始部署，无需配置构建命令或依赖。

---

## 2. 方法一：连接 GitHub 仓库的自动化部署

### 2.1 前置条件
1. 一个可用的 Cloudflare 账户（已登录 dashboard）。
2. 一个 GitHub 账户，并 Fork 本仓库到自己的命名空间，例如 `github.com/<your-name>/ForMyLove`。
3. 可选：在本地 `git clone` 该 Fork 并进行个性化内容修改，推送到 `main` 分支。

### 2.2 在 Cloudflare Pages 创建项目

1. 登录 Cloudflare Dashboard，左侧导航选择 **Pages**，点击 **Create a project**。
2. 在弹窗中选择 **Connect to Git**（如首次使用会提示授权 GitHub，按向导完成 OAuth）。
3. 选中刚才 Fork 的仓库（如列表较长，可搜索 `ForMyLove`），确认分支为 `main`，然后进入构建配置。
4. 设置推荐参数：

   | 字段 (Cloudflare UI)  | 推荐值          | 说明 |
   | --------------------- | --------------- | ---- |
   | **Project name**      | 自定义（如 `formylove`） | 影响 `*.pages.dev` 域名 |
   | **Production branch** | `main`          | 保持默认即可 |
   | **Framework preset**  | `None`          | 纯静态站点，无框架优化 |
   | **Build command**     | （留空）        | 无需构建步骤 |
   | **Build output directory** | `.`       | 直接发布仓库根目录，`index.html` 位于根目录 |

5. 点击 **Save and Deploy**。部署状态会经历 `QUEUED → BUILDING → DEPLOYED`，首次构建通常在 1 分钟内完成。
6. 部署成功后，Cloudflare 会展示形如 `https://<project-name>.pages.dev` 的地址。访问该链接应能看到信封动画页面，即表示上线成功。
7. **触发重新部署**：
   - 每次向 GitHub 仓库的 `main`（或你指定的生产分支）推送代码，Cloudflare Pages 会自动检测并重新构建。
   - 如需手动重新触发，可在 Pages 项目详情里点击最新部署右侧的 `⋯ → Retry deployment`。

> 提示：如果看不到音频自动播放，请提醒访客点击信封后再听音乐——浏览器通常要求用户交互后才允许播放。

---

## 3. 方法二：Direct Upload 直接上传部署

适合没有 GitHub 集成、只想上传打包好的静态文件的场景。

### 3.1 打包站点文件
1. 在本地克隆或下载仓库：`git clone https://github.com/<your-name>/ForMyLove.git`。
2. 确保以下文件/文件夹全部包含在压缩包内：
   - `index.html`
   - `assets/css/`
   - `assets/js/`
   - `assets/audio/`（包含 `love_song.mp3` 等资源）
   - 任何你新增的图片、字体等静态文件
3. 使用任意压缩工具在仓库根目录执行压缩，例如：

   ```bash
   zip -r formylove-site.zip index.html assets
   ```

### 3.2 在 Cloudflare Pages 使用 Direct Upload
1. 打开 **Pages → Create a project**，这次选择 **Direct Upload**。
2. 输入项目名称（如 `formylove-direct`），点击 **Create project**。
3. 在“Upload assets”界面拖拽或选择刚才的 `formylove-site.zip`，等待上传结束后点击 **Deploy site**。
4. 完成后同样会获得一个 `*.pages.dev` 域名链接。

### 3.3 更新与重新上传
- 每次修改站点内容后，重新打包 `index.html` 与 `assets/` 文件夹。
- 进入该 Pages 项目，点击 **Upload new version**，上传新的 zip 包即可用新内容替换旧版本。

---

## 4. 绑定自定义域名（可选但推荐）
1. 进入 Pages 项目的 **Custom domains** 选项卡，点击 **Set up a custom domain**。
2. 输入你的域名（如 `love.yourdomain.com`）。
3. 如果域名已在 Cloudflare 托管，系统会自动添加一条指向 `<project-name>.pages.dev` 的 CNAME 记录；若未托管，需要在原 DNS 服务商处手动新增一条 CNAME：
   - `名称/Host`: 例如 `love`
   - `目标/Target`: `<project-name>.pages.dev`
4. DNS 生效后，在 Cloudflare Pages 中点击 **Activate domain**，状态变为 `Active` 即绑定完成。

---

## 5. 仓库专有注意事项
- **相对路径已就绪**：所有 CSS、JS、音频等资源都通过相对路径引用，只要保持目录层级不变，在 Pages 上即可正常加载。
- **音频体积较大**：`assets/audio/love_song.mp3` 约 2.3 MB，首次访问会有一定下载时间，建议网络环境良好或自行替换为更小文件。
- **互动触发动画与音乐**：页面交互依赖点击信封；如直接刷新页面后未点击将不会播放音乐或显示信件内容，属于正常行为。
- **个性化配置**：文字与署名由 `assets/js/script.js` 中的 `config` 对象控制，修改后提交或重新打包即可在 Pages 上生效。

按照以上任一方法操作，即可在 Cloudflare Pages 上快速、稳定地发布 ForMyLove 表白网页 🎉。
