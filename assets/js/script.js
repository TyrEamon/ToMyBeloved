/* assets/js/script.js */

// 在这里自定义专属内容：称呼、正文、时间线、情话池以及隐藏彩蛋文字
const config = {
    nickname: "亲爱的月光",
    texts: [
        "那天在夏末的街角遇见你，我只是想买杯咖啡，却被你温柔的笑意留在原地。",
        "后来每一次并肩的散步、每一通深夜的消息，都让世界慢下来，像是星光都在等我们说晚安。",
        "我喜欢你讲故事时认真发亮的眼睛，也喜欢你安静望向窗外时，整座城市都柔软了的样子。",
        "若前方还有很多未知，我想牵着你的手慢慢走，把每一个平凡日子都变成我们的小冒险。",
        "愿我在你疲惫时给你肩膀，在你喜悦时为你欢呼，收藏你所有的细碎心情。",
        "把我全部的笨拙和认真都交给你，只想和你一起看遍四季流转，把故事写到很远很远。"
    ],
    signature: "永远偏爱你的 我",
    date: "2023.11.29",
    relationshipStart: "2022-08-20",
    timeline: [
        { title: "第一次见面", date: "2022-05-30", description: "夏末的街角，把笑意悄悄收藏。" },
        { title: "第一次约会", date: "2022-06-18", description: "雨后的咖啡馆，说了好多悄悄话。" },
        { title: "在一起的那天", date: "2022-08-20", description: "约定把日常变成浪漫。" },
        { title: "今天", date: "此刻", description: "带着心跳记录这一页，也期待下一次拥抱。" }
    ],
    // 可自由替换喜欢的情话，支持任意数量
    loveMessages: [
        "你是我藏在心底最柔软的光。",
        "月亮不会奔向我，但你会。",
        "全世界最温柔的风，都不及你看我时的目光。",
        "想把星星串成项链，挂在你笑弯的眉间。",
        "我的心有点小，只能装得下你和未来的每个清晨。"
    ],
    // 小彩蛋区域：点击信纸角落的小心心即可显示
    secretMessage: "这里藏着我的小心愿：想牵着你走更远，想把每一天都写成我们的专属故事。"
};

document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.getElementById('envelope-container');
    const letter = document.getElementById('letter-container');
    const bgm = document.getElementById('bgm');
    const textArea = document.getElementById('text-area');
    const nicknameEl = document.getElementById('nickname');
    const signatureEl = document.getElementById('signature');
    const dateEl = document.getElementById('date');
    const dayCountEl = document.getElementById('day-count');
    const timelineList = document.getElementById('timeline-list');
    const randomBtn = document.getElementById('random-message-btn');
    const randomDisplay = document.getElementById('random-message-display');
    const secretHeart = document.getElementById('secret-heart');
    const secretMessage = document.getElementById('secret-message');
    const particlesContainer = document.getElementById('particles');

    let isOpened = false;
    let typingStarted = false;
    let particleTimer = null;

    if (nicknameEl) nicknameEl.innerText = config.nickname;
    if (signatureEl) signatureEl.innerText = config.signature;
    if (dateEl) dateEl.innerText = config.date;
    if (secretMessage) secretMessage.textContent = config.secretMessage;

    populateTimeline();
    updateDayCount();
    setInterval(updateDayCount, 60 * 60 * 1000);

    const openLetter = () => {
        if (isOpened) return;
        isOpened = true;

        if (bgm) {
            bgm.play().catch(err => {
                console.warn('Autoplay blocked, user interaction required.', err);
            });
        }

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

        setTimeout(() => {
            startTyping();
            startParticles();
        }, 400);
    };

    if (envelope) {
        envelope.addEventListener('click', openLetter);
        envelope.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLetter();
            }
        });
    }

    if (randomBtn && randomDisplay) {
        randomBtn.addEventListener('click', () => {
            const pool = config.loveMessages || [];
            if (!pool.length) return;
            const message = pool[Math.floor(Math.random() * pool.length)];
            randomDisplay.textContent = message;
            randomDisplay.classList.add('show');
        });
    }

    if (secretHeart && secretMessage) {
        const toggleSecret = () => {
            const active = secretMessage.classList.toggle('active');
            secretMessage.setAttribute('aria-hidden', String(!active));
        };
        secretHeart.addEventListener('click', toggleSecret);
        secretHeart.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleSecret();
            }
        });
    }

    function startTyping() {
        if (typingStarted || !textArea) return;
        typingStarted = true;

        let lineIndex = 0;
        let charIndex = 0;
        let currentContent = '';

        function typeLine() {
            if (!config.texts || lineIndex >= config.texts.length) {
                textArea.innerHTML = currentContent.replace(/<br>$/, '');
                return;
            }

            const line = config.texts[lineIndex];
            if (charIndex < line.length) {
                currentContent = `${currentContent}${line.charAt(charIndex)}`;
                textArea.innerHTML = `${currentContent}<span class="cursor">|</span>`;
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

    function startParticles() {
        if (particleTimer || !particlesContainer) return;
        const symbols = ['❤', '💗', '💕', '✨'];
        const maxHearts = 28;

        particleTimer = setInterval(() => {
            if (particlesContainer.childElementCount >= maxHearts) return;

            const heart = document.createElement('span');
            heart.className = 'heart-particle';
            heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];

            const left = Math.random() * 100;
            const size = Math.random() * 18 + 14;
            const drift = Math.random() * 24 - 12; // left/right range
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

            particlesContainer.appendChild(heart);
            setTimeout(() => heart.remove(), (duration + delay) * 1000 + 200);
        }, 600);
    }

    function populateTimeline() {
        if (!timelineList || !config.timeline) return;
        timelineList.innerHTML = config.timeline.map(item => `
            <article class="timeline-item">
                <span class="timeline-icon">✦</span>
                <p class="timeline-time">${item.date}</p>
                <p class="timeline-title">${item.title}</p>
                <p class="timeline-desc">${item.description}</p>
            </article>
        `).join('');
    }

    function updateDayCount() {
        if (!dayCountEl || !config.relationshipStart) return;
        const days = calculateDays(config.relationshipStart);
        dayCountEl.textContent = days;
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
});
