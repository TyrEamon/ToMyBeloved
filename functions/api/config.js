import { jsonResponse, errorResponse } from '../_shared/responses.js';
import { readConfig, writeConfig } from '../_shared/storage.js';
import { requireAuth } from '../_shared/auth.js';
import { validateConfig } from '../_shared/validator.js';

// GET 负责给前台与后台读取配置，POST 用于后台保存，写入 KV
export async function onRequestGet({ env }) {
  try {
    const config = await readConfig(env);
    return jsonResponse(config, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('读取配置失败：', error);
    return errorResponse(500, '读取配置失败，请稍后重试。');
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const auth = await requireAuth(request, env);
    if (auth.response) return auth.response;

    const payload = await safeJson(request);
    if (payload === null) {
      return errorResponse(400, '请求体必须是合法的 JSON。');
    }

    const validation = validateConfig(payload);
    if (!validation.valid) {
      return errorResponse(400, validation.errors.join('；'));
    }

    const saved = await writeConfig(env, payload);
    return jsonResponse({ success: true, data: saved });
  } catch (error) {
    console.error('保存配置失败：', error);
    return errorResponse(500, '保存配置失败，请稍后重试。');
  }
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch (error) {
    console.warn('解析 JSON 失败：', error);
    return null;
  }
}
