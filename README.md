# ToMyBeloved
A romantic web confession page
# ToMyBeloved

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/project)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/)

> *一个表白的程序* 

## 📖 简介 (Introduction)

`ToMyBeloved是一个简单的表白工具，歌词和内容全部可以任你的心意发挥，祝大家有情人终成眷属！

## 🚀 部署指南

详见 [Cloudflare Pages 部署指南](docs/cloudflare-pages-deploy.md)。

## ✨ 在线管理后台（Cloudflare Workers + KV）

为了让非技术同学也能随时更新表白内容，仓库内置了一个简洁的后台：

- 访问地址：`/admin`
- 功能：登录后可修改昵称、正文段落、随机情话、时间线、署名、日期以及隐藏彩蛋文字，并支持增删/排序。
- 前端会在每次访问时调用 `GET /api/config`，实时加载最新配置；如果 KV 为空会自动写入 `data/default-config.json` 中的模板。

### 添加后台所需的 Cloudflare 资源

1. **启用 Pages Functions / Workers**：保持仓库目录结构不变，即可直接在 Cloudflare Pages 中启用 Functions（无需额外构建步骤）。
2. **KV Namespace**：在 Cloudflare Dashboard 中创建一个 KV（推荐命名 `FORMYLOVE_CONFIG`），并在 Pages 项目的 `Settings → Functions → KV namespace bindings` 里新增绑定，变量名填写 `FORMYLOVE_CONFIG`。
3. **管理员账号**：在 `Settings → Environment variables` 新增以下变量：
   - `ADMIN_USERNAME`：任意用户名，例如 `lover`。
   - `ADMIN_PASSWORD`：强烈建议使用 12 位以上复杂密码。
   - 可选 `SESSION_SECRET`：若填写，将用于加密后台会话，未填写时会 fallback 到管理员密码派生值。
4. **重新部署**：保存后重新部署 Pages 项目即可激活新的 API 与后台页面。

### 可用 API 一览

| Method | Path           | 说明                             |
| ------ | -------------- | -------------------------------- |
| GET    | `/api/config`  | 获取当前配置（前台与后台共用）。 |
| POST   | `/api/config`  | 更新配置，需先登录并携带会话。   |
| POST   | `/api/login`   | 使用 `ADMIN_USERNAME/PASSWORD` 登录。 |
| POST   | `/api/logout`  | 清理登录状态。                   |
| GET    | `/api/session` | 校验当前是否已登录。             |

> 🔐 会话通过 HttpOnly + Secure Cookie 维护，默认有效期 12 小时。若后台空闲太久再次保存提示未登录，只需重新登录一次即可。

### 扩展与自定义

- 所有默认文案集中在 `data/default-config.json`，也是 KV 为空时的初始化内容，可根据喜好修改。
- 如需新增字段，可同时在 `assets/js/script.js`（前台渲染）、`assets/js/admin.js`（后台表单）以及 `functions/_shared/validator.js`（后端校验）中扩展对应字段，三者保持一致即可。
- `relationshipStart` 需保持 `YYYY-MM-DD` 格式，以便前台正确计算在一起的天数。
