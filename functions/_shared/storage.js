import { DEFAULT_CONFIG, cloneDefaultConfig } from './defaultConfig.js';
import { sanitizeConfig } from './validator.js';

const KV_KEY = 'FORMYLOVE_CONFIG';

export async function readConfig(env) {
  const kv = getNamespace(env);
  const stored = await kv.get(KV_KEY);
  if (!stored) {
    const fallback = sanitizeConfig(DEFAULT_CONFIG);
    await kv.put(KV_KEY, JSON.stringify(fallback));
    return cloneConfig(fallback);
  }

  try {
    const parsed = JSON.parse(stored);
    return sanitizeConfig(parsed);
  } catch (error) {
    console.warn('KV 中的配置解析失败，即将重置为默认值。', error);
    const fallback = sanitizeConfig(DEFAULT_CONFIG);
    await kv.put(KV_KEY, JSON.stringify(fallback));
    return cloneConfig(fallback);
  }
}

export async function writeConfig(env, config) {
  const kv = getNamespace(env);
  const sanitized = sanitizeConfig(config);
  await kv.put(KV_KEY, JSON.stringify(sanitized));
  return sanitized;
}

function getNamespace(env) {
  if (!env?.FORMYLOVE_CONFIG) {
    throw new Error('未绑定 Cloudflare KV：FORMYLOVE_CONFIG');
  }
  return env.FORMYLOVE_CONFIG;
}

function cloneConfig(config) {
  return JSON.parse(JSON.stringify(config ?? cloneDefaultConfig()));
}
