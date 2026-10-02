const sourceTextElement = document.getElementById('source-text');
const inputArea = document.getElementById('input-area');
const wpmDisplay = document.getElementById('wpm-display');
const accuracyDisplay = document.getElementById('accuracy-display');

let currentText = "The quick brown fox jumps over the lazy dog.";
let currentLessonIndex = 0;
let startTime = null;
let totalTypedChars = 0;
let errors = 0;
let lessonHistory = [];

// --- 1. SETUP: Prepare the text for styling ---
function setupText() {
    sourceTextElement.innerHTML = currentText.split('').map(char => {
        return `<span class="char">${char}</span>`;
    }).join('');
    if (sourceTextElement.firstChild) {
        sourceTextElement.firstChild.classList.add('current');
    }
}

// --- 2. THE ENGINE: Handle key presses ---
inputArea.addEventListener('input', () => {
    const typedText = inputArea.value;
    const sourceChars = sourceTextElement.querySelectorAll('.char');
    const currentIndex = typedText.length - 1;

    if (startTime === null) {
        startTime = new Date().getTime();
    }

    if (currentIndex >= 0) {
        const typedChar = typedText[currentIndex];
        const sourceCharElement = sourceChars[currentIndex];
        const sourceChar = sourceCharElement.textContent;

        sourceChars.forEach(char => char.classList.remove('current', 'correct', 'incorrect'));

        if (typedChar === sourceChar) {
            sourceCharElement.classList.add('correct');
        } else {
            sourceCharElement.classList.add('incorrect');
            errors++;
        }
        totalTypedChars++;

        if (sourceChars[currentIndex + 1]) {
            sourceChars[currentIndex + 1].classList.add('current');
        } else {
            setTimeout(() => {
                currentLessonIndex++;
                fetch(`/api/get-text?index=${currentLessonIndex}`)
                    .then(response => response.json())
                    .then(data => {
                        currentText = data.text;
                        inputArea.value = '';
                        startTime = null;
                        totalTypedChars = 0;
                        errors = 0;
                        wpmDisplay.textContent = '0';
                        accuracyDisplay.textContent = '100%';
                        setupText();
                    })
                    .catch(error => console.error('Error auto-advancing:', error));
            }, 1000);
        }
    }

    updateStats();
});

// --- 3. STATS: Calculate WPM and Accuracy ---
function updateStats() {
    if (startTime === null) return;

    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - startTime) / 60000;

    const correctChars = totalTypedChars - errors;
    let wpm = (correctChars / 5) / elapsedTime;
    let accuracy = ((correctChars / totalTypedChars) * 100) || 100;

    wpmDisplay.textContent = Math.round(wpm) || 0;
    accuracyDisplay.textContent = `${accuracy.toFixed(1)}%`;
}

// --- 4. BUTTON HANDLERS ---
document.getElementById('next-lesson-btn').addEventListener('click', () => {
    currentLessonIndex++;

    fetch(`/api/get-text?index=${currentLessonIndex}`)
        .then(response => response.json())
        .then(data => {
            currentText = data.text;
            inputArea.value = '';
            startTime = null;
            totalTypedChars = 0;
            errors = 0;
            wpmDisplay.textContent = '0';
            accuracyDisplay.textContent = '100%';
            setupText();
        })
        .catch(error => {
            console.error('Error fetching lesson:', error);
            alert('Could not load next lesson. Make sure Flask server is running on http://localhost:5000');
        });
});

document.getElementById('reset-btn').addEventListener('click', () => {
    inputArea.value = '';
    startTime = null;
    totalTypedChars = 0;
    errors = 0;
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    setupText();
});

document.getElementById('stop-btn').addEventListener('click', () => {
    if (startTime === null) {
        alert('Start typing to generate a report!');
        return;
    }

    const correctChars = totalTypedChars - errors;
    const currentTime = new Date().getTime();
    const elapsedSeconds = (currentTime - startTime) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;
    const wpm = elapsedMinutes > 0 ? (correctChars / 5) / elapsedMinutes : 0;
    const accuracy = totalTypedChars > 0 ? (correctChars / totalTypedChars) * 100 : 100;
    const grade = accuracy >= 95 ? 'A+' : accuracy >= 90 ? 'A' : accuracy >= 85 ? 'B+' : accuracy >= 80 ? 'B' : accuracy >= 75 ? 'C+' : accuracy >= 70 ? 'C' : 'D';

    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Typing Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container { width: 100%; max-width: 900px; }
        .slide {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 60px 40px;
            min-height: 600px;
            display: none;
            animation: slideIn 0.5s ease;
        }
        .slide.active { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide1 h1 {
            color: #667eea;
            font-size: 48px;
            margin-bottom: 50px;
            text-align: center;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            width: 100%;
            margin-bottom: 60px;
        }
        .metric-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 30px;
            color: white;
            text-align: center;
        }
        .metric-label {
            font-size: 18px;
            margin-bottom: 15px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .metric-value {
            font-size: 72px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .metric-unit {
            font-size: 24px;
            opacity: 0.8;
        }
        .grade-display {
            font-size: 120px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 20px;
        }
        .grade-label {
            font-size: 24px;
            color: #666;
        }
        .slide2 h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            font-size: 32px;
        }
        .report-section {
            margin-bottom: 30px;
            width: 100%;
            max-height: 400px;
            overflow-y: auto;
        }
        .report-section h2 {
            color: #667eea;
            font-size: 18px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        }
        .stat-label { color: #666; font-weight: 500; }
        .stat-value { font-size: 20px; font-weight: bold; color: #667eea; }
        .lesson-text {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            max-height: 150px;
            overflow-y: auto;
        }
        .button-group {
            display: flex;
            gap: 15px;
            margin-top: 40px;
            justify-content: center;
            flex-wrap: wrap;
            width: 100%;
        }
        button {
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
        }
        .btn-next { background: #667eea; color: white; }
        .btn-next:hover { background: #5568d3; transform: translateY(-2px); }
        .btn-prev { background: #999; color: white; }
        .btn-prev:hover { background: #777; transform: translateY(-2px); }
        .btn-back { background: #667eea; color: white; }
        .btn-back:hover { background: #5568d3; transform: translateY(-2px); }
        .btn-download { background: #48bb78; color: white; }
        .btn-download:hover { background: #38a169; transform: translateY(-2px); }
        .slide-indicator { text-align: center; margin-top: 30px; color: #999; font-size: 14px; width: 100%; }
    </style>
</head>
<body>
    <div class="container">
        <div class="slide slide1 active">
            <h1>🎉 Lesson ${currentLessonIndex + 1} Complete!</h1>
            <div class="metrics-grid">
                <div class="metric-box">
                    <div class="metric-label">Words Per Minute</div>
                    <div class="metric-value">${Math.round(wpm)}</div>
                    <div class="metric-unit">WPM</div>
                </div>
                <div class="metric-box">
                    <div class="metric-label">Accuracy</div>
                    <div class="metric-value">${accuracy.toFixed(1)}</div>
                    <div class="metric-unit">%</div>
                </div>
            </div>
            <div class="grade-display">${grade}</div>
            <div class="grade-label">Grade</div>
            <div class="button-group">
                <button class="btn-next" onclick="showSlide(2)">View Details →</button>
                <button class="btn-back" onclick="window.close()">Back to Typing</button>
            </div>
            <div class="slide-indicator">Slide 1 of 2</div>
        </div>
        
        <div class="slide slide2">
            <h1>📊 Detailed Report</h1>
            <div class="report-section">
                <h2>Performance Metrics</h2>
                <div class="stat-row">
                    <span class="stat-label">Words Per Minute (WPM)</span>
                    <span class="stat-value">${Math.round(wpm)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Accuracy</span>
                    <span class="stat-value">${accuracy.toFixed(1)}%</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Time Elapsed</span>
                    <span class="stat-value">${Math.floor(elapsedSeconds)}s</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Characters Typed</span>
                    <span class="stat-value">${totalTypedChars}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Correct Characters</span>
                    <span class="stat-value" style="color: #48bb78;">${correctChars}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Errors</span>
                    <span class="stat-value" style="color: #f56565;">${errors}</span>
                </div>
            </div>
            <div class="report-section">
                <h2>Lesson Text</h2>
                <div class="lesson-text">${currentText}</div>
            </div>
            <div class="button-group">
                <button class="btn-prev" onclick="showSlide(1)">← Back</button>
                <button class="btn-download" onclick="downloadReport()">Download Report</button>
                <button class="btn-back" onclick="window.close()">Back to Typing</button>
            </div>
            <div class="slide-indicator">Slide 2 of 2</div>
        </div>
    </div>
    
    <script>
        function showSlide(num) {
            document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.slide')[num - 1].classList.add('active');
        }
        
        function downloadReport() {
            const text = 'TYPING COACH - LESSON REPORT\\n============================\\nLesson Number: ${currentLessonIndex + 1}\\nDate: ' + new Date().toLocaleString() + '\\n\\nPERFORMANCE METRICS\\n-------------------\\nWords Per Minute (WPM): ${Math.round(wpm)}\\nAccuracy: ${accuracy.toFixed(1)}%\\nTime Elapsed: ${Math.floor(elapsedSeconds)} seconds\\nTotal Characters Typed: ${totalTypedChars}\\nCorrect Characters: ${correctChars}\\nErrors: ${errors}\\nGrade: ${grade}\\n\\nLESSON TEXT\\n-----------\\n${currentText}';
            const blob = new Blob([text], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'typing_report_lesson_${currentLessonIndex + 1}.txt';
            a.click();
            window.URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>
    `);
    reportWindow.document.close();
});

setupText();
