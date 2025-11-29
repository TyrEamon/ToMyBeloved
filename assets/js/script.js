/* assets/js/script.js */

const config = {
    nickname: "亲爱的 [名字]",
    texts: [
        "Hi，当你点开这封信的时候，",
        "可能有点突然。",
        "其实，我关注你很久了。",
        "这里可以写很长很长的文字...",
        "每一行字都会自动换行。",
        "希望能给你一个小小的惊喜。"
    ],
    signature: "喜欢你的 [名字]",
    date: "2023.11.29"
};

document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.getElementById('envelope-container');
    const letter = document.getElementById('letter-container');
    const bgm = document.getElementById('bgm');
    const textArea = document.getElementById('text-area');

    let isOpened = false;

    envelope.addEventListener('click', () => {
        if (isOpened) return;
        isOpened = true;

        // 尝试播放音乐
        if(bgm) {
            bgm.play().then(() => {
                console.log("BGM playing");
            }).catch(e => {
                console.log("Autoplay blocked, usually needs explicit interaction", e);
            });
        }

        // 隐藏信封
        envelope.style.opacity = '0';
        
        setTimeout(() => {
            envelope.style.display = 'none';
            // 显示信纸
            letter.style.display = 'block';
            
            // 强制重绘以触发 transition
            letter.offsetHeight; 
            letter.style.opacity = '1';

            setTimeout(() => {
                startTyping();
                startParticles(); 
            }, 500);
        }, 1000); // 1秒后执行
    });

    // 初始化内容
    document.getElementById('nickname').innerText = config.nickname;
    document.getElementById('signature').innerText = config.signature;
    document.getElementById('date').innerText = config.date;

    // 打字机效果
    function startTyping() {
        let lineIndex = 0;
        let charIndex = 0;
        let currentContent = "";

        function type() {
            if (lineIndex < config.texts.length) {
                let line = config.texts[lineIndex];
                if (charIndex < line.length) {
                    currentContent += line.charAt(charIndex);
                    textArea.innerHTML = currentContent + "<span class='cursor'>|</span>";
                    charIndex++;
                    setTimeout(type, 150); // 打字速度
                } else {
                    currentContent += "<br>"; // 换行
                    lineIndex++;
                    charIndex = 0;
                    setTimeout(type, 500); // 行间停顿
                }
            } else {
                textArea.innerHTML = currentContent; // 移除光标
            }
        }
        type();
    }

    // 爱心飘落特效
    function startParticles() {
        setInterval(() => {
            const heart = document.createElement('div');
            heart.classList.add('heart-particle');
            heart.innerText = ['❤️', '💕', '🥰', '🌹'][Math.floor(Math.random() * 4)]; // 随机图标
            
            // 随机位置和大小
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
            
            // 随机下落时间
            heart.style.animationDuration = (Math.random() * 3 + 2) + 's'; 
            
            document.body.appendChild(heart);

            // 动画结束后移除元素，防止内存泄漏
            setTimeout(() => {
                heart.remove();
            }, 5000);
        }, 300); // 每0.3秒生成一个
    }
});