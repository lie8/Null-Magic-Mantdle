/**
 * INFINITE MODE - NULL-MAGIC MANTDLE
 * Mode-specific logic for infinite play with streaks
 */

// ============================================
// INFINITE MODE STATE
// ============================================

const STREAK_REQUIREMENT = 6; // Must win in 6 or fewer guesses to maintain streak

// ============================================
// STORAGE MANAGEMENT
// ============================================

function getInfiniteHistory() {
    let history = JSON.parse(localStorage.getItem('mantdleInfiniteHistory'));
    if (!history) {
        history = {
            currentStreak: 0,
            maxStreak: 0,
            hasFinishedRound: false,
            savedGuesses: [],
            currentSecretId: ""
        };
        localStorage.setItem('mantdleInfiniteHistory', JSON.stringify(history));
    }
    return history;
}

function saveInfiniteHistory(history) {
    localStorage.setItem('mantdleInfiniteHistory', JSON.stringify(history));
}

function saveInfiniteGameState() {
    const history = getInfiniteHistory();
    history.savedGuesses = activeGuesses.map(g => g.id);
    saveInfiniteHistory(history);
}

function syncInfiniteDashboard() {
    const history = getInfiniteHistory();
    document.getElementById('infCurrentStreak').textContent = history.currentStreak;
    document.getElementById('infMaxStreak').textContent = history.maxStreak;
}

// ============================================
// ITEM SELECTION
// ============================================

function pickWeightedSecretItem() {
    const roll = Math.floor(Math.random() * 100) + 1;
    let targetPool = [];

    if (roll <= 75) {
        targetPool = completeItemPool.filter(i => i.tier === "Legendary");
    } else if (roll <= 95) {
        targetPool = completeItemPool.filter(i => i.tier === "Epic");
    } else {
        targetPool = completeItemPool.filter(i => i.tier === "Common" || i.tier === "Starter");
    }

    if (targetPool.length === 0) targetPool = completeItemPool;
    secretItem = targetPool[Math.floor(Math.random() * targetPool.length)];

    document.getElementById("devTarget").textContent = `${secretItem.name} (${secretItem.tier})`;
}

// ============================================
// ROUND MANAGEMENT
// ============================================

function initInfiniteRound() {
    const history = getInfiniteHistory();
    syncInfiniteDashboard();

    // Reset UI
    const resultsBody = document.getElementById('resultsBody');
    const input = document.getElementById('itemInput');
    const suggestions = document.getElementById('suggestions');
    const winMessage = document.getElementById('winMessage');
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    const revealBtn = document.getElementById('revealBtn');

    resultsBody.innerHTML = '';
    activeGuesses = [];
    totalGuessesCount = 0;
    input.disabled = false;
    input.value = '';
    suggestions.innerHTML = '';
    winMessage.style.display = 'none';
    nextRoundBtn.style.display = 'none';

    revealBtn.disabled = false;
    revealBtn.style.opacity = '1';

    // Restore or pick secret item
    if (history.currentSecretId) {
        secretItem = completeItemPool.find(item => item.id === history.currentSecretId);
    }

    if (!secretItem) {
        pickWeightedSecretItem();
        history.currentSecretId = secretItem.id;
        history.hasFinishedRound = false;
        history.savedGuesses = [];
        saveInfiniteHistory(history);
    }

    document.getElementById("devTarget").textContent = `${secretItem.name} (${secretItem.tier})`;

    // Restore saved guesses
    if (history.savedGuesses && history.savedGuesses.length > 0) {
        history.savedGuesses.forEach(itemId => {
            const historicalItem = completeItemPool.find(i => i.id === itemId);
            if (historicalItem) {
                renderGuessRowWithoutAnimation(historicalItem);
            }
        });
    }

    // Handle finished state
    if (history.hasFinishedRound) {
        input.disabled = true;
        nextRoundBtn.style.display = 'block';
        revealBtn.style.opacity = '0.3';
        revealBtn.disabled = true;

        const isWin = activeGuesses.some(g => g.name === secretItem.name);
        if (isWin) {
            const trackingWord = totalGuessesCount === 1 ? "guess" : "guesses";
            winMessage.textContent = `🎉 Round Completed! Found ${secretItem.name} in ${totalGuessesCount} ${trackingWord}!`;
        } else {
            winMessage.textContent = `👁️ Revealed Answer: The target item was ${secretItem.name}.`;
        }
        winMessage.style.display = 'block';
    }
}

function renderGuessRowWithoutAnimation(guess) {
    activeGuesses.push(guess);
    totalGuessesCount++;

    const resultsBody = document.getElementById('resultsBody');
    const { row } = renderGuessRow(guess, secretItem, 0);
    resultsBody.insertBefore(row, resultsBody.firstChild);
}

// ============================================
// GUESS SUBMISSION
// ============================================

function submitInfiniteGuess(guess) {
    totalGuessesCount++;

    const resultsBody = document.getElementById('resultsBody');
    const input = document.getElementById('itemInput');
    const winMessage = document.getElementById('winMessage');
    const nextRoundBtn = document.getElementById('nextRoundBtn');

    const { row, finalDelay } = renderGuessRow(guess, secretItem);
    resultsBody.insertBefore(row, resultsBody.firstChild);

    activeGuesses.push(guess);
    saveInfiniteGameState();

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
            input.disabled = true;
            nextRoundBtn.style.display = 'block';

            const history = getInfiniteHistory();
            if (!history.hasFinishedRound) {
                history.hasFinishedRound = true;

                if (totalGuessesCount <= STREAK_REQUIREMENT) {
                    history.currentStreak++;
                    if (history.currentStreak > history.maxStreak) {
                        history.maxStreak = history.currentStreak;
                    }
                } else {
                    history.currentStreak = 0;
                    setTimeout(() => {
                        alert(`You found it! But since it took more than ${STREAK_REQUIREMENT} guesses, your streak has reset.`);
                    }, 500);
                }

                saveInfiniteHistory(history);
                syncInfiniteDashboard();
            }
        }, (finalDelay + 0.6) * 1000);
    }
}

// ============================================
// BUTTON HANDLERS
// ============================================

function setupInfiniteControls() {
    const resetBtn = document.getElementById('resetBtn');
    const revealBtn = document.getElementById('revealBtn');
    const nextRoundBtn = document.getElementById('nextRoundBtn');

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const confirmReset = confirm("Reset the board and lose your current streak?");
            if (!confirmReset) return;

            const history = getInfiniteHistory();
            history.currentStreak = 0;
            history.currentSecretId = "";
            history.hasFinishedRound = false;
            history.savedGuesses = [];
            saveInfiniteHistory(history);

            secretItem = null;
            initInfiniteRound();
        });
    }

    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            const history = getInfiniteHistory();
            if (history.hasFinishedRound) return;

            const confirmReveal = confirm("Reveal the answer? This will reset your streak to zero.");
            if (!confirmReveal) return;

            history.currentStreak = 0;
            history.hasFinishedRound = true;
            saveInfiniteHistory(history);

            syncInfiniteDashboard();

            const winMessage = document.getElementById('winMessage');
            const input = document.getElementById('itemInput');

            winMessage.textContent = `👁️ Revealed Answer: The target item was ${secretItem.name}.`;
            winMessage.style.display = 'block';
            input.disabled = true;
            nextRoundBtn.style.display = 'block';
        });
    }

    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', () => {
            const history = getInfiniteHistory();
            history.currentSecretId = "";
            history.hasFinishedRound = false;
            history.savedGuesses = [];
            saveInfiniteHistory(history);

            secretItem = null;
            initInfiniteRound();
        });
    }
}

// ============================================
// DRAGGABLE LEGEND
// ============================================

function initDraggableLegend() {
    const colorLegend = document.getElementById('colorLegend');
    const legendToggle = document.getElementById('legendToggle');
    const closeLegendBtn = document.getElementById('closeLegendBtn');

    if (!colorLegend) return;

    makeElementDraggable(colorLegend);

    if (legendToggle) {
        legendToggle.addEventListener('change', () => {
            if (legendToggle.checked) {
                colorLegend.style.display = 'block';
                localStorage.setItem('showColorLegend', 'true');
            } else {
                colorLegend.style.display = 'none';
                localStorage.setItem('showColorLegend', 'false');
            }
        });
    }

    if (closeLegendBtn) {
        closeLegendBtn.addEventListener('click', () => {
            colorLegend.style.display = 'none';
            if (legendToggle) legendToggle.checked = false;
            localStorage.setItem('showColorLegend', 'false');
        });
    }

    // Load saved state
    if (localStorage.getItem('showColorLegend') === 'false') {
        if (legendToggle) legendToggle.checked = false;
        colorLegend.style.display = 'none';
    } else {
        if (legendToggle) legendToggle.checked = true;
        colorLegend.style.display = 'block';
    }
}

function makeElementDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(elmnt.id + "Header");

    if (header) {
        header.onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        let topPos = elmnt.offsetTop - pos2;
        let leftPos = elmnt.offsetLeft - pos1;

        // Boundary constraints
        if (topPos < 0) topPos = 0;
        if (leftPos < 0) leftPos = 0;
        if (topPos > window.innerHeight - elmnt.offsetHeight) {
            topPos = window.innerHeight - elmnt.offsetHeight;
        }
        if (leftPos > window.innerWidth - elmnt.offsetWidth) {
            leftPos = window.innerWidth - elmnt.offsetWidth;
        }

        elmnt.style.top = topPos + "px";
        elmnt.style.left = leftPos + "px";
        elmnt.style.bottom = "auto";
        elmnt.style.right = "auto";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// ============================================
// INITIALIZATION
// ============================================

async function initInfiniteMode() {
    const success = await initializeGameEngine();
    if (!success) return;

    initInfiniteRound();
    initSettings();
    initModals();
    initDevPanel();
    setupInfiniteControls();
    initDraggableLegend();

    const input = document.getElementById('itemInput');
    const suggestions = document.getElementById('suggestions');

    setupAutocomplete(input, suggestions, (item) => {
        submitInfiniteGuess(item);
    });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInfiniteMode);
} else {
    initInfiniteMode();
}
