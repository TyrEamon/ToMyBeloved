import { jsonResponse, errorResponse } from '../_shared/responses.js';
import { verifySession } from '../_shared/auth.js';

export async function onRequestGet({ request, env }) {
  try {
    const session = await verifySession(request, env);
    if (!session) {
      return errorResponse(401, '未登录');
    }
    return jsonResponse({ ok: true, exp: session.exp });
  } catch (error) {
    console.error('校验会话失败：', error);
    return errorResponse(500, '无法校验当前会话，请稍后再试。');
  }
}
