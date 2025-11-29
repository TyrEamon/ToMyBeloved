/* assets/js/admin.js */

// 该脚本驱动 /admin 后台，如需扩展字段记得同步更新 Cloudflare Worker 的校验逻辑。
const API_ENDPOINTS = {
    config: '/api/config',
    login: '/api/login',
    logout: '/api/logout',
    session: '/api/session'
};

const DEFAULT_CONFIG_URL = '/data/default-config.json';

const BUILTIN_DEFAULT_CONFIG = {
    nickname: "吾爱",
    texts: [
        "这世上人来人往，能找到一个说话投机、三观契合的人，真的太难得了。",
        "我很庆幸，在茫茫人海中，我们没有错过彼此。",
        "我不羡慕别人的轰轰烈烈，我只想要和你在一起的这份踏实和安稳。",
        "谢谢你让我看到了自己未曾发现的一面，也让我想要为了未来去努力变得更好。",
        "我不求每一天都充满激情，只愿在漫长的岁月里，我们能一直握紧彼此的手。",
        "关于未来，我有无数种设想，但每一种设想里，主角都是你。"
    ],
    signature: "永远忠于你的伴侣",
    date: "2025.11.30",
    relationshipStart: "2022-08-20",
    timeline: [
        { title: "初识", date: "2022-05-30", description: "原本平行的两条线，有了奇妙的交点。" },
        { title: "心动", date: "2022-06-18", description: "发现自己开始期待你的消息，在意你的喜怒哀乐。" },
        { title: "携手", date: "2022-08-20", description: "做出了承诺，就没想过要退缩。" },
        { title: "展望", date: "未来", description: "路还很长，请多指教。" }
    ],
    loveMessages: [
        "你在我未来的计划里。",
        "所有的温柔都只想留给你。",
        "你是我辛苦工作一天后，最想见的风景。",
        "比起喜欢，我更想说我爱你，更想说我懂你。",
        "只要你需要，我随叫随到。"
    ],
    secretMessage: "没别的，就是想和你在这个不完美的世界里，建一个小小的、温暖的家。"
};

const state = {
    config: null,
    defaultConfig: null
};

const ui = {};

document.addEventListener('DOMContentLoaded', () => {
    captureElements();
    attachEvents();
    checkSession();
});

function captureElements() {
    ui.loginPanel = document.getElementById('login-panel');
    ui.loginForm = document.getElementById('login-form');
    ui.configPanel = document.getElementById('config-panel');
    ui.configForm = document.getElementById('config-form');
    ui.nicknameInput = document.getElementById('nickname-input');
    ui.signatureInput = document.getElementById('signature-input');
    ui.dateInput = document.getElementById('date-input');
    ui.relationshipInput = document.getElementById('relationship-input');
    ui.secretInput = document.getElementById('secret-input');

    ui.textsList = document.getElementById('texts-list');
    ui.loveList = document.getElementById('love-list');
    ui.timelineList = document.getElementById('timeline-list');

    ui.addTextBtn = document.getElementById('add-text-btn');
    ui.addLoveBtn = document.getElementById('add-love-btn');
    ui.addTimelineBtn = document.getElementById('add-timeline-btn');
    ui.reloadButton = document.getElementById('reload-button');
    ui.logoutButton = document.getElementById('logout-button');
    ui.resetButton = document.getElementById('reset-button');

    ui.toast = document.getElementById('toast');
}

function attachEvents() {
    ui.loginForm?.addEventListener('submit', handleLogin);
    ui.configForm?.addEventListener('submit', handleSave);
    ui.logoutButton?.addEventListener('click', handleLogout);
    ui.reloadButton?.addEventListener('click', () => loadConfig(true));
    ui.resetButton?.addEventListener('click', resetToDefault);
    ui.addTextBtn?.addEventListener('click', () => addStringItem('texts'));
    ui.addLoveBtn?.addEventListener('click', () => addStringItem('loveMessages'));
    ui.addTimelineBtn?.addEventListener('click', addTimelineItem);

    ui.nicknameInput?.addEventListener('input', (event) => updateField('nickname', event.target.value));
    ui.signatureInput?.addEventListener('input', (event) => updateField('signature', event.target.value));
    ui.dateInput?.addEventListener('input', (event) => updateField('date', event.target.value));
    ui.relationshipInput?.addEventListener('input', (event) => updateField('relationshipStart', event.target.value));
    ui.secretInput?.addEventListener('input', (event) => updateField('secretMessage', event.target.value));
}

async function checkSession() {
    try {
        const response = await fetch(API_ENDPOINTS.session, { credentials: 'include', cache: 'no-store' });
        if (response.ok) {
            revealAdminPanel();
            await loadConfig();
            return;
        }
    } catch (error) {
        console.warn('检查会话失败：', error);
    }

    showLoginPanel();
}

async function handleLogin(event) {
    event.preventDefault();
    if (!ui.loginForm) return;

    const formData = new FormData(ui.loginForm);
    const payload = {
        username: formData.get('username')?.toString().trim(),
        password: formData.get('password')?.toString()
    };

    const submitButton = ui.loginForm.querySelector('button[type="submit"]');
    toggleButton(submitButton, true);

    try {
        const response = await fetch(API_ENDPOINTS.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        if (!response.ok) {
            showToast('用户名或密码不正确，请重试。', 'error');
            return;
        }

        showToast('登录成功，正在载入配置。', 'success');
        revealAdminPanel();
        await loadConfig();
    } catch (error) {
        console.error('登录失败：', error);
        showToast('无法连接到后台，请稍后再试。', 'error');
    } finally {
        toggleButton(submitButton, false);
    }
}

async function handleLogout() {
    try {
        await fetch(API_ENDPOINTS.logout, { method: 'POST', credentials: 'include' });
    } catch (error) {
        console.warn('退出登录时发生错误：', error);
    } finally {
        state.config = null;
        showToast('已退出登录。', 'success');
        showLoginPanel();
    }
}

async function loadConfig(notify = false) {
    if (!ui.configForm) return;
    toggleForm(ui.configForm, true);

    try {
        const remote = await fetchJson(API_ENDPOINTS.config);
        const fallback = await getDefaultConfig();
        state.config = normalizeConfig(remote || fallback, fallback);
        hydrateForm();
        if (notify) {
            showToast('已载入最新配置。', 'success');
        }
    } catch (error) {
        console.error('读取配置失败：', error);
        showToast('读取配置失败，请稍后重试。', 'error');
    } finally {
        toggleForm(ui.configForm, false);
    }
}

async function resetToDefault() {
    const defaults = await getDefaultConfig();
    state.config = normalizeConfig(defaults, defaults);
    hydrateForm();
    showToast('已恢复默认模板，记得点击保存同步到 KV～', 'success');
}

async function handleSave(event) {
    event.preventDefault();
    if (!state.config) return;

    const submitButton = ui.configForm?.querySelector('button[type="submit"]');
    toggleButton(submitButton, true);

    try {
        const payload = buildPayloadFromState();
        const validationErrors = validatePayload(payload);
        if (validationErrors.length) {
            showToast(validationErrors[0], 'error');
            return;
        }

        const response = await fetch(API_ENDPOINTS.config, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.error || '未知错误');
        }

        state.config = normalizeConfig(payload, await getDefaultConfig());
        hydrateForm();
        showToast('保存成功，前台刷新后即可看到新内容。', 'success');
    } catch (error) {
        console.error('保存失败：', error);
        showToast(`保存失败：${error.message}`, 'error');
    } finally {
        toggleButton(submitButton, false);
    }
}

function hydrateForm() {
    if (!state.config) return;

    ui.nicknameInput.value = state.config.nickname || '';
    ui.signatureInput.value = state.config.signature || '';
    ui.dateInput.value = state.config.date || '';
    ui.relationshipInput.value = state.config.relationshipStart || '';
    ui.secretInput.value = state.config.secretMessage || '';

    renderStringList('texts', ui.textsList, '写下你想对对方说的话');
    renderStringList('loveMessages', ui.loveList, '填入一句甜蜜的话');
    renderTimelineList();
}

function renderStringList(key, container, placeholder) {
    if (!container || !state.config) return;
    const values = Array.isArray(state.config[key]) ? state.config[key] : [];
    container.innerHTML = '';

    if (!values.length) {
        container.innerHTML = '<p class="hint">暂无内容，点击上方按钮新增。</p>';
        return;
    }

    values.forEach((value, index) => {
        const item = document.createElement('div');
        item.className = 'list-item';

        const textarea = document.createElement('textarea');
        textarea.rows = key === 'texts' ? 3 : 2;
        textarea.placeholder = placeholder;
        textarea.value = value;
        textarea.addEventListener('input', (event) => {
            state.config[key][index] = event.target.value;
        });

        item.appendChild(textarea);
        item.appendChild(createListActions(key, index));
        container.appendChild(item);
    });
}

function renderTimelineList() {
    if (!ui.timelineList || !state.config) return;
    const items = Array.isArray(state.config.timeline) ? state.config.timeline : [];
    ui.timelineList.innerHTML = '';

    if (!items.length) {
        ui.timelineList.innerHTML = '<p class="hint">暂无节点，点击上方按钮新增。</p>';
        return;
    }

    items.forEach((entry, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'list-item';

        const titleField = createInputField('标题', entry.title, (value) => {
            state.config.timeline[index].title = value;
        });
        const dateField = createInputField('日期（可填文字，如 2022-08-20 / 未来）', entry.date, (value) => {
            state.config.timeline[index].date = value;
        });
        const descField = createTextareaField('描述', entry.description, (value) => {
            state.config.timeline[index].description = value;
        });

        wrapper.appendChild(titleField);
        wrapper.appendChild(dateField);
        wrapper.appendChild(descField);
        wrapper.appendChild(createListActions('timeline', index));

        ui.timelineList.appendChild(wrapper);
    });
}

function createInputField(label, value, onChange) {
    const field = document.createElement('label');
    field.className = 'form-field';

    const span = document.createElement('span');
    span.textContent = label;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value || '';
    input.addEventListener('input', (event) => onChange(event.target.value));

    field.appendChild(span);
    field.appendChild(input);
    return field;
}

function createTextareaField(label, value, onChange) {
    const field = document.createElement('label');
    field.className = 'form-field';

    const span = document.createElement('span');
    span.textContent = label;

    const textarea = document.createElement('textarea');
    textarea.rows = 3;
    textarea.value = value || '';
    textarea.addEventListener('input', (event) => onChange(event.target.value));

    field.appendChild(span);
    field.appendChild(textarea);
    return field;
}

function createListActions(key, index) {
    const actions = document.createElement('div');
    actions.className = 'list-actions';

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'move-btn';
    upBtn.textContent = '上移';
    upBtn.disabled = index === 0;
    upBtn.addEventListener('click', () => moveItem(key, index, -1));

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'move-btn';
    downBtn.textContent = '下移';
    const list = getListByKey(key);
    downBtn.disabled = index === list.length - 1;
    downBtn.addEventListener('click', () => moveItem(key, index, 1));

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '删除';
    removeBtn.addEventListener('click', () => removeItem(key, index));

    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    actions.appendChild(removeBtn);

    return actions;
}

function getListByKey(key) {
    if (!state.config) return [];
    if (!Array.isArray(state.config[key])) {
        state.config[key] = [];
    }
    return state.config[key];
}

function addStringItem(key) {
    const list = getListByKey(key);
    list.push('');
    renderStringList(key, key === 'texts' ? ui.textsList : ui.loveList, key === 'texts' ? '写下你想对对方说的话' : '填入一句甜蜜的话');
}

function addTimelineItem() {
    const list = getListByKey('timeline');
    list.push({ title: '', date: '', description: '' });
    renderTimelineList();
}

function moveItem(key, index, offset) {
    const list = getListByKey(key);
    const target = index + offset;
    if (target < 0 || target >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item);

    if (key === 'timeline') {
        renderTimelineList();
    } else {
        renderStringList(key, key === 'texts' ? ui.textsList : ui.loveList, key === 'texts' ? '写下你想对对方说的话' : '填入一句甜蜜的话');
    }
}

function removeItem(key, index) {
    const list = getListByKey(key);
    list.splice(index, 1);
    if (key === 'timeline') {
        renderTimelineList();
    } else {
        renderStringList(key, key === 'texts' ? ui.textsList : ui.loveList, key === 'texts' ? '写下你想对对方说的话' : '填入一句甜蜜的话');
    }
}

function updateField(field, value) {
    if (!state.config) return;
    state.config[field] = value;
}

function buildPayloadFromState() {
    return {
        nickname: ui.nicknameInput.value.trim(),
        texts: getListByKey('texts').map(item => item.trim()).filter(Boolean),
        signature: ui.signatureInput.value.trim(),
        date: ui.dateInput.value.trim(),
        relationshipStart: ui.relationshipInput.value.trim(),
        timeline: getListByKey('timeline')
            .map(item => ({
                title: (item.title || '').trim(),
                date: (item.date || '').trim(),
                description: (item.description || '').trim()
            }))
            .filter(item => item.title || item.date || item.description),
        loveMessages: getListByKey('loveMessages').map(item => item.trim()).filter(Boolean),
        secretMessage: ui.secretInput.value.trim()
    };
}

function validatePayload(payload) {
    const errors = [];
    if (!payload.nickname) errors.push('称呼不能为空');
    if (!payload.texts.length) errors.push('请至少填写一段正文内容');
    if (!payload.signature) errors.push('署名不能为空');
    if (!payload.relationshipStart) errors.push('请填写在一起的纪念日');
    return errors;
}

function showToast(message, type = 'info') {
    if (!ui.toast) return;
    ui.toast.textContent = message;
    ui.toast.className = `toast ${type}`;
}

function toggleButton(button, loading) {
    if (!button) return;
    button.disabled = loading;
    button.dataset.loading = loading ? 'true' : 'false';
}

function toggleForm(form, disabled) {
    if (!form) return;
    Array.from(form.querySelectorAll('input, textarea, button')).forEach(el => {
        el.disabled = disabled;
    });
}

function revealAdminPanel() {
    ui.loginPanel?.classList.add('hidden');
    if (ui.configPanel) {
        ui.configPanel.classList.remove('hidden');
        ui.configPanel.setAttribute('aria-hidden', 'false');
    }
}

function showLoginPanel() {
    ui.configPanel?.classList.add('hidden');
    if (ui.loginPanel) {
        ui.loginPanel.classList.remove('hidden');
        ui.loginPanel.setAttribute('aria-hidden', 'false');
    }
}

async function fetchJson(url) {
    try {
        const response = await fetch(url, { cache: 'no-store', credentials: 'include' });
        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        console.warn(`请求 ${url} 失败：`, error);
        return null;
    }
}

async function getDefaultConfig() {
    if (state.defaultConfig) return state.defaultConfig;
    try {
        const response = await fetch(DEFAULT_CONFIG_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('无法读取默认 JSON');
        state.defaultConfig = await response.json();
    } catch (error) {
        console.warn('读取默认 JSON 失败，使用内置兜底：', error);
        state.defaultConfig = BUILTIN_DEFAULT_CONFIG;
    }
    return state.defaultConfig;
}

function normalizeConfig(raw, fallback) {
    const source = raw && typeof raw === 'object' ? raw : fallback || BUILTIN_DEFAULT_CONFIG;
    return {
        nickname: pickText(source.nickname, fallback?.nickname || ''),
        texts: normalizeTextArray(source.texts, fallback?.texts || []),
        signature: pickText(source.signature, fallback?.signature || ''),
        date: pickText(source.date, fallback?.date || ''),
        relationshipStart: pickText(source.relationshipStart, fallback?.relationshipStart || ''),
        timeline: normalizeTimeline(source.timeline, fallback?.timeline || []),
        loveMessages: normalizeTextArray(source.loveMessages, fallback?.loveMessages || []),
        secretMessage: pickText(source.secretMessage, fallback?.secretMessage || '')
    };
}

function pickText(value, fallback = '') {
    return typeof value === 'string' ? value : fallback;
}

function normalizeTextArray(items, fallback = []) {
    if (!Array.isArray(items)) return [...fallback];
    return items.map(item => (typeof item === 'string' ? item : ''));
}

function normalizeTimeline(items, fallback = []) {
    if (!Array.isArray(items)) {
        return fallback.map(item => ({ ...item }));
    }
    return items.map(item => ({
        title: typeof item?.title === 'string' ? item.title : '',
        date: typeof item?.date === 'string' ? item.date : '',
        description: typeof item?.description === 'string' ? item.description : ''
    }));
}
