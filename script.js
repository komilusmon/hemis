// script.js faylini QAYTA YOZING:

// Global o'zgaruvchilar
let currentPeriod = 1;
let calculationsHistory = [];
let stats = {
    totalCalculations: 0,
    totalScore: 0,
    bestScore: 0,
    averageScore: 0
};

// DOM yuklanganda
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM yuklandi, dastur ishga tushmoqda...");
    
    // LocalStorage dan statistikani yuklash
    loadStats();
    
    // Dastur yuklanganda 1-davrni tanlash
    selectPeriod(1);
    
    // Inputlarni tozalash tugmasi
    setupClearButton();
    
    // Enter tugmasi bilan ishlash
    setupEnterKey();
    
    // Statistikani yangilash
    updateStatsDisplay();
    
    console.log("Dastur ishga tushdi. Statistikalar:", stats);
});

// Davrni tanlash
function selectPeriod(period) {
    console.log("Davr tanlandi:", period);
    currentPeriod = period;
    
    // Tugmalarni yangilash
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Faqat bosilgan tugmani active qilish
    const clickedButton = event.target.closest('.period-btn');
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // Inputlarni yangilash
    document.querySelectorAll('.period-content').forEach(div => {
        div.classList.add('hidden');
    });
    
    const selectedPeriod = document.getElementById(`period${period}`);
    if (selectedPeriod) {
        selectedPeriod.classList.remove('hidden');
        selectedPeriod.classList.add('fade-in');
    }
    
    // Natijani yangilash
    resetResult();
}

// Hisoblash funksiyasi
function hisobla() {
    console.log("Hisoblash boshlandi...");
    const natijaElement = document.getElementById('natija');
    
    try {
        let result;
        
        if (currentPeriod === 1) {
            console.log("Oraliq va Joriy hisoblanmoqda...");
            result = calculatePeriod1();
        } else if (currentPeriod === 2) {
            console.log("Yakuniy hisoblanmoqda...");
            result = calculatePeriod2();
        } else if (currentPeriod === 3) {
            console.log("Jami ball hisoblanmoqda...");
            result = calculatePeriod3();
        }
        
        console.log("Hisoblash natijasi:", result);
        
        // Natijani ko'rsatish
        displayResult(result);
        
        // Tarixga qo'shish
        addToHistory(result);
        
        // Statistikani yangilash
        updateStats(result);
        
    } catch (error) {
        console.error("Hisoblashda xatolik:", error);
        natijaElement.className = "result result-default";
        natijaElement.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <div>${error.message}</div>
            </div>
        `;
    }
}

// Oraliq va Joriy hisoblash
function calculatePeriod1() {
    const oraligInput = document.getElementById('oralig');
    const joriyInput = document.getElementById('joriy');
    
    const oraligBall = parseFloat(oraligInput.value);
    const joriyBall = parseFloat(joriyInput.value);

    console.log("Oraliq ball:", oraligBall, "Joriy ball:", joriyBall);

    // Validatsiya
    if (isNaN(oraligBall) || oraligBall === '') {
        throw new Error("Iltimos, Oraliq ballni kiriting");
    }
    
    if (isNaN(joriyBall) || joriyBall === '') {
        throw new Error("Iltimos, Joriy ballni kiriting");
    }
    
    if (oraligBall < 0 || oraligBall > 10) {
        throw new Error("Oraliq ball 0-10 oralig'ida bo'lishi kerak");
    }
    
    if (joriyBall < 0 || joriyBall > 15) {
        throw new Error("Joriy ball 0-15 oralig'ida bo'lishi kerak");
    }

    // Baholash
    const oraligBaho = calculateGrade(oraligBall, 10);
    const joriyBaho = calculateGrade(joriyBall, 15);
    
    const jamiBall = oraligBall + joriyBall;
    const passed = oraligBaho.grade !== "o'ta olmadi" && joriyBaho.grade !== "o'ta olmadi";

    return {
        type: 'Oraliq va Joriy',
        scores: [
            { 
                label: 'Oraliq', 
                score: oraligBall, 
                grade: oraligBaho.grade, 
                color: oraligBaho.color,
                max: 10
            },
            { 
                label: 'Joriy', 
                score: joriyBall, 
                grade: joriyBaho.grade, 
                color: joriyBaho.color,
                max: 15
            }
        ],
        total: jamiBall,
        maxTotal: 25,
        passed: passed,
        message: passed ? "✅ Barcha imtihonlardan o'tdingiz" : "⚠️ Iltimos, barcha imtihonlardan o'ting",
        resultClass: passed ? 'result-good' : 'result-poor'
    };
}

// Yakuniy hisoblash
function calculatePeriod2() {
    const yakuniyInput = document.getElementById('yakuniy');
    const yakuniyBall = parseFloat(yakuniyInput.value);

    console.log("Yakuniy ball:", yakuniyBall);

    // Validatsiya
    if (isNaN(yakuniyBall) || yakuniyBall === '') {
        throw new Error("Iltimos, Yakuniy ballni kiriting");
    }
    
    if (yakuniyBall < 0 || yakuniyBall > 50) {
        throw new Error("Yakuniy ball 0-50 oralig'ida bo'lishi kerak");
    }

    // Baholash
    const baho = calculateGrade(yakuniyBall, 50);
    
    const passed = baho.grade !== "Siz yiqilgan bo'lishingiz mumkin";

    return {
        type: 'Yakuniy',
        scores: [
            { 
                label: 'Yakuniy', 
                score: yakuniyBall, 
                grade: baho.grade, 
                color: baho.color,
                max: 50
            }
        ],
        total: yakuniyBall,
        maxTotal: 50,
        passed: passed,
        message: passed ? "✅ Yakuniy imtihondan o'tdingiz" : "⚠️ Yakuniy imtihondan o'ta olmadingiz",
        resultClass: getResultClass(baho.grade)
    };
}

// Jami ball hisoblash
function calculatePeriod3() {
    const jamiInput = document.getElementById('jami');
    const jamiBall = parseFloat(jamiInput.value);

    console.log("Jami ball:", jamiBall);

    // Validatsiya
    if (isNaN(jamiBall) || jamiBall === '') {
        throw new Error("Iltimos, Jami ballni kiriting");
    }
    
    if (jamiBall < 0 || jamiBall > 100) {
        throw new Error("Jami ball 0-100 oralig'ida bo'lishi kerak");
    }

    // Baholash
    const baho = calculateGrade(jamiBall, 100);
    
    const passed = baho.grade !== "Siz yiqilgan bo'lishingiz mumkin";

    return {
        type: 'Jami ball',
        scores: [
            { 
                label: 'Jami', 
                score: jamiBall, 
                grade: baho.grade, 
                color: baho.color,
                max: 100
            }
        ],
        total: jamiBall,
        maxTotal: 100,
        passed: passed,
        message: passed ? "✅ Imtihondan o'tdingiz" : "⚠️ Imtihondan o'ta olmadingiz",
        resultClass: getResultClass(baho.grade)
    };
}

// Baholash funksiyasi
function calculateGrade(score, maxScore) {
    console.log(`Baholash: ${score}/${maxScore}`);
    
    if (maxScore === 10) { // Oraliq
        if (score >= 9) return { grade: 5, color: '#28a745' };
        else if (score >= 7) return { grade: 4, color: '#17a2b8' };
        else if (score >= 6) return { grade: 3, color: '#ffc107' };
        else return { grade: "o'ta olmadi", color: '#dc3545' };
    } 
    else if (maxScore === 15) { // Joriy
        if (score >= 13) return { grade: 5, color: '#28a745' };
        else if (score >= 11) return { grade: 4, color: '#17a2b8' };
        else if (score >= 9) return { grade: 3, color: '#ffc107' };
        else return { grade: "o'ta olmadi", color: '#dc3545' };
    }
    else if (maxScore === 50) { // Yakuniy
        if (score >= 45) return { grade: 5, color: '#28a745' };
        else if (score >= 35) return { grade: 4, color: '#17a2b8' };
        else if (score >= 30) return { grade: 3, color: '#ffc107' };
        else return { grade: "Siz yiqilgan bo'lishingiz mumkin", color: '#dc3545' };
    }
    else { // Jami (100)
        if (score >= 90) return { grade: 5, color: '#28a745' };
        else if (score >= 70) return { grade: 4, color: '#17a2b8' };
        else if (score >= 60) return { grade: 3, color: '#ffc107' };
        else return { grade: "Siz yiqilgan bo'lishingiz mumkin", color: '#dc3545' };
    }
}

// Natijani ko'rsatish
function displayResult(result) {
    console.log("Natija ko'rsatilmoqda:", result);
    const natijaElement = document.getElementById('natija');
    
    let scoresHtml = result.scores.map(score => `
        <div class="score-item" style="margin: 10px 0; padding: 8px; background: #f8f9fa; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">${score.label}:</span>
                <span>${score.score} / ${score.max} ball</span>
                <span style="color: ${score.color}; font-weight: bold;">${score.grade}</span>
            </div>
        </div>
    `).join('');
    
    natijaElement.innerHTML = `
        <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-chart-line"></i>
            ${result.type} Natijalari
        </div>
        ${scoresHtml}
        <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; text-align: center; font-size: 18px;">
            <i class="fas fa-trophy"></i>
            <strong>Jami: ${result.total} / ${result.maxTotal} ball</strong>
        </div>
        <div style="margin-top: 15px; padding: 10px; border-radius: 8px; background: ${result.passed ? '#d4edda' : '#f8d7da'}; color: ${result.passed ? '#155724' : '#721c24'};">
            <i class="fas ${result.passed ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${result.message}
        </div>
    `;
    
    natijaElement.className = `result ${result.resultClass}`;
}

// Natijani tozalash
function resetResult() {
    const natijaElement = document.getElementById('natija');
    natijaElement.className = "result result-default";
    natijaElement.innerHTML = `
        <div class="result-placeholder">
            <i class="fas fa-info-circle"></i>
            <div>Hisoblash usulini tanlang va ballaringizni kiriting</div>
        </div>
    `;
}

// Natija klassini aniqlash
function getResultClass(grade) {
    if (grade === 5) return 'result-excellent';
    else if (grade === 4) return 'result-good';
    else if (grade === 3) return 'result-average';
    else return 'result-poor';
}

// Tarixga qo'shish
function addToHistory(result) {
    const historyItem = {
        type: result.type,
        total: result.total,
        date: new Date().toLocaleString('uz-UZ'),
        passed: result.passed
    };
    
    calculationsHistory.unshift(historyItem);
    if (calculationsHistory.length > 10) {
        calculationsHistory = calculationsHistory.slice(0, 10);
    }
    
    console.log("Tarixga qo'shildi:", historyItem);
    
    // LocalStorage ga saqlash
    saveHistory();
}

// Statistikani yangilash
function updateStats(result) {
    stats.totalCalculations++;
    stats.totalScore += result.total;
    stats.averageScore = stats.totalScore / stats.totalCalculations;
    
    if (result.total > stats.bestScore) {
        stats.bestScore = result.total;
    }
    
    console.log("Statistika yangilandi:", stats);
    
    // LocalStorage ga saqlash
    saveStats();
    
    // Ekranga chiqarish
    updateStatsDisplay();
}

// Statistikani ekranga chiqarish
function updateStatsDisplay() {
    console.log("Statistika ekranga chiqarilmoqda...");
    
    try {
        const totalCalculationsElement = document.getElementById('totalCalculations');
        const averageScoreElement = document.getElementById('averageScore');
        const bestScoreElement = document.getElementById('bestScore');
        
        if (totalCalculationsElement) {
            totalCalculationsElement.textContent = stats.totalCalculations;
        } else {
            console.error("totalCalculations element topilmadi");
        }
        
        if (averageScoreElement) {
            averageScoreElement.textContent = stats.averageScore.toFixed(1);
        } else {
            console.error("averageScore element topilmadi");
        }
        
        if (bestScoreElement) {
            bestScoreElement.textContent = stats.bestScore.toFixed(1);
        } else {
            console.error("bestScore element topilmadi");
        }
    } catch (error) {
        console.error("Statistika ekranga chiqarishda xatolik:", error);
    }
}

// LocalStorage dan yuklash
function loadStats() {
    try {
        const savedStats = localStorage.getItem('gpaStats');
        const savedHistory = localStorage.getItem('gpaHistory');
        
        if (savedStats) {
            const parsedStats = JSON.parse(savedStats);
            stats = { ...stats, ...parsedStats };
        }
        
        if (savedHistory) {
            calculationsHistory = JSON.parse(savedHistory);
        }
        
        console.log("LocalStorage dan yuklandi");
    } catch (e) {
        console.log('LocalStorage dan yuklashda xatolik:', e);
    }
}

// LocalStorage ga saqlash
function saveStats() {
    try {
        localStorage.setItem('gpaStats', JSON.stringify(stats));
        localStorage.setItem('gpaHistory', JSON.stringify(calculationsHistory));
        console.log("LocalStorage ga saqlandi");
    } catch (e) {
        console.log('LocalStorage ga saqlashda xatolik:', e);
    }
}

function saveHistory() {
    // saveStats bilan bir xil
    saveStats();
}

// Tozalash tugmasini sozlash
function setupClearButton() {
    // Inputlarni tozalash tugmasi
    const clearButton = document.createElement('button');
    clearButton.innerHTML = '<i class="fas fa-redo"></i> Tozalash';
    clearButton.className = 'clear-btn';
    clearButton.style.cssText = `
        background: #6c757d;
        color: white;
        border: none;
        padding: 15px;
        width: 100%;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    `;
    
    clearButton.onclick = function() {
        console.log("Tozalash tugmasi bosildi");
        // Barcha inputlarni tozalash
        document.querySelectorAll('.input-field').forEach(input => {
            input.value = '';
        });
        resetResult();
    };
    
    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn && calculateBtn.parentNode) {
        calculateBtn.parentNode.insertBefore(clearButton, calculateBtn.nextSibling);
        console.log("Tozalash tugmasi qo'shildi");
    }
}

// Enter tugmasi bilan ishlash
function setupEnterKey() {
    document.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            console.log("Enter tugmasi bosildi");
            hisobla();
        }
    });
}

// Global funksiyalar
window.selectPeriod = selectPeriod;
window.hisobla = hisobla;