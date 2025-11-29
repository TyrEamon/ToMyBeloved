import { jsonResponse, errorResponse } from '../_shared/responses.js';
import { createSessionCookie } from '../_shared/auth.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) {
      return errorResponse(400, '请输入完整的用户名与密码。');
    }

    if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
      return errorResponse(500, '尚未在 Cloudflare 设置 ADMIN_USERNAME/ADMIN_PASSWORD 环境变量。');
    }

    if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
      return errorResponse(401, '用户名或密码不正确。');
    }

    const cookie = await createSessionCookie(username, env);
    return jsonResponse({ success: true }, { headers: { 'Set-Cookie': cookie } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse(400, '请求体必须是合法 JSON。');
    }
    console.error('登录接口报错：', error);
    return errorResponse(500, '登录失败，请稍后再试。');
  }
}
