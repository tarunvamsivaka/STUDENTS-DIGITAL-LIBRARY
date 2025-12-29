/* =========================================
   1. WELCOME SCREEN LOGIC (Runs on Load)
   ========================================= */
window.addEventListener('load', function() {
    const splashScreen = document.getElementById('welcome-screen');
    
    if (splashScreen) {
        if (sessionStorage.getItem('welcomeShown')) {
            splashScreen.style.display = 'none';
        } else {
            setTimeout(function() {
                splashScreen.classList.add('fade-out');
                sessionStorage.setItem('welcomeShown', 'true');
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 800); 
            }, 3000); 
        }
    }
});

/* =========================================
   2. SEMESTER FILTER LOGIC (For Homepage)
   ========================================= */
function filterSemester(semId) {
    const allSections = document.querySelectorAll('.semester-section');
    if (allSections.length === 0) return;

    allSections.forEach(section => {
        if (semId === 'all') {
            section.style.display = 'block';
        } else {
            section.style.display = (section.id === semId) ? 'block' : 'none';
        }
    });

    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Fix: Handle event safely
    if (typeof event !== 'undefined' && event.target) {
        event.target.classList.add('active');
    }
}

/* =========================================
   3. GLOBAL FUZZY SEARCH ENGINE
   ========================================= */

// MASTER DATABASE (Merged Sem 1, 2, 3, and 4)
const subjectDatabase = [
    // Sem 1 & 2
    { name: "Engineering Chemistry", url: "chemistry.html", icon: "fa-flask" },
    { name: "Engineering Physics", url: "physics.html", icon: "fa-atom" },
    { name: "Basic Mechanical Engineering", url: "bme.html", icon: "fa-wrench" },
    { name: "Intro To Programming", url: "programming.html", icon: "fa-code" },
    { name: "Basic Electrical & Electronics", url: "Beee.html", icon: "fa-bolt" },
    { name: "Data Structures", url: "data_structures.html", icon: "fa-laptop-code" },
    
    // Sem 3
    { name: "Discrete Mathematics", url: "dmgt.html", icon: "fa-calculator" },
    { name: "Managerial Economics", url: "mefa.html", icon: "fa-chart-line" },
    { name: "Computer Org & Arch", url: "co.html", icon: "fa-microchip" },
    { name: "Advanced Data Structures", url: "adsa.html", icon: "fa-diagram-project" },
    { name: "Database Mgmt Systems", url: "dbms.html", icon: "fa-database" },
    
    // Sem 4
    { name: "Probability And Statistics", url: "p&s.html", icon: "fa-chart-pie" },
    { name: "Software Engineering", url: "se.html", icon: "fa-gears" },
    { name: "Java Programming", url: "java.html", icon: "fa-mug-hot" },
    { name: "Operating System", url: "os.html", icon: "fa-terminal" },
    { name: "Universal Human Values", url: "uhv.html", icon: "fa-hand-holding-heart" },

    // Tools
    { name: "SGPA Calculator", url: "calculator.html", icon: "fa-calculator" }
];

// 1. Calculate Similarity (0 to 1)
function getSimilarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) { longer = s2; shorter = s1; }
    var longerLength = longer.length;
    if (longerLength == 0) return 1.0;
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

// 2. Levenshtein Distance (The Math)
function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

// 3. The Search Function
function globalSearch() {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchInput || !resultsContainer) return;

    // Clean up input: remove extra spaces, lowercase
    const input = searchInput.value.toLowerCase().trim();
    
    resultsContainer.innerHTML = '';

    if (input.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }

    let matches = [];

    subjectDatabase.forEach(subject => {
        const subjectName = subject.name.toLowerCase();
        
        // --- CHECK 1: Direct Substring Match (Standard) ---
        if (subjectName.includes(input)) {
            matches.push(subject);
            return; 
        } 

        // --- CHECK 2: Advanced Word-by-Word Fuzzy Match ---
        const words = subjectName.split(" ");
        let highestSimilarity = 0;

        words.forEach(word => {
            const similarity = getSimilarity(word, input);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
            }
        });

        const fullSimilarity = getSimilarity(subjectName, input);
        
        if (highestSimilarity > 0.5 || fullSimilarity > 0.4) {
            matches.push(subject);
        }
    });

    // Remove duplicates
    matches = [...new Set(matches)];

    // Display Results
    if (matches.length > 0) {
        resultsContainer.style.display = 'block';
        matches.forEach(match => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="${match.url}">
                    <i class="fa-solid ${match.icon}"></i>
                    ${match.name}
                </a>
            `;
            resultsContainer.appendChild(li);
        });
    } else {
        // Show "No results" message (Cleaned up!)
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = '<li style="padding:10px; color:#666;">No subjects found...</li>';
    }
}

// Hide search results if clicked outside
document.addEventListener('click', function(e) {
    const searchBox = document.querySelector('.search-box');
    const results = document.getElementById('searchResults');
    if (searchBox && results && !searchBox.contains(e.target)) {
        results.style.display = 'none';
    }
});

/* =========================================
   4. SGPA CALCULATOR LOGIC (For Calculator Page)
   ========================================= */

function addRow() {
    const container = document.getElementById('subject-rows');
    if (!container) return;

    const newRow = document.createElement('div');
    newRow.className = 'calc-row';
    newRow.innerHTML = `
        <input type="number" placeholder="Credits" class="credit-input" step="0.5">
        <select class="grade-input">
            <option value="10">S (Outstanding) - 10</option>
            <option value="9">A (Excellent) - 9</option>
            <option value="8">B (Very Good) - 8</option>
            <option value="7">C (Good) - 7</option>
            <option value="6">D (Above Average) - 6</option>
            <option value="5">E (Average) - 5</option>
            <option value="0">F (Fail) - 0</option>
        </select>
        <button class="remove-btn" onclick="removeRow(this)"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(newRow);
}

function removeRow(button) {
    button.parentElement.remove();
}

function calculateSGPA() {
    const credits = document.querySelectorAll('.credit-input');
    const grades = document.querySelectorAll('.grade-input');
    
    if (credits.length === 0) return;

    let totalCredits = 0;
    let totalScore = 0;
    
    for (let i = 0; i < credits.length; i++) {
        let creditVal = parseFloat(credits[i].value);
        let gradeVal = parseFloat(grades[i].value);
        
        if (!isNaN(creditVal)) {
            totalCredits += creditVal;
            totalScore += (creditVal * gradeVal);
        }
    }
    
    let sgpa = 0;
    if (totalCredits > 0) {
        sgpa = totalScore / totalCredits;
    }
    
    const resultBox = document.getElementById('result-box');
    const sgpaText = document.getElementById('sgpa-value');
    const resultMessage = document.getElementById('result-message');
    
    if (resultBox && sgpaText) {
        resultBox.style.display = 'block';
        sgpaText.innerText = sgpa.toFixed(2);
        
        if (resultMessage) {
            if (sgpa >= 9) resultMessage.innerText = "Outstanding work! 🌟";
            else if (sgpa >= 8) resultMessage.innerText = "Excellent performance! 🚀";
            else if (sgpa >= 6) resultMessage.innerText = "Good job, keep pushing! 💪";
            else resultMessage.innerText = "Don't give up! You can do better. 📚";
        }
    }
}