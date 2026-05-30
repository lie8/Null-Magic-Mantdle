/**
 * SHARED GAME LOGIC - NULL-MAGIC MANTDLE
 * Common functionality used across all game modes
 */

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const CONFIG = {
    PATCH_VERSION: "16.11.1",
    API_URL: null, // Set in init
    IMG_BASE: null, // Set in init
    DEV_PASSWORD: "teemo123"
};

CONFIG.API_URL = `https://ddragon.leagueoflegends.com/cdn/${CONFIG.PATCH_VERSION}/data/en_US/item.json`;
CONFIG.IMG_BASE = `https://ddragon.leagueoflegends.com/cdn/${CONFIG.PATCH_VERSION}/img/item/`;

// ============================================
// DATA MAPS
// ============================================

const ITEM_GROUP_MAP = {
    "Annul": ["Verdant Barrier", "Banshee's Veil", "Edge of Night"],
    "Blight": ["Blighting Jewel", "Bloodletter's Curse", "Cryptbloom", "Terminus", "Void Staff"],
    "Boots": ["Berserker's Greaves", "Boots", "Boots of Swiftness", "Ionian Boots of Lucidity", "Mercury's Treads", "Plated Steelcaps", "Slightly Magical Boots", "Sorcerer's Shoes", "Symbiotic Soles", "Synchronized Souls", "Zephyr"],
    "Dirk": ["Serrated Dirk"],
    "Elixir": ["Elixir of Iron", "Elixir of Sorcery", "Elixir of Wrath"],
    "Eternity": ["Catalyst of Aeons", "Rod of Ages"],
    "Fatality": ["Last Whisper", "Black Cleaver", "Lord Dominik's Regards", "Mortal Reminder", "Serylda's Grudge", "Terminus"],
    "Glory": ["Dark Seal", "Mejai's Soulstealer"],
    "Guardian": ["Guardian's Blade", "Guardian's Hammer", "Guardian's Horn", "Guardian's Orb"],
    "Hydra": ["Tiamat", "Profane Hydra", "Ravenous Hydra", "Stridebreaker", "Titanic Hydra"],
    "Immolate": ["Bami's Cinder", "Sunfire Aegis", "Hollow Radiance"],
    "Jungle / Support": ["Bounty of Worlds", "Bloodsong", "Celestial Opposition", "Dream Maker", "Gustwalker Hatchling", "Mosstomper Seedling", "Scorchclaw Pup", "Solstice Sleigh", "Zaz'Zak's Realmspike"],
    "Lifeline": ["Archangel's Staff", "Hexdrinker", "Immortal Shieldbow", "Maw of Malmortius", "Seraph's Embrace", "Sterak's Gage", "Protoplasm Harness"],
    "Manaflow": ["Archangel's Staff", "Fimbulwinter", "Manamune", "Muramana", "Seraph's Embrace", "Tear of the Goddess", "Winter's Approach"],
    "Momentum": ["Dead Man's Plate", "Trailblazer"],
    "Potion": ["Health Potion", "Refillable Potion"],
    "Quicksilver": ["Mercurial Scimitar", "Quicksilver Sash"],
    "Sightstone": ["Watchful Wardstone", "Vigilant Wardstone"],
    "Spellblade": ["Sheen", "Bloodsong", "Iceborn Gauntlet", "Lich Bane", "Trinity Force", "Dusk and Dawn", "Essence Reaver"],
    "Starter": ["Doran's Blade", "Doran's Ring", "Doran's Shield", "Gustwalker Hatchling", "Mosstomper Seedling", "Scorchclaw Pup", "World Atlas", "Runic Compass"],
    "Stasis": ["Seeker's Armguard", "Shattered Armguard", "Zhonya's Hourglass"]
};

const ITEM_CLASS_MAPS = {
    Mage: ["Archangel's Staff", "Banshee's Veil", "Bloodletter's Curse", "Blackfire Torch", "Cosmic Drive", "Cryptbloom", "Hextech Gunblade", "Hextech Rocketbelt", "Horizon Focus", "Liandry's Torment", "Lich Bane", "Luden's Companion", "Malignance", "Morellonomicon", "Nashor's Tooth", "Perplexity", "Rabadon's Deathcap", "Riftmaker", "Rite of Ruin", "Rod of Ages", "Rylai's Crystal Scepter", "Shadowflame", "Stormsurge", "Sword of Blossoming Dawn", "Void Staff", "Wordless Promise", "Zhonya's Hourglass", "Mejai's Soulstealer", "Actualizer", "Luden's Echo"],
    Support: ["Abyssal Mask", "Ardent Censer", "Chemtech Putrifier", "Dawncore", "Echoes of Helia", "Frozen Heart", "Imperial Mandate", "Knight's Vow", "Locket of the Iron Solari", "Mikael's Blessing", "Moonstone Renewer", "Redemption", "Rite of Ruin", "Shurelya's Battlesong", "Staff of Flowing Water", "Sword of Blossoming Dawn", "Thornmail", "Wordless Promise", "Zeke's Convergence", "Whispering Circlet", "Morellonomicon", "Bandlepipes"],
    Tank: ["Abyssal Mask", "Anathema's Chains", "Bloodletter's Curse", "Dead Man's Plate", "Force of Nature", "Frozen Heart", "Heartsteel", "Hollow Radiance", "Iceborn Gauntlet", "Jak'Sho, The Protean", "Kaenic Rookern", "Knight's Vow", "Locket of the Iron Solari", "Overlord's Bloodmail", "Randuin's Omen", "Spirit Visage", "Sterak's Gage", "Sunfire Aegis", "Thornmail", "Titanic Hydra", "Trailblazer", "Unending Despair", "Warmog's Armor", "Winter's Approach", "Zeke's Convergence", "Bandlepipes", "Protoplasm Harness"],
    Marksman: ["Atma's Reckoning", "Blade of the Ruined King", "Bloodthirster", "Essence Reaver", "Guardian Angel", "Guinsoo's Rageblade", "Immortal Shieldbow", "Infinity Edge", "Kraken Slayer", "Lord Dominik's Regards", "Manamune", "Maw of Malmortius", "Mercurial Scimitar", "Mortal Reminder", "Nashor's Tooth", "Navori Flickerblade", "Phantom Dancer", "Rapid Firecannon", "Runaan's Hurricane", "Statikk Shiv", "Terminus", "The Collector", "Wit's End", "Yun Tal Wildarrows", "Zephyr", "Stormrazor", "Fiendhunter Bolts", "Hexoptics C44"],
    Assassin: ["Axiom Arc", "Umbral Glaive", "Chempunk Chainsword", "Edge of Night", "Guardian Angel", "Hellfire Hatchet", "Hextech Gunblade", "Hubris", "Manamune", "Maw of Malmortius", "Opportunity", "Profane Hydra", "Serpent's Fang", "Serylda's Grudge", "Spectral Cutlass", "The Collector", "Voltaic Cyclosword", "Youmuu's Ghostblade", "Bastionbreaker"],
    Fighter: ["Atma's Reckoning", "Black Cleaver", "Blade of the Ruined King", "Chempunk Chainsword", "Death's Dance", "Dead Man's Plate", "Eclipse", "Experimental Hexplate", "Guardian Angel", "Hullbreaker", "Iceborn Gauntlet", "Manamune", "Maw of Malmortius", "Overlord's Bloodmail", "Ravenous Hydra", "Spear of Shojin", "Sterak's Gage", "Stridebreaker", "Sundered Sky", "Terminus", "Titanic Hydra", "Trinity Force", "Wit's End", "Zephyr", "Dusk and Dawn", "Endless Hunger", "Bloodthirster"]
};

const EXCLUDED_BOOT_NAMES = ["Zephyr", "Gunmetal Greaves", "Dreadnought Striders", "Relentless Pursuit", "Armored Advance", "Noxian Fervor", "Noxian Gait", "Noxian Might", "Immortal Path", "Spellslinger's Shoes", "Swiftmarch", "Crimson Lucidity", "Chainlaced Crushers"];

const EXCLUDED_ARENA_NAMES = ["Prismatic", "Anima Visage", "Perplexity", "Rite of Ruin", "Sword of Blossoming Dawn", "Wordless Promise", "Atma's Reckoning", "Trailblazer", "Symbiotic Soles", "Virtue of the Triforce", "Cyclonic Slicers", "Fish Tank", "Radiant Virtue"];

const CUSTOM_EXCLUDED_ITEMS = new Set(["Black Hole Gauntlet", "Cloak of Starry Night", "Crown of the Shattered Queen", "Cruelty", "Darksteel Talons", "Decapitator", "Demon King's Crown", "Demonic Embrace", "Detonation Orb", "Diamond-Tipped Spear", "Divine Sunderer", "Dragonheart", "Duskblade of Draktharr", "Eleisa's Miracle", "Empyrean Promise", "Everfrost", "Flesheater", "Force of Entropy", "Fulmination", "Galeforce", "Gambler's Blade", "Gargoyle Stoneplate", "Goredrinker", "Hamstringer", "Hemomancer's Helm", "Hexbolt Companion", "Innervating Locket", "Kinkou Jitte", "Lightning Rod", "Mirage Blade", "Moonflair Spellblade", "Night Harvester", "Prowler's Claw", "Puppeteer", "Pyromancer's Cloak", "Radiant Virtue", "Reality Fracture", "Reaper's Toll", "Regicide", "Reverberation", "Runecarver", "Sanguine Gift", "Shield of Molten Stone", "Sword of the Divine", "Talisman of Ascension", "Turbo Chemtank", "Twilight's Edge", "Twin Mask", "Veigar's Talisman of Ascension"]);

const EXCLUDED_NAME_KEYWORDS = ["AHR-", "Gangplank Placeholder", "Rune Weaver", "Bounty", "Scorchclaw", "Gustwalker", "Mosstomper", "Guardian's "];

const FORCE_INCLUDE_ITEMS = new Set([
    "Umbral Glaive" 
]);

const SEARCH_SHORTCUTS = {
    "bork": "bladeoftheruinedking",
    "botrk": "bladeoftheruinedking",
    "dcap": "rabadonsdeathcap",
    "qss": "quicksilversash",
    "ldr": "lorddominiksregards",
    "bv": "bansheesveil",
    "bc": "bloodletterscurse",
    "bg": "berserkersgreaves",
    "sg": "seryldasgrudge",
    "wa": "wintersapproach",
    "dmp": "deadmansplate",
    "bt": "bloodthirster",
    "roa": "rodofages"
};

// ============================================
// GLOBAL STATE
// ============================================

let completeItemPool = [];
let indexedItemMap = {};
let secretItem = null;
let activeGuesses = [];
let totalGuessesCount = 0;

// ============================================
// ITEM PROCESSING FUNCTIONS
// ============================================

function getItemGroupName(itemName) {
    for (const [groupName, items] of Object.entries(ITEM_GROUP_MAP)) {
        if (items.includes(itemName)) {
            return groupName;
        }
    }
    return "None";
}

function processItemStats(details) {
    const statsList = [];
    const s = details.stats || {};
    const text = details.description ? details.description.toLowerCase() : "";

    if (s.FlatPhysicalDamageMod > 0) statsList.push("AD");
    if (s.FlatMagicDamageMod > 0) statsList.push("AP");
    if (s.FlatArmorMod > 0) statsList.push("Armor");
    if (s.FlatSpellBlockMod > 0) statsList.push("MR");
    if (s.PercentAttackSpeedMod > 0) statsList.push("Attack Speed");
    if (s.FlatCritChanceMod > 0) statsList.push("Crit");
    if (s.FlatMPPoolMod > 0 || s.FlatMPMod > 0) statsList.push("Mana");
    if (s.FlatMovementSpeedMod > 0 || s.PercentMovementSpeedMod > 0) statsList.push("Move Speed");
    if (s.FlatHPPoolMod > 0) statsList.push("Health");

    const statsBlockMatch = text.match(/<stats>([\s\S]*?)<\/stats>/);
    if (statsBlockMatch) {
        const statsSectionText = statsBlockMatch[1];
        if (statsSectionText.includes("ability haste")) statsList.push("Haste");
        if (statsSectionText.includes("armor penetration") || statsSectionText.includes("armor pen")) statsList.push("Armor Pen");
        if (statsSectionText.includes("magic penetration") || statsSectionText.includes("magic pen")) statsList.push("Magic Pen");
        if (statsSectionText.includes("lethality")) statsList.push("Lethality");
        if (statsSectionText.includes("life steal") || statsSectionText.includes("lifesteal")) statsList.push("Lifesteal");
        if (statsSectionText.includes("omnivamp")) statsList.push("Omnivamp");
        if (statsSectionText.includes("base health regen") || statsSectionText.includes("health regeneration")) statsList.push("Health Regen");
        if (statsSectionText.includes("base mana regen") || statsSectionText.includes("mana regeneration")) statsList.push("Mana Regen");
        if (statsSectionText.includes("heal and shield power")) statsList.push("Heal/Shield Power");
        if (statsSectionText.includes("tenacity")) statsList.push("Tenacity");
    }

    const uniqueStats = [...new Set(statsList)];
    return uniqueStats.length > 0 ? uniqueStats : ["None"];
}

function deriveItemClass(itemName, tags) {
    if (itemName.includes("Doran's")) return ["Doran's Item"];
    if (tags.includes("Boots") || itemName.includes("Boots") || itemName === "Plated Steelcaps" || itemName === "Mercury's Treads") {
        return ["Boots"];
    }

    const assignedClasses = [];
    const lowerItemName = itemName.toLowerCase();

    for (const [className, itemNamesList] of Object.entries(ITEM_CLASS_MAPS)) {
        const lowerClassList = itemNamesList.map(name => name.toLowerCase());
        if (lowerClassList.includes(lowerItemName)) {
            assignedClasses.push(className);
        }
    }
    return assignedClasses.length > 0 ? assignedClasses : ["N/A"];
}

function shouldExcludeItem(details, data) {
    const itemName = details.name;
    const tags = details.tags || [];
    const descLower = details.description ? details.description.toLowerCase() : "";

    if (FORCE_INCLUDE_ITEMS.has(itemName)) return false;

    // Core API flags
    if (!details.maps || details.maps["11"] !== true) return true;
    if (details.inStore === false || details.hideFromAll === true) return true;
    if (details.gold && details.gold.purchasable === false) return true;
    if (details.requiredChampion || details.requiredAlly) return true;

    // Game mode filters
    if (descLower.includes("arena") || descLower.includes("nexus blitz") ||
        descLower.includes("prismatic item") || descLower.includes("anvil")) return true;

    // Exclusion lists
    if (CUSTOM_EXCLUDED_ITEMS.has(itemName)) return true;
    if (EXCLUDED_ARENA_NAMES.some(name => itemName.includes(name))) return true;
    if (EXCLUDED_NAME_KEYWORDS.some(kw => itemName.includes(kw))) return true;

    // Consumables and vision
    if (tags.includes("Consumable") || tags.includes("Vision") ||
        ["Potion", "Elixir", "Ward", "Scarecrow"].some(kw => itemName.includes(kw))) return true;

    // Tier 3 boots
    if (descLower.includes("level 15 required") || descLower.includes("requires level 15") ||
        descLower.includes("blessing of noxus") || descLower.includes("feats of strength")) return true;

    if (EXCLUDED_BOOT_NAMES.some(bootName => itemName.includes(bootName))) return true;

    // Boot recursion check
    if (details.from && tags.includes("Boots")) {
        for (const parentId of details.from) {
            const parentItem = data[parentId];
            if (parentItem?.from) {
                for (const grandParentId of parentItem.from) {
                    if (grandParentId === "1001" || grandParentId === "2422") return true;
                }
            }
        }
    }

    return false;
}
function determineItemTier(itemName, totalGold, tags, itemClasses, details) {
    if (itemName.includes("Doran's")) return "Starter";
    if (!itemClasses.includes("Boots") && !itemClasses.includes("N/A")) return "Legendary";
    if (totalGold >= 2000) return "Legendary";

    const commonBaseItems = ["Slightly Magical Boots", "Boots", "B.F. Sword", "B. F. Sword", "Needlessly Large Rod", "Long Sword", "Dagger", "Ruby Crystal", "Amplifying Tome", "Faerie Charm", "Sapphire Crystal", "Cloth Armor", "Null-Magic Mantle"];
    if (commonBaseItems.includes(itemName)) return "Common";

    if (tags.includes("Lane") || tags.includes("Jungle") ||
        (totalGold <= 450 && (tags.includes("HealthRegen") || tags.includes("ManaRegen")))) {
        return "Starter";
    }

    if (totalGold >= 900 || tags.includes("Boots") || (totalGold > 500 && details.from?.length > 0)) {
        return "Epic";
    }

    return "Common";
}

function getItemAcronym(name) {
    return name.toLowerCase()
        .split(/[\s'-]+/)
        .filter(word => word.length > 0)
        .map(word => word.charAt(0))
        .join('');
}

// ============================================
// API & INITIALIZATION
// ============================================

async function initializeGameEngine() {
    try {
        const response = await fetch(CONFIG.API_URL);
        const rawPayload = await response.json();
        const data = rawPayload.data;

        completeItemPool = [];
        indexedItemMap = data;

        const processedNames = new Set();

        for (const [id, details] of Object.entries(data)) {
            const itemName = details.name;

            if (processedNames.has(itemName)) continue;
            if (shouldExcludeItem(details, data)) continue;

            processedNames.add(itemName);

            const tags = details.tags || [];
            const totalGold = details.gold ? details.gold.total : 0;
            const descLower = details.description ? details.description.toLowerCase() : "";

            const itemClasses = deriveItemClass(itemName, tags);
            const itemTier = determineItemTier(itemName, totalGold, tags, itemClasses, details);

            const cleanRecipe = [];
            if (details.from) {
                const uniqueSet = new Set();
                details.from.forEach(childId => {
                    if (data[childId]) uniqueSet.add(data[childId].name);
                });
                cleanRecipe.push(...uniqueSet);
            }

            const hasActiveEffect = /\bactive\b/.test(descLower);

            completeItemPool.push({
                id: id,
                name: itemName,
                tier: itemTier,
                class: itemClasses,
                group: getItemGroupName(itemName),
                cost: totalGold,
                stats: processItemStats(details),
                hasActive: hasActiveEffect,
                recipe: cleanRecipe,
                imgUrl: CONFIG.IMG_BASE + details.image.full
            });
        }

        completeItemPool.sort((a, b) => a.name.localeCompare(b.name));

        document.getElementById("loadingText").style.display = "none";
        document.getElementById("gameplayArea").style.display = "flex";

        return true;

    } catch (error) {
        console.error("Initialization error:", error);
        document.getElementById("loadingText").textContent = "API error. Please refresh the page.";
        return false;
    }
}

// ============================================
// UI RENDERING
// ============================================

function createAnimatedCell(htmlContent, feedbackClass, staggerSeconds) {
    const td = document.createElement('td');

    const container = document.createElement('div');
    container.classList.add('flip-container');

    const front = document.createElement('div');
    front.classList.add('card-front');
    front.innerHTML = `<span>?</span>`;

    const back = document.createElement('div');
    back.classList.add('card-back', feedbackClass);
    if (typeof htmlContent === 'string') {
        back.innerHTML = htmlContent;
    } else {
        back.appendChild(htmlContent);
    }

    container.appendChild(front);
    container.appendChild(back);
    td.appendChild(container);

    setTimeout(() => {
        container.classList.add('flip-animate');
    }, staggerSeconds * 1000);

    return td;
}

function renderGuessRow(guess, secret, delay = 0) {
    const row = document.createElement('tr');
    const step = 0.30;

    // Item Info
    const itemWrapper = document.createElement('div');
    itemWrapper.classList.add('item-cell');
    const icon = document.createElement('img');
    icon.src = guess.imgUrl;
    const label = document.createElement('span');
    label.textContent = guess.name;
    itemWrapper.appendChild(icon);
    itemWrapper.appendChild(label);

    const nameClass = (guess.name === secret.name) ? 'correct' : 'wrong';
    row.appendChild(createAnimatedCell(itemWrapper, nameClass, delay));
    delay += step;

    // Rarity
    const rarityClass = (guess.tier === secret.tier) ? 'correct' : 'wrong';
    row.appendChild(createAnimatedCell(`<span>${guess.tier}</span>`, rarityClass, delay));
    delay += step;

    // Class Pool
    let classClass = 'wrong';
    if (JSON.stringify(guess.class.sort()) === JSON.stringify(secret.class.sort())) {
        classClass = 'correct';
    } else if (guess.class.some(c => secret.class.includes(c)) && !guess.class.includes("N/A") && !guess.class.includes("Doran's Item")) {
        classClass = 'partial';
    }
    row.appendChild(createAnimatedCell(`<span>${guess.class.join(', ')}</span>`, classClass, delay));
    delay += step;

    // Gold Value
    let goldContent = `<span>${guess.cost}</span>`;
    const goldClass = (guess.cost === secret.cost) ? 'correct' : 'wrong';
    if (guess.cost !== secret.cost) {
        const arrow = guess.cost < secret.cost ? ' ⬆️' : ' ⬇️';
        goldContent = `<span>${guess.cost}${arrow}</span>`;
    }
    row.appendChild(createAnimatedCell(goldContent, goldClass, delay));
    delay += step;

    // Primary Stats
    let statsClass = 'wrong';
    if (JSON.stringify(guess.stats.sort()) === JSON.stringify(secret.stats.sort())) {
        statsClass = 'correct';
    } else if (guess.stats.some(s => secret.stats.includes(s)) && !guess.stats.includes("None")) {
        statsClass = 'partial';
    }
    row.appendChild(createAnimatedCell(`<span>${guess.stats.join(', ')}</span>`, statsClass, delay));
    delay += step;

    // Active
    const activeClass = (guess.hasActive === secret.hasActive) ? 'correct' : 'wrong';
    const activeText = guess.hasActive ? "Yes" : "No";
    row.appendChild(createAnimatedCell(`<span>${activeText}</span>`, activeClass, delay));
    delay += step;

    // Common Components
    let recipeText = "";
    let recipeClass = 'wrong';
    if (guess.name === secret.name) {
        recipeText = guess.recipe.length > 0 ? guess.recipe.join(', ') : "Base Item";
        recipeClass = 'correct';
    } else if (secret.recipe.includes(guess.name)) {
        recipeText = guess.name;
        recipeClass = 'partial';
    } else {
        const sharedComponents = guess.recipe.filter(r => secret.recipe.includes(r));
        if (sharedComponents.length > 0) {
            recipeText = sharedComponents.join(', ');
            recipeClass = 'partial';
        } else {
            recipeText = guess.recipe.length > 0 ? guess.recipe.join(', ') : "Base Item";
            recipeClass = 'wrong';
        }
    }
    row.appendChild(createAnimatedCell(`<span>${recipeText}</span>`, recipeClass, delay));
    delay += step;

    // Item Group
    let groupClass = 'wrong';
    const guessGroup = (guess.group || "").trim().toLowerCase();
    const secretGroup = (secret.group || "").trim().toLowerCase();
    const isGuessNone = (guessGroup === "" || guessGroup === "none");
    const isSecretNone = (secretGroup === "" || secretGroup === "none");

    if (guessGroup === secretGroup || (isGuessNone && isSecretNone)) {
        groupClass = 'correct';
    }
    row.appendChild(createAnimatedCell(`<span>${guess.group}</span>`, groupClass, delay));

    return { row, finalDelay: delay };
}

// ============================================
// INPUT & SEARCH
// ============================================

function setupAutocomplete(inputElement, suggestionsElement, onSelect) {
    inputElement.addEventListener('input', () => {
        const value = inputElement.value.toLowerCase().trim();
        suggestionsElement.innerHTML = '';
        if (!value) return;

        const cleanValue = value.replace(/[\s'-]/g, '');

        const scoredItems = completeItemPool.map(item => {
            const lowerName = item.name.toLowerCase();
            const cleanName = lowerName.replace(/[\s'-]/g, '');

            let score = 0;

            if (lowerName.startsWith(value)) {
                score = 1;
            } else if (lowerName.includes(` ${value}`) || lowerName.includes(`'${value}`) || lowerName.includes(`-${value}`)) {
                score = 2;
            } else if (lowerName.includes(value)) {
                score = 3;
            } else if (value.length >= 2) {
                const autoAcronym = getItemAcronym(item.name);
                const matchesSlang = SEARCH_SHORTCUTS[cleanValue] && cleanName === SEARCH_SHORTCUTS[cleanValue];

                if (autoAcronym.startsWith(value) || matchesSlang) {
                    score = 4;
                }
            }
            return { item, score };
        });

        const filtered = scoredItems
            .filter(match => match.score > 0)
            .sort((a, b) => {
                if (a.score !== b.score) return a.score - b.score;
                return a.item.name.localeCompare(b.item.name);
            })
            .map(match => match.item);

        filtered.slice(0, 8).forEach(item => {
            const div = document.createElement('div');
            div.classList.add('suggestion-item');

            const img = document.createElement('img');
            img.src = item.imgUrl;

            const span = document.createElement('span');
            span.textContent = item.name;

            div.appendChild(img);
            div.appendChild(span);

            div.addEventListener('click', () => {
                onSelect(item);
                inputElement.value = '';
                suggestionsElement.innerHTML = '';
            });
            suggestionsElement.appendChild(div);
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target !== inputElement) {
            suggestionsElement.innerHTML = '';
        }
    });
}

// ============================================
// SETTINGS & MODALS
// ============================================

function initSettings() {
    const colorblindToggle = document.getElementById('colorblindToggle');
    
    // Colorblind mode
    const storedColorblind = localStorage.getItem('colorblindMode') === 'true';
    if (colorblindToggle) {
        colorblindToggle.checked = storedColorblind;
        if (storedColorblind) {
            document.body.classList.add('colorblind-mode');
        }

        colorblindToggle.addEventListener('change', (e) => {
            const isActive = e.target.checked;
            if (isActive) {
                document.body.classList.add('colorblind-mode');
            } else {
                document.body.classList.remove('colorblind-mode');
            }
            localStorage.setItem('colorblindMode', isActive);
        });
    }
}

function initModals() {
    // Settings modal
    const settingsModal = document.getElementById('settingsModal');
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');

    if (openSettingsBtn && settingsModal && closeSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
        closeSettingsBtn.addEventListener('click', () => settingsModal.style.display = 'none');
    }

    // Patch notes modal
    const patchNotesModal = document.getElementById('patchNotesModal');
    const patchNotesBtn = document.getElementById('patchNotesBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (patchNotesBtn && patchNotesModal && closeModalBtn) {
        patchNotesBtn.addEventListener('click', () => {
            if (window.renderPatchNotes) window.renderPatchNotes();
            patchNotesModal.style.display = 'flex';
        });
        closeModalBtn.addEventListener('click', () => patchNotesModal.style.display = 'none');
    }

    // Close modals on backdrop click
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.style.display = 'none';
        if (e.target === patchNotesModal) patchNotesModal.style.display = 'none';
    });
}

function refreshStatsDisplay() {
    // This will be overridden in mode-specific files
    // Placeholder for flexibility
}

function initDevPanel() {
    const toggleDevBtn = document.getElementById('toggleDevBtn');
    const devPanel = document.getElementById('devPanel');

    if (toggleDevBtn && devPanel) {
        toggleDevBtn.addEventListener('click', () => {
            if (devPanel.style.display === 'flex') {
                devPanel.style.display = 'none';
                toggleDevBtn.style.borderColor = '#3c3c41';
                toggleDevBtn.style.color = '#a0a0a0';
            } else {
                const challenge = prompt("Enter password:");
                if (challenge === CONFIG.DEV_PASSWORD) {
                    devPanel.style.display = 'flex';
                    toggleDevBtn.style.borderColor = '#c8aa6e';
                    toggleDevBtn.style.color = '#c8aa6e';
                } else if (challenge !== null) {
                    alert("Access Denied.");
                }
            }
        });
    }
}
