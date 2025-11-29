export function jsonResponse(data, init = {}) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });

  if (init.headers) {
    for (const [key, value] of Object.entries(init.headers)) {
      headers.set(key, value);
    }
  }

  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}

export function errorResponse(status = 500, message = '服务器开小差了，请稍后再试。') {
  return jsonResponse({ error: message }, { status });
}
