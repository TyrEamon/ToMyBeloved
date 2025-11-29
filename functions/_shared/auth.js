import { errorResponse } from './responses.js';

const SESSION_COOKIE = 'FML_SESSION';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 小时的管理会话
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function createSessionCookie(username, env) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = { username, exp: expiresAt };
  const token = await signPayload(payload, env);
  return serializeCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: SESSION_TTL_MS / 1000,
    expires: new Date(expiresAt)
  });
}

export function destroySessionCookie() {
  return serializeCookie(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 0,
    expires: new Date(0)
  });
}

export async function verifySession(request, env) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = parseCookies(cookieHeader);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return verifyToken(token, env);
}

export async function requireAuth(request, env) {
  const session = await verifySession(request, env);
  if (!session) {
    return { response: errorResponse(401, '需要登录后才能修改配置。') };
  }
  return { session };
}

async function signPayload(payload, env) {
  const payloadString = JSON.stringify(payload);
  const payloadB64 = encodeBase64(payloadString);
  const secret = getSecret(env);
  const key = await getKey(secret);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const signature = bufferToBase64(signatureBuffer);
  return `${payloadB64}.${signature}`;
}

async function verifyToken(token, env) {
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;
  const secret = getSecret(env);
  const key = await getKey(secret);
  const expected = bufferToBase64(await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64)));
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(decodeBase64(payloadB64));
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (error) {
    console.warn('解析会话失败：', error);
    return null;
  }
}

function parseCookies(header) {
  return header.split(';').reduce((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join('=') || '');
    return acc;
  }, {});
}

function serializeCookie(name, value, options = {}) {
  const segments = [`${name}=${encodeURIComponent(value || '')}`, 'Path=/'];
  if (options.maxAge !== undefined) {
    segments.push(`Max-Age=${options.maxAge}`);
  }
  if (options.expires) {
    segments.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.httpOnly) segments.push('HttpOnly');
  if (options.secure) segments.push('Secure');
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`);
  return segments.join('; ');
}

function encodeBase64(text) {
  const bytes = encoder.encode(text);
  let binary = '';
  bytes.forEach(char => {
    binary += String.fromCharCode(char);
  });
  return btoa(binary);
}

function decodeBase64(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return decoder.decode(bytes);
}

async function getKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function getSecret(env) {
  if (env?.SESSION_SECRET) return env.SESSION_SECRET;
  if (env?.ADMIN_PASSWORD) {
    return `${env.ADMIN_USERNAME || 'admin'}:${env.ADMIN_PASSWORD}`;
  }
  throw new Error('请在 Cloudflare 中设置 SESSION_SECRET 或 ADMIN_PASSWORD 用于签名会话。');
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(char => {
    binary += String.fromCharCode(char);
  });
  return btoa(binary);
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
