/**
 * DAILY MODE - NULL-MAGIC MANTDLE
 * Mode-specific logic for daily challenges
 */

// ============================================
// DAILY MODE STATE
// ============================================

let currentGuessesCount = 0;
let gameEnded = false;
let userAttemptsMatrix = [];

// Game start date for day number calculation
const GAME_START_DATE = new Date('2026-05-01T00:00:00-05:00'); // May 1, 2026 EST

// Manual queue for specific daily items
const CUSTOM_DAILY_QUEUE = {
    // Format: "YYYY-MM-DD": "ItemID"
    // Example: "2026-05-23": "3031"
};

// ============================================
// SEEDED RANDOM GENERATOR
// ============================================

function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function seededShuffle(array, seed) {
    const shuffled = [...array];
    let m = shuffled.length, t, i;
    while (m) {
        i = Math.floor(seededRandom(seed++) * m--);
        t = shuffled[m];
        shuffled[m] = shuffled[i];
        shuffled[i] = t;
    }
    return shuffled;
}

// ============================================
// DATE & TIMEZONE UTILITIES
// ============================================

/**
 * Get current EST date string in YYYY-MM-DD format
 * This ensures all users get the same daily item regardless of their timezone
 */
function getCurrentESTDate() {
    // Get current time
    const now = new Date();
    
    // Convert to EST (UTC-5)
    // Note: We use UTC-5 regardless of DST to keep the game consistent year-round
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const estOffset = -5 * 60 * 60000; // EST is UTC-5
    const estTime = new Date(utcTime + estOffset);
    
    const year = estTime.getUTCFullYear();
    const month = String(estTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(estTime.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Calculate day number since game started
 */
function getDayNumber(dateString) {
    const currentDate = new Date(dateString + 'T00:00:00-05:00');
    const daysDiff = Math.floor((currentDate - GAME_START_DATE) / (1000 * 60 * 60 * 24));
    return daysDiff + 1; // Start from day 1
}

// ============================================
// DAILY ITEM SELECTION
// ============================================

function initDailySecretItem() {
    // Get current EST date consistently
    const dayId = getCurrentESTDate();
    
    // Parse date components for seeding
    const [year, month, day] = dayId.split('-').map(Number);

    // Check custom queue first
    if (CUSTOM_DAILY_QUEUE[dayId]) {
        const queuedItemId = CUSTOM_DAILY_QUEUE[dayId];
        secretItem = completeItemPool.find(item => item.id === queuedItemId);

        if (secretItem) {
            document.getElementById("devTarget").textContent = `${secretItem.name} (${secretItem.tier}) [FORCED]`;
            restoreDailyProgress();
            startMidnightTimer();
            return;
        }
    }

    // Seeded selection
    const legendaryItems = completeItemPool.filter(item => item.tier === "Legendary");
    const epicItems = completeItemPool.filter(item => item.tier === "Epic");
    const commonItems = completeItemPool.filter(item => item.tier === "Common");
    const starterItems = completeItemPool.filter(item => item.tier === "Starter");

    let dailyHistory = getDailyHistory();
    let baseSeed = year * 10000 + parseInt(month) * 100 + parseInt(day);

    // Initialize shuffled orders
    if (!dailyHistory.legendaryOrder.length) {
        dailyHistory.legendaryOrder = seededShuffle(legendaryItems.map(i => i.id), baseSeed);
    }
    if (!dailyHistory.epicOrder.length) {
        dailyHistory.epicOrder = seededShuffle(epicItems.map(i => i.id), baseSeed + 1);
    }
    if (!dailyHistory.commonOrder.length) {
        dailyHistory.commonOrder = seededShuffle(commonItems.map(i => i.id), baseSeed + 2);
    }
    if (!dailyHistory.starterOrder.length) {
        dailyHistory.starterOrder = seededShuffle(starterItems.map(i => i.id), baseSeed + 3);
    }

    // New day check
    if (dailyHistory.lastPlayedDay !== dayId) {
        if (dailyHistory.lastPlayedDay !== "") {
            const lastDate = new Date(dailyHistory.lastPlayedDay.replace(/-/g, '/'));
            const currentDate = new Date(dayId.replace(/-/g, '/'));
            const daysBetween = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

            if (daysBetween > 1 || !dailyHistory.hasWonToday) {
                dailyHistory.currentStreak = 0;
            }
        }

        if (dailyHistory.lastPlayedDay !== "") {
            dailyHistory.legendaryIdx++;
            dailyHistory.epicIdx++;
            dailyHistory.commonIdx++;
            dailyHistory.starterIdx++;
        }

        // Wrap indices
        if (dailyHistory.legendaryIdx >= dailyHistory.legendaryOrder.length) {
            dailyHistory.legendaryIdx = 0;
            dailyHistory.legendaryOrder = seededShuffle(legendaryItems.map(i => i.id), baseSeed + 9);
        }
        if (dailyHistory.epicIdx >= dailyHistory.epicOrder.length) {
            dailyHistory.epicIdx = 0;
            dailyHistory.epicOrder = seededShuffle(epicItems.map(i => i.id), baseSeed + 10);
        }
        if (dailyHistory.commonIdx >= dailyHistory.commonOrder.length) {
            dailyHistory.commonIdx = 0;
            dailyHistory.commonOrder = seededShuffle(commonItems.map(i => i.id), baseSeed + 11);
        }
        if (dailyHistory.starterIdx >= dailyHistory.starterOrder.length) {
            dailyHistory.starterIdx = 0;
            dailyHistory.starterOrder = seededShuffle(starterItems.map(i => i.id), baseSeed + 12);
        }

        dailyHistory.lastPlayedDay = dayId;
        dailyHistory.hasWonToday = false;
        dailyHistory.savedGuesses = [];
        saveDailyHistory(dailyHistory);
    }

    // Select item based on tier roll
    const tierRoll = seededRandom(baseSeed + 50);
    let chosenItemId;

    if (tierRoll < 0.85) {
        chosenItemId = dailyHistory.legendaryOrder[dailyHistory.legendaryIdx];
    } else if (tierRoll < 0.95) {
        chosenItemId = dailyHistory.epicOrder[dailyHistory.epicIdx];
    } else {
        const combineGroup = [...dailyHistory.commonOrder, ...dailyHistory.starterOrder];
        const combinedIdx = dailyHistory.commonIdx % combineGroup.length;
        chosenItemId = combineGroup[combinedIdx];
    }

    secretItem = completeItemPool.find(item => item.id === chosenItemId) || completeItemPool[0];

    document.getElementById("devTarget").textContent = `${secretItem.name} (${secretItem.tier})`;
    
    updateStreakDisplay();
    restoreDailyProgress();
    startMidnightTimer();
}

// ============================================
// STORAGE MANAGEMENT
// ============================================

function getDailyHistory() {
    let history = JSON.parse(localStorage.getItem('mantdleDailyHistory'));
    if (!history) {
        history = {
            lastPlayedDay: "",
            hasWonToday: false,
            legendaryOrder: [],
            epicOrder: [],
            commonOrder: [],
            starterOrder: [],
            legendaryIdx: 0,
            epicIdx: 0,
            commonIdx: 0,
            starterIdx: 0,
            currentStreak: 0,
            maxStreak: 0,
            savedGuesses: []
        };
    }
    return history;
}

function saveDailyHistory(history) {
    localStorage.setItem('mantdleDailyHistory', JSON.stringify(history));
}

function saveDailyGameState() {
    const dailyHistory = getDailyHistory();
    dailyHistory.savedGuesses = activeGuesses.map(g => g.id);
    saveDailyHistory(dailyHistory);
}

function updateStreakDisplay() {
    const history = getDailyHistory();
    document.getElementById('currentStreak').textContent = history.currentStreak;
    document.getElementById('maxStreak').textContent = history.maxStreak;
}

// ============================================
// PROGRESS RESTORATION
// ============================================

function restoreDailyProgress() {
    const dailyHistory = getDailyHistory();
    const resultsBody = document.getElementById('resultsBody');
    const input = document.getElementById('itemInput');
    const winMessage = document.getElementById('winMessage');

    resultsBody.innerHTML = '';
    activeGuesses = [];
    totalGuessesCount = 0;
    currentGuessesCount = 0;

    if (dailyHistory.savedGuesses && dailyHistory.savedGuesses.length > 0) {
        dailyHistory.savedGuesses.forEach(itemId => {
            const historicalItem = completeItemPool.find(i => i.id === itemId);
            if (historicalItem) {
                renderGuessRowWithoutAnimation(historicalItem);
            }
        });
    }

    if (dailyHistory.hasWonToday) {
        winMessage.style.display = 'block';
        const trackingWord = dailyHistory.savedGuesses.length === 1 ? "guess" : "guesses";
        if (dailyHistory.savedGuesses.length <= 3) {
            winMessage.textContent = `🔥 You're a Legend! You found ${secretItem.name} in just ${dailyHistory.savedGuesses.length} ${trackingWord}!`;
        } else if (dailyHistory.savedGuesses.length <= 8) {
            winMessage.textContent = `✨ Great job! You got ${secretItem.name} in ${dailyHistory.savedGuesses.length} ${trackingWord}!`;
        } else {
            winMessage.textContent = `🎉 Well Done! You found ${secretItem.name} in ${dailyHistory.savedGuesses.length} ${trackingWord}!`;
        }
        input.disabled = true;
        input.placeholder = "Come back tomorrow!";
        
        // Show share button if game was already won
        currentGuessesCount = dailyHistory.savedGuesses.length;
        showShareButton();
    } else {
        input.disabled = false;
        input.placeholder = "Type an item name...";
    }
}

function renderGuessRowWithoutAnimation(guess) {
    activeGuesses.push(guess);
    totalGuessesCount++;
    currentGuessesCount++;

    const resultsBody = document.getElementById('resultsBody');
    const { row } = renderGuessRow(guess, secretItem, 0);
    resultsBody.insertBefore(row, resultsBody.firstChild);
}

// ============================================
// TIMER
// ============================================

function startMidnightTimer() {
    const timerSpan = document.getElementById('dailyTimer');

    function updateTimer() {
        const now = new Date();
        
        // Get next midnight EST
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const estOffset = -5 * 60 * 60000;
        const estTime = new Date(utcTime + estOffset);
        
        const midnightEst = new Date(estTime);
        midnightEst.setUTCHours(24, 0, 0, 0);
        
        const diffMs = midnightEst - estTime;
        if (diffMs <= 0) {
            location.reload();
            return;
        }

        const hours = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const seconds = String(Math.floor((diffMs % (1000 * 60)) / 1000)).padStart(2, '0');

        timerSpan.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// ============================================
// GUESS SUBMISSION
// ============================================

function submitDailyGuess(guess) {
    totalGuessesCount++;
    currentGuessesCount++;
    
    const resultsBody = document.getElementById('resultsBody');
    const input = document.getElementById('itemInput');
    const winMessage = document.getElementById('winMessage');

    // Track this guess for share feature
    const guessResults = [];
    
    // Item name
    guessResults.push(guess.name === secretItem.name ? 'correct' : 'wrong');
    
    // Rarity
    guessResults.push(guess.tier === secretItem.tier ? 'correct' : 'wrong');
    
    // Class
    if (JSON.stringify(guess.class.sort()) === JSON.stringify(secretItem.class.sort())) {
        guessResults.push('correct');
    } else if (guess.class.some(c => secretItem.class.includes(c)) && !guess.class.includes("N/A") && !guess.class.includes("Doran's Item")) {
        guessResults.push('partial');
    } else {
        guessResults.push('wrong');
    }
    
    // Gold (with arrow)
    if (guess.cost === secretItem.cost) {
        guessResults.push('correct');
    } else if (guess.cost < secretItem.cost) {
        guessResults.push('higher');
    } else {
        guessResults.push('lower');
    }
    
    // Stats
    if (JSON.stringify(guess.stats.sort()) === JSON.stringify(secretItem.stats.sort())) {
        guessResults.push('correct');
    } else if (guess.stats.some(s => secretItem.stats.includes(s)) && !guess.stats.includes("None")) {
        guessResults.push('partial');
    } else {
        guessResults.push('wrong');
    }
    
    // Active
    guessResults.push(guess.hasActive === secretItem.hasActive ? 'correct' : 'wrong');
    
    // Recipe
    if (guess.name === secretItem.name || secretItem.recipe.includes(guess.name)) {
        guessResults.push('correct');
    } else {
        const sharedComponents = guess.recipe.filter(r => secretItem.recipe.includes(r));
        guessResults.push(sharedComponents.length > 0 ? 'partial' : 'wrong');
    }
    
    // Group
    const guessGroup = (guess.group || "").trim().toLowerCase();
    const secretGroup = (secretItem.group || "").trim().toLowerCase();
    const isGuessNone = (guessGroup === "" || guessGroup === "none");
    const isSecretNone = (secretGroup === "" || secretGroup === "none");
    guessResults.push((guessGroup === secretGroup || (isGuessNone && isSecretNone)) ? 'correct' : 'wrong');
    
    userAttemptsMatrix.push(guessResults);

    const { row, finalDelay } = renderGuessRow(guess, secretItem);
    resultsBody.insertBefore(row, resultsBody.firstChild);

    activeGuesses.push(guess);
    saveDailyGameState();

    if (guess.name === secretItem.name) {
        setTimeout(() => {
            const trackingWord = totalGuessesCount === 1 ? "guess" : "guesses";
            let reactionMessage = "";

            if (totalGuessesCount >= 1 && totalGuessesCount <= 3) {
                reactionMessage = `🔥 You're a Legend! You found ${secretItem.name} in just ${totalGuessesCount} ${trackingWord}!`;
            } else if (totalGuessesCount >= 4 && totalGuessesCount <= 8) {
                reactionMessage = `✨ Great job! You got ${secretItem.name} in ${totalGuessesCount} ${trackingWord}!`;
            } else {
                reactionMessage = `🎉 Well Done! You found ${secretItem.name} in ${totalGuessesCount} ${trackingWord}!`;
            }

            winMessage.textContent = reactionMessage;
            winMessage.style.display = 'block';

            let dailyHistory = getDailyHistory();
            if (!dailyHistory.hasWonToday) {
                dailyHistory.hasWonToday = true;
                dailyHistory.currentStreak += 1;
                if (dailyHistory.currentStreak > dailyHistory.maxStreak) {
                    dailyHistory.maxStreak = dailyHistory.currentStreak;
                }
                dailyHistory.wonItemId = secretItem.id;
                saveDailyHistory(dailyHistory);

                updateStreakDisplay();
                
                // Update stats
                updateDailyStats(totalGuessesCount);
                
                // Show share button
                showShareButton();
            }
            input.disabled = true;
        }, (finalDelay + 0.6) * 1000);
    }
}

// ============================================
// STATS & SHARING
// ============================================

function updateDailyStats(guesses) {
    // Get existing stats
    let played = parseInt(localStorage.getItem('stats_daily_played') || '0');
    let won = parseInt(localStorage.getItem('stats_daily_won') || '0');
    let totalGuesses = parseInt(localStorage.getItem('stats_daily_total_guesses') || '0');
    let oneGuessWins = parseInt(localStorage.getItem('stats_daily_one_guess') || '0');
    
    // Update stats
    played++;
    won++;
    totalGuesses += guesses;
    if (guesses === 1) oneGuessWins++;
    
    // Save stats
    localStorage.setItem('stats_daily_played', played);
    localStorage.setItem('stats_daily_won', won);
    localStorage.setItem('stats_daily_total_guesses', totalGuesses);
    localStorage.setItem('stats_daily_one_guess', oneGuessWins);
}

function generateShareText() {
    const dayId = getCurrentESTDate();
    const dayNumber = getDayNumber(dayId);
    
    // Convert matrix to emoji grid (or reconstruct from saved guesses if matrix is empty)
    let blockGrid = "";
    
    if (userAttemptsMatrix.length > 0) {
        // Use the existing matrix if available
        userAttemptsMatrix.forEach(row => {
            row.forEach(status => {
                if (status === 'correct') blockGrid += "🟩";
                else if (status === 'partial') blockGrid += "🟨";
                else if (status === 'wrong') blockGrid += "🟥";
                else if (status === 'higher') blockGrid += "⬆️";
                else if (status === 'lower') blockGrid += "⬇️";
            });
            blockGrid += "\n";
        });
    } else {
        // Reconstruct from activeGuesses if matrix is empty (page reload)
        activeGuesses.forEach(guess => {
            const row = [];
            
            // Item name
            row.push(guess.name === secretItem.name ? 'correct' : 'wrong');
            
            // Rarity
            row.push(guess.tier === secretItem.tier ? 'correct' : 'wrong');
            
            // Class
            if (JSON.stringify(guess.class.sort()) === JSON.stringify(secretItem.class.sort())) {
                row.push('correct');
            } else if (guess.class.some(c => secretItem.class.includes(c)) && !guess.class.includes("N/A") && !guess.class.includes("Doran's Item")) {
                row.push('partial');
            } else {
                row.push('wrong');
            }
            
            // Gold
            if (guess.cost === secretItem.cost) {
                row.push('correct');
            } else if (guess.cost < secretItem.cost) {
                row.push('higher');
            } else {
                row.push('lower');
            }
            
            // Stats
            if (JSON.stringify(guess.stats.sort()) === JSON.stringify(secretItem.stats.sort())) {
                row.push('correct');
            } else if (guess.stats.some(s => secretItem.stats.includes(s)) && !guess.stats.includes("None")) {
                row.push('partial');
            } else {
                row.push('wrong');
            }
            
            // Active
            row.push(guess.hasActive === secretItem.hasActive ? 'correct' : 'wrong');
            
            // Recipe
            if (guess.name === secretItem.name || secretItem.recipe.includes(guess.name)) {
                row.push('correct');
            } else {
                const sharedComponents = guess.recipe.filter(r => secretItem.recipe.includes(r));
                row.push(sharedComponents.length > 0 ? 'partial' : 'wrong');
            }
            
            // Group
            const guessGroup = (guess.group || "").trim().toLowerCase();
            const secretGroup = (secretItem.group || "").trim().toLowerCase();
            const isGuessNone = (guessGroup === "" || guessGroup === "none");
            const isSecretNone = (secretGroup === "" || secretGroup === "none");
            row.push((guessGroup === secretGroup || (isGuessNone && isSecretNone)) ? 'correct' : 'wrong');
            
            // Convert row to emojis
            row.forEach(status => {
                if (status === 'correct') blockGrid += "🟩";
                else if (status === 'partial') blockGrid += "🟨";
                else if (status === 'wrong') blockGrid += "🟥";
                else if (status === 'higher') blockGrid += "⬆️";
                else if (status === 'lower') blockGrid += "⬇️";
            });
            blockGrid += "\n";
        });
    }

    const gameUrl = "https://lie8.github.io/Null-Magic-Mantdle/";
    return `I found the NullMagicMantdle item #${dayNumber} in daily mode in ${currentGuessesCount} ${currentGuessesCount === 1 ? 'try' : 'tries'}!\n\n${blockGrid.trim()}\n\nPlay here: ${gameUrl}`;
}

function showShareButton() {
    // Create share button if it doesn't exist
    let shareBtn = document.getElementById('dailyShareBtn');
    if (!shareBtn) {
        const winMessage = document.getElementById('winMessage');
        shareBtn = document.createElement('button');
        shareBtn.id = 'dailyShareBtn';
        shareBtn.className = 'share-action-btn';
        shareBtn.innerHTML = '📋 Copy Result';
        
        shareBtn.addEventListener('click', async () => {
            const shareText = generateShareText();
            
            // Copy to clipboard silently
            try {
                await navigator.clipboard.writeText(shareText);
                // Silent copy - no feedback needed
            } catch (err) {
                // Fallback method if clipboard fails
                const textArea = document.createElement('textarea');
                textArea.value = shareText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        });
        
        winMessage.parentElement.insertBefore(shareBtn, winMessage.nextSibling);
    }
    shareBtn.style.display = 'inline-flex';
}

// ============================================
// INITIALIZATION
// ============================================

async function initDailyMode() {
    const success = await initializeGameEngine();
    if (!success) return;

    initDailySecretItem();
    initSettings();
    initModals();
    initDevPanel();

    const input = document.getElementById('itemInput');
    const suggestions = document.getElementById('suggestions');

    setupAutocomplete(input, suggestions, (item) => {
        submitDailyGuess(item);
    });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDailyMode);
} else {
    initDailyMode();
}
