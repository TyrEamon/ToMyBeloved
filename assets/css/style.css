/* assets/css/style.css */

/* 全局重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background-color: #fce4ec; /* 浪漫的粉色背景 */
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    overflow: hidden; /* 防止出现滚动条 */
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* --- 信封部分 --- */
#envelope-container {
    position: relative;
    cursor: pointer;
    z-index: 10;
    transition: opacity 1s ease; /* 消失时的淡出效果 */
}

.envelope {
    width: 300px;
    height: 200px;
    background-color: #ff5252;
    position: relative;
    border-radius: 5px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 信封盖子（用 CSS 画三角形） */
.envelope::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border-left: 150px solid transparent;
    border-right: 150px solid transparent;
    border-top: 100px solid #ff8a80; /* 盖子颜色浅一点 */
    z-index: 2;
    transform-origin: top;
}

.letter-preview {
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    z-index: 3;
    margin-top: 60px;
}

.heart-seal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    color: #ff5252;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    animation: pulse 1.5s infinite; /* 心跳动画 */
    z-index: 4;
}

@keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.1); }
    100% { transform: translate(-50%, -50%) scale(1); }
}

/* --- 信纸部分 --- */
#letter-container {
    position: absolute;
    width: 90%;
    max-width: 500px;
    height: 80vh; /* 占据屏幕高度 */
    background: #fffdf7; /* 米色信纸 */
    padding: 30px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    border-radius: 10px;
    overflow-y: auto; /* 内容多了可以滚动 */
    opacity: 0; /* 初始透明 */
    transition: opacity 1.5s ease;
    z-index: 5;
    background-image: linear-gradient(#e1e1e1 1px, transparent 1px); /* 信纸横线效果 */
    background-size: 100% 30px;
    line-height: 30px;
}

.letter-content h2 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
    font-size: 1.5rem;
}

#text-area {
    font-size: 1.1rem;
    color: #555;
    white-space: pre-wrap; /* 保留换行 */
}

.cursor {
    animation: blink 1s infinite;
}

@keyframes blink {
    50% { opacity: 0; }
}

.signature-area {
    margin-top: 40px;
    text-align: right;
    font-weight: bold;
    color: #333;
}

/* --- 爱心雨特效 --- */
.heart-particle {
    position: fixed;
    color: #ff4081;
    font-size: 20px;
    user-select: none;
    pointer-events: none; /* 鼠标可以直接穿透 */
    animation: fall linear forwards;
    z-index: 1;
}

@keyframes fall {
    to {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
    }
}