import { jsonResponse } from '../_shared/responses.js';
import { destroySessionCookie } from '../_shared/auth.js';

export async function onRequestPost() {
  const cookie = destroySessionCookie();
  return jsonResponse({ success: true }, { headers: { 'Set-Cookie': cookie } });
}
