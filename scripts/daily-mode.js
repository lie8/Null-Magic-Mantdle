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
const GAME_START_DATE = new Date('2026-05-29T00:00:00-05:00'); // May 29, 2026 EST

// Manual queue for specific daily items
const CUSTOM_DAILY_QUEUE = {
    // Format: "YYYY-MM-DD": "ItemID"
    // Example: "2026-05-23": "3031"
};

function seededRandom(seed) {
    // Use multiply-shift-mix for consistent hashing across all browsers
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// ============================================
// ITEM POOL CYCLING WITH TIER BALANCE
// ============================================

function getShuffledTierPool(tierName, cycleNumber) {
    // Get items for this tier
    const tierItems = completeItemPool.filter(item => 
        item.tier === tierName && !CUSTOM_EXCLUDED_ITEMS.has(item.name)
    );
    
    // Create a unique seed for this tier and cycle
    // Different cycle number = different shuffle order
    const tierSeed = 20260501 + (tierName === "Legendary" ? 1000 : tierName === "Epic" ? 2000 : 3000) + cycleNumber;
    
    // Shuffle this tier's items
    const shuffled = [...tierItems];
    let seed = tierSeed;
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed++) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
}

function getDaysSinceGameStart() {
    const dayId = getCurrentESTDate();
    const currentDate = new Date(dayId + 'T00:00:00-05:00');
    const daysDiff = Math.floor((currentDate - GAME_START_DATE) / (1000 * 60 * 60 * 24));
    return daysDiff; // 0 on May 1, 1 on May 2, etc.
}

function getConsistentDailyItemId() {
    const daysSinceStart = getDaysSinceGameStart();
    
    // Create a seed from the day to pick tier consistently
    const [year, month, day] = getCurrentESTDate().split('-').map(Number);
    const baseSeed = year * 10000 + month * 100 + day;
    
    // Determine tier for this day (85% Legendary, 10% Epic, 5% Common/Starter)
    const tierRoll = seededRandom(baseSeed + 50);
    let selectedTier, tietItemCount;
    
    if (tierRoll < 0.85) {
        selectedTier = "Legendary";
    } else if (tierRoll < 0.95) {
        selectedTier = "Epic";
    } else {
        selectedTier = "Common"; // Includes Common + Starter combined
    }
    
    // Get the shuffled pool for this tier and cycle
    // We need to track which "cycle" we're in for each tier
    const legendaryPool = getShuffledTierPool("Legendary", 0);
    const epicPool = getShuffledTierPool("Epic", 0);
    const commonPool = completeItemPool.filter(item => 
        (item.tier === "Common" || item.tier === "Starter") && 
        !CUSTOM_EXCLUDED_ITEMS.has(item.name)
    );
    const commonPoolShuffled = getShuffledTierPool("Common", 0);
    
    // Calculate indices for each tier based on days passed
    const legendaryIndex = daysSinceStart % legendaryPool.length;
    const epicIndex = daysSinceStart % epicPool.length;
    const commonIndex = daysSinceStart % commonPoolShuffled.length;
    
    // Select based on determined tier
    if (selectedTier === "Legendary") {
        return legendaryPool[legendaryIndex].id;
    } else if (selectedTier === "Epic") {
        return epicPool[epicIndex].id;
    } else {
        return commonPoolShuffled[commonIndex].id;
    }
}

function getPoolProgress() {
    const daysSinceStart = getDaysSinceGameStart();
    
    const legendaryPool = getShuffledTierPool("Legendary", 0);
    const epicPool = getShuffledTierPool("Epic", 0);
    const commonPool = completeItemPool.filter(item => 
        (item.tier === "Common" || item.tier === "Starter") && 
        !CUSTOM_EXCLUDED_ITEMS.has(item.name)
    );
    
    return {
        legendaryIndex: daysSinceStart % legendaryPool.length,
        legendaryTotal: legendaryPool.length,
        epicIndex: daysSinceStart % epicPool.length,
        epicTotal: epicPool.length,
        commonIndex: daysSinceStart % commonPool.length,
        commonTotal: commonPool.length,
        daysSinceStart: daysSinceStart
    };
}

function displayItemPoolProgress() {
    const progress = getPoolProgress();
    const devPanel = document.getElementById('devPanel');
    
    if (!devPanel) return;
    
    let poolSection = document.getElementById('poolProgressSection');
    if (!poolSection) {
        poolSection = document.createElement('div');
        poolSection.id = 'poolProgressSection';
        poolSection.style.marginTop = '15px';
        poolSection.style.paddingTop = '15px';
        poolSection.style.borderTop = '1px solid #3c3c41';
        devPanel.appendChild(poolSection);
    }
    
    const legendaryPercent = Math.round((progress.legendaryIndex / progress.legendaryTotal) * 100);
    const epicPercent = Math.round((progress.epicIndex / progress.epicTotal) * 100);
    const commonPercent = Math.round((progress.commonIndex / progress.commonTotal) * 100);
    
    poolSection.innerHTML = `
        <div style="color: #c8aa6e; font-weight: bold; margin-bottom: 12px;">
            Daily Item Pool Cycling (Day ${progress.daysSinceStart + 1})
        </div>
        
        <div style="color: #a0a0a0; font-size: 11px; margin-bottom: 4px;">
            🟨 Legendary: ${progress.legendaryIndex}/${progress.legendaryTotal} (${legendaryPercent}%)
        </div>
        <div style="width: 100%; height: 12px; background: #1c1c22; border: 1px solid #3c3c41; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${legendaryPercent}%; height: 100%; background: #c8aa6e; transition: width 0.3s;"></div>
        </div>
        
        <div style="color: #a0a0a0; font-size: 11px; margin-bottom: 4px;">
            🟦 Epic: ${progress.epicIndex}/${progress.epicTotal} (${epicPercent}%)
        </div>
        <div style="width: 100%; height: 12px; background: #1c1c22; border: 1px solid #3c3c41; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${epicPercent}%; height: 100%; background: #b58900; transition: width 0.3s;"></div>
        </div>
        
        <div style="color: #a0a0a0; font-size: 11px; margin-bottom: 4px;">
            🟩 Common/Starter: ${progress.commonIndex}/${progress.commonTotal} (${commonPercent}%)
        </div>
        <div style="width: 100%; height: 12px; background: #1c1c22; border: 1px solid #3c3c41; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${commonPercent}%; height: 100%; background: #1c773e; transition: width 0.3s;"></div>
        </div>
    `;
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
    const dayId = getCurrentESTDate();
    
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

    // Get item using cycling method (no repeats)
    const itemId = getConsistentDailyItemId();
    secretItem = completeItemPool.find(item => item.id === itemId);

    // Handle streak logic
    let dailyHistory = getDailyHistory();
    
    // New day check
    if (dailyHistory.lastPlayedDay !== dayId) {
        if (dailyHistory.lastPlayedDay !== "") {
            const lastDate = new Date(dailyHistory.lastPlayedDay + 'T00:00:00-05:00');
            const currentDate = new Date(dayId + 'T00:00:00-05:00');
            const daysBetween = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

            // Break streak if missed a day or didn't win
            if (daysBetween > 1 || !dailyHistory.hasWonToday) {
                dailyHistory.currentStreak = 0;
            }
        }

        // Reset for new day
        dailyHistory.lastPlayedDay = dayId;
        dailyHistory.hasWonToday = false;
        dailyHistory.savedGuesses = [];
        saveDailyHistory(dailyHistory);
    }

    document.getElementById("devTarget").textContent = `${secretItem.name} (${secretItem.tier})`;
    
    // Display pool progress in dev panel
    displayItemPoolProgress();
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
    incrementDailyUserCount();
    
    
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

    const gameUrl = "https://null-magic-mantdle.lie8.workers.dev/";
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
        shareBtn.innerHTML = '🔗 Share Result';
        
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
// FIREBASE GLOBAL COUNTER
// ============================================

async function getDailyUserCount() {
    const dayId = getCurrentESTDate();
    try {
        const { doc, getDoc } = window.firebaseImports;
        const docRef = doc(window.db, 'daily_users', dayId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data().count;
        }
        return 0;
    } catch (error) {
        console.log('Firebase error:', error);
        // Fallback to localStorage if Firebase fails
        return parseInt(localStorage.getItem(`daily_users_${dayId}`) || 0);
    }
}

async function incrementDailyUserCount() {
    const dayId = getCurrentESTDate();
    try {
        const { doc, setDoc, increment } = window.firebaseImports;
        const docRef = doc(window.db, 'daily_users', dayId);
        
        await setDoc(docRef, { count: increment(1) }, { merge: true });
        await updateUserCountDisplay();
    } catch (error) {
        console.log('Firebase error:', error);
        // Fallback
        const current = parseInt(localStorage.getItem(`daily_users_${dayId}`) || 0);
        localStorage.setItem(`daily_users_${dayId}`, current + 1);
        await updateUserCountDisplay();
    }
}

async function updateUserCountDisplay() {
    const countElement = document.getElementById('userCountNumber');
    if (countElement) {
        const count = await getDailyUserCount();
        countElement.textContent = count;
    }
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
    updateUserCountDisplay();
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
