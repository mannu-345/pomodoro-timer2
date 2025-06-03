document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const timerEl = document.getElementById('timer');
    const timerLabelEl = document.getElementById('timer-label');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const sessionCountEl = document.getElementById('session-count');
    const applySettingsBtn = document.getElementById('apply-settings');
    
    // Default settings
    let workTime = 25;
    let shortBreak = 5;
    let longBreak = 15;
    let longBreakInterval = 4;
    
    // Timer state
    let timeLeft = workTime * 60;
    let timerInterval = null;
    let isRunning = false;
    let currentMode = 'work'; // 'work', 'shortBreak', 'longBreak'
    let sessionCount = 0;
    let isBreak = false;
    
    // Audio notification
    const alarmSound = new Audio();
    alarmSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3';
    
    // Initialize timer display
    updateTimerDisplay();
    
    // Event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    applySettingsBtn.addEventListener('click', applySettings);
    
    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission();
    }
    
    // Timer functions
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    alarmSound.play();
                    sendNotification();
                    
                    if (currentMode === 'work') {
                        sessionCount++;
                        sessionCountEl.textContent = sessionCount;
                        
                        // Determine which break to take
                        if (sessionCount % longBreakInterval === 0) {
                            startLongBreak();
                        } else {
                            startShortBreak();
                        }
                    } else {
                        // After a break, start work session
                        startWorkSession();
                    }
                }
            }, 1000);
        }
    }
    
    function pauseTimer() {
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
        }
    }
    
    function resetTimer() {
        pauseTimer();
        startWorkSession(false);
        sessionCount = 0;
        sessionCountEl.textContent = sessionCount;
    }
    
    function startWorkSession(autoStart = true) {
        currentMode = 'work';
        timeLeft = workTime * 60;
        timerLabelEl.textContent = '作業時間';
        document.body.style.backgroundColor = '#f5f5f5';
        updateTimerDisplay();
        
        if (autoStart) {
            startTimer();
        } else {
            isRunning = false;
        }
    }
    
    function startShortBreak() {
        currentMode = 'shortBreak';
        timeLeft = shortBreak * 60;
        timerLabelEl.textContent = '短い休憩';
        document.body.style.backgroundColor = '#e8f5e9';
        updateTimerDisplay();
        startTimer();
    }
    
    function startLongBreak() {
        currentMode = 'longBreak';
        timeLeft = longBreak * 60;
        timerLabelEl.textContent = '長い休憩';
        document.body.style.backgroundColor = '#e3f2fd';
        updateTimerDisplay();
        startTimer();
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update document title
        document.title = `${timerEl.textContent} - ${timerLabelEl.textContent}`;
    }
    
    function applySettings() {
        // Get values from inputs
        const newWorkTime = parseInt(document.getElementById('work-time').value);
        const newShortBreak = parseInt(document.getElementById('short-break').value);
        const newLongBreak = parseInt(document.getElementById('long-break').value);
        const newLongBreakInterval = parseInt(document.getElementById('long-break-interval').value);
        
        // Validate inputs
        if (isNaN(newWorkTime) || isNaN(newShortBreak) || isNaN(newLongBreak) || isNaN(newLongBreakInterval)) {
            alert('すべての設定に有効な数値を入力してください。');
            return;
        }
        
        // Update settings
        workTime = newWorkTime;
        shortBreak = newShortBreak;
        longBreak = newLongBreak;
        longBreakInterval = newLongBreakInterval;
        
        // Reset timer with new settings
        resetTimer();
        
        // Confirmation message
        alert('設定を保存しました。');
    }
    
    function sendNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            let message = '';
            
            if (currentMode === 'work') {
                message = '作業時間が終了しました。休憩しましょう！';
            } else {
                message = '休憩時間が終了しました。作業を再開しましょう！';
            }
            
            new Notification('ポモドーロタイマー', {
                body: message,
                icon: 'https://cdn-icons-png.flaticon.com/512/1786/1786451.png'
            });
        }
    }
});
