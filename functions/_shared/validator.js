import { DEFAULT_CONFIG } from './defaultConfig.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function sanitizeConfig(input = {}) {
  const nickname = pickRequiredString(input.nickname, DEFAULT_CONFIG.nickname);
  const signature = pickRequiredString(input.signature, DEFAULT_CONFIG.signature);
  const relationshipStart = sanitizeDateString(input.relationshipStart, DEFAULT_CONFIG.relationshipStart);

  return {
    nickname,
    texts: sanitizeTextList(input.texts, DEFAULT_CONFIG.texts, { requireOne: true }),
    signature,
    date: pickOptionalString(input.date, DEFAULT_CONFIG.date),
    relationshipStart,
    timeline: sanitizeTimeline(input.timeline),
    loveMessages: sanitizeTextList(input.loveMessages, DEFAULT_CONFIG.loveMessages, { requireOne: false }),
    secretMessage: pickOptionalString(input.secretMessage, DEFAULT_CONFIG.secretMessage)
  };
}

export function validateConfig(input = {}) {
  const errors = [];

  if (!pickRequiredString(input.nickname)) {
    errors.push('昵称不能为空');
  }

  const texts = sanitizeTextList(input.texts, [], { requireOne: false });
  if (!texts.length) {
    errors.push('正文至少需要一段文字');
  }

  if (!pickRequiredString(input.signature)) {
    errors.push('署名不能为空');
  }

  if (!sanitizeDateString(input.relationshipStart)) {
    errors.push('relationshipStart 需要符合 YYYY-MM-DD 格式');
  }

  return { valid: errors.length === 0, errors };
}

function pickRequiredString(value, fallback) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  if (typeof fallback === 'string') {
    return fallback.trim();
  }
  return '';
}

function pickOptionalString(value, fallback = '') {
  if (typeof value === 'string') {
    return value.trim();
  }
  return typeof fallback === 'string' ? fallback : '';
}

function sanitizeTextList(value, fallback = [], { requireOne } = { requireOne: true }) {
  if (!Array.isArray(value)) {
    return requireOne ? [...fallback] : [];
  }
  const cleaned = value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  if (!cleaned.length && requireOne) {
    return [...fallback];
  }
  return cleaned;
}

function sanitizeTimeline(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => ({
      title: typeof item?.title === 'string' ? item.title.trim() : '',
      date: typeof item?.date === 'string' ? item.date.trim() : '',
      description: typeof item?.description === 'string' ? item.description.trim() : ''
    }))
    .filter(item => item.title || item.date || item.description);
}

function sanitizeDateString(value, fallback) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (DATE_PATTERN.test(trimmed)) {
      return trimmed;
    }
  }
  if (typeof fallback === 'string' && DATE_PATTERN.test(fallback)) {
    return fallback;
  }
  return '';
}
