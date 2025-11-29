/* assets/js/script.js */

// 在这里自定义专属内容：称呼、正文、时间线、情话池以及隐藏彩蛋文字
const config = {
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

// 可自由替换喜欢的情话，支持任意数量
    
    loveMessages: [
        "你在我未来的计划里。",
        "所有的温柔都只想留给你。",
        "你是我辛苦工作一天后，最想见的风景。",
        "比起喜欢，我更想说我爱你，更想说我懂你。",
        "只要你需要，我随叫随到。"
    ],

// 小彩蛋区域：点击信纸角落的小心心即可显示
    
    secretMessage: "没别的，就是想和你在这个不完美的世界里，建一个小小的、温暖的家。"
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
