/* assets/js/script.js */

const CONFIG_ENDPOINT = '/api/config';
const DEFAULT_CONFIG_URL = '/data/default-config.json';

// 当远程接口不可用且本地 JSON 也无法读取时，使用这一份兜底数据保证页面正常展示
const LOCAL_FALLBACK_CONFIG = {
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

let appState = {
    config: LOCAL_FALLBACK_CONFIG,
    isOpened: false,
    typingStarted: false,
    particleTimer: null
};

document.addEventListener('DOMContentLoaded', () => {
    initLoveLetter().catch(error => {
        console.error('初始化恋爱信封失败：', error);
    });
});

async function initLoveLetter() {
    const elements = collectElements();
    appState.config = await loadConfig();

    hydrateStaticContent(elements);
    registerEnvelopeInteraction(elements);
    registerRandomMessage(elements);
    registerSecretToggle(elements);
    populateTimeline(elements);
    updateDayCount(elements);
    setInterval(() => updateDayCount(elements), 60 * 60 * 1000);
}

function collectElements() {
    return {
        envelope: document.getElementById('envelope-container'),
        letter: document.getElementById('letter-container'),
        bgm: document.getElementById('bgm'),
        textArea: document.getElementById('text-area'),
        nickname: document.getElementById('nickname'),
        signature: document.getElementById('signature'),
        date: document.getElementById('date'),
        dayCount: document.getElementById('day-count'),
        timelineList: document.getElementById('timeline-list'),
        randomBtn: document.getElementById('random-message-btn'),
        randomDisplay: document.getElementById('random-message-display'),
        secretHeart: document.getElementById('secret-heart'),
        secretMessage: document.getElementById('secret-message'),
        secretMessageText: document.getElementById('secret-message-text'),
        particlesContainer: document.getElementById('particles')
    };
}

function hydrateStaticContent(elements) {
    const { nickname, signature, date, secretMessageText } = elements;
    if (nickname) nickname.innerText = safeText(appState.config.nickname);
    if (signature) signature.innerText = safeText(appState.config.signature);
    if (date) date.innerText = safeText(appState.config.date);
    if (secretMessageText) secretMessageText.textContent = safeText(appState.config.secretMessage);
}

function registerEnvelopeInteraction(elements) {
    const { envelope } = elements;
    if (!envelope) return;

    const openLetter = () => {
        if (appState.isOpened) return;
        appState.isOpened = true;

        playBgm(elements.bgm);
        revealLetter(elements);

        setTimeout(() => {
            startTyping(elements);
            startParticles(elements);
        }, 400);
    };

    envelope.addEventListener('click', openLetter);
    envelope.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLetter();
        }
    });
}

function playBgm(bgm) {
    if (!bgm) return;
    bgm.play().catch(err => {
        console.warn('自动播放被浏览器阻止，等待用户交互。', err);
    });
}

function revealLetter(elements) {
    const { envelope, letter } = elements;
    if (envelope) {
        envelope.classList.add('opened');
        envelope.setAttribute('aria-hidden', 'true');
        envelope.setAttribute('tabindex', '-1');
        setTimeout(() => {
            envelope.style.display = 'none';
        }, 900);
    }

    if (letter) {
        letter.style.display = 'block';
        requestAnimationFrame(() => {
            letter.classList.add('revealed');
            letter.setAttribute('aria-hidden', 'false');
        });
    }
}

function registerRandomMessage(elements) {
    const { randomBtn, randomDisplay } = elements;
    if (!randomBtn || !randomDisplay) return;

    randomBtn.addEventListener('click', () => {
        const pool = Array.isArray(appState.config.loveMessages) ? appState.config.loveMessages : [];
        if (!pool.length) return;
        const message = pool[Math.floor(Math.random() * pool.length)];
        randomDisplay.textContent = safeText(message);
        randomDisplay.classList.add('show');
    });
}

function registerSecretToggle(elements) {
    const { secretHeart, secretMessage } = elements;
    if (!secretHeart || !secretMessage) return;

    const toggleSecret = () => {
        const active = secretMessage.classList.toggle('active');
        secretMessage.setAttribute('aria-hidden', String(!active));
        secretHeart.setAttribute('aria-expanded', String(active));
    };

    secretHeart.addEventListener('click', toggleSecret);
    secretHeart.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSecret();
        }
    });
}

function startTyping(elements) {
    if (appState.typingStarted || !elements.textArea) return;
    appState.typingStarted = true;

    const texts = Array.isArray(appState.config.texts) ? appState.config.texts.map(safeText) : [];
    let lineIndex = 0;
    let charIndex = 0;
    let currentContent = '';

    function typeLine() {
        if (!texts.length || lineIndex >= texts.length) {
            elements.textArea.innerHTML = currentContent.replace(/<br>$/, '');
            return;
        }

        const line = texts[lineIndex];
        if (charIndex < line.length) {
            currentContent = `${currentContent}${line.charAt(charIndex)}`;
            elements.textArea.innerHTML = `${currentContent}<span class="cursor">|</span>`;
            charIndex++;
            setTimeout(typeLine, 120);
        } else {
            currentContent += '<br>';
            lineIndex++;
            charIndex = 0;
            setTimeout(typeLine, 500);
        }
    }

    typeLine();
}

function startParticles(elements) {
    if (appState.particleTimer || !elements.particlesContainer) return;
    const symbols = ['❤', '💗', '💕', '✨'];
    const maxHearts = 28;

    appState.particleTimer = setInterval(() => {
        if (elements.particlesContainer.childElementCount >= maxHearts) return;

        const heart = document.createElement('span');
        heart.className = 'heart-particle';
        heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        const left = Math.random() * 100;
        const size = Math.random() * 18 + 14;
        const drift = Math.random() * 24 - 12;
        const scale = (size / 28).toFixed(2);
        const opacity = (Math.random() * 0.4 + 0.4).toFixed(2);
        const duration = Math.random() * 5 + 4;
        const delay = Math.random() * 1.5;

        heart.style.left = `${left}vw`;
        heart.style.fontSize = `${size}px`;
        heart.style.setProperty('--drift', `${drift}vw`);
        heart.style.setProperty('--scale', scale);
        heart.style.setProperty('--opacity', opacity);
        heart.style.animationDuration = `${duration}s`;
        heart.style.animationDelay = `${delay}s`;

        elements.particlesContainer.appendChild(heart);
        setTimeout(() => heart.remove(), (duration + delay) * 1000 + 200);
    }, 600);
}

function populateTimeline(elements) {
    if (!elements.timelineList) return;
    const timeline = Array.isArray(appState.config.timeline) ? appState.config.timeline : [];
    elements.timelineList.innerHTML = timeline.map(item => `
        <article class="timeline-item">
            <span class="timeline-icon">✦</span>
            <p class="timeline-time">${safeText(item.date)}</p>
            <p class="timeline-title">${safeText(item.title)}</p>
            <p class="timeline-desc">${safeText(item.description)}</p>
        </article>
    `).join('');
}

function updateDayCount(elements) {
    if (!elements.dayCount) return;
    const start = safeText(appState.config.relationshipStart);
    const days = calculateDays(start);
    elements.dayCount.textContent = days;
}

function calculateDays(dateString) {
    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return 0;
    const [year, month, day] = parts;
    const startUTC = Date.UTC(year, month - 1, day);
    const today = new Date();
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const diff = todayUTC - startUTC;
    return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
}

async function loadConfig() {
    const remoteConfig = await fetchJson(CONFIG_ENDPOINT);
    if (remoteConfig) {
        return normalizeConfig(remoteConfig);
    }

    const backupConfig = await fetchJson(DEFAULT_CONFIG_URL);
    if (backupConfig) {
        return normalizeConfig(backupConfig);
    }

    console.warn('未能从服务器或本地 JSON 读取配置，使用内置兜底内容。');
    return normalizeConfig(LOCAL_FALLBACK_CONFIG);
}

async function fetchJson(url) {
    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.warn(`获取 ${url} 失败：`, error);
        return null;
    }
}

function normalizeConfig(raw) {
    return {
        nickname: safeText(raw.nickname) || LOCAL_FALLBACK_CONFIG.nickname,
        texts: normalizeTextArray(raw.texts, LOCAL_FALLBACK_CONFIG.texts),
        signature: safeText(raw.signature) || LOCAL_FALLBACK_CONFIG.signature,
        date: safeText(raw.date) || LOCAL_FALLBACK_CONFIG.date,
        relationshipStart: safeText(raw.relationshipStart) || LOCAL_FALLBACK_CONFIG.relationshipStart,
        timeline: normalizeTimeline(raw.timeline),
        loveMessages: normalizeTextArray(raw.loveMessages, LOCAL_FALLBACK_CONFIG.loveMessages),
        secretMessage: safeText(raw.secretMessage) || LOCAL_FALLBACK_CONFIG.secretMessage
    };
}

function normalizeTextArray(value, fallback = []) {
    if (!Array.isArray(value)) return [...fallback];
    return value.map(item => safeText(item)).filter(item => item);
}

function normalizeTimeline(items) {
    if (!Array.isArray(items)) {
        return LOCAL_FALLBACK_CONFIG.timeline.map(item => ({ ...item }));
    }
    return items.map(item => ({
        title: safeText(item.title),
        date: safeText(item.date),
        description: safeText(item.description)
    })).filter(item => item.title || item.description || item.date);
}

function safeText(value) {
    return typeof value === 'string' ? value : '';
}
