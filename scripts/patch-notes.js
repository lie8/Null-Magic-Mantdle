/**
 * PATCH NOTES CONFIGURATION
 * Shared changelog across all game modes
 */

const PATCH_NOTES = [
    {
        version: "Future Plans/Ideas",
        changes: [
            "Better Background and Graphics",,
            "Better Mobile Support",
            "Gamemode with arena/aram items/augments?",
            "Gamemode for runes?",
            "Support for different languages"
        ]
    },
    {
        version: "v1.3.0",
        changes: [
            "Updated to League version 26.13.1 (updated Imperial Mandate recipe)"

        ]
    },
    {
        version: "v1.2.0",
        changes: [
            "Autofill suggestions now shows all items instead of only 8 at a time",
            "Keyboard only playability added (can select items from  autofill suggestions using up down arrows and enter)",
            "Added setting to add badge with item rarity in autofill suggestions",
            "Stats button added to infinite mode with total games played and average guesses needed",
            "Fixed bug where items with the same recipe (i.e. umbral and hubris) wouldn't show green in components column if guessed",
            "Fixed share button giving old link instead of new link",
            "Added 'Give Up' button",
            "Added Ko-fi link if you want to help support website",
            "Thanks for all the feedback!"

        ]
    },
    {
        version: "v1.1.3",
        changes: [
            "Fixed Umbral Glaive not being in the item pool - ty Odell74",
            "Fixed Essence Reaver not being spellblade - ty Different-Wolf-8634"

        ]
    },
       
    {
        version: "v1.1.2",
        changes: [
            "Updated to league patch 16.11.1 (updated imperial mandate recipe)",
            "Made browser icon the null-magic mantdle",
            "Updated domain name"

        ]
    },
                {
        version: "v1.1.1",
        changes: [
            "Fixed daily player amount not updating",
            "Cleaned up infinite mode",
            "Removed alpha mode cus it was bugged",
            "Reset item pool"
        ]
    },
        {
        version: "v1.1.0",
        changes: [
            "Added daily player amount",
            "Fixed item being inconsistent for real"
        ]
    },
    {
        version: "v1.0.0 (Release)",
        changes: [
            "Fixed bug where some browsers do not get same daily item",
            "Added Share button that copies result to clipboard for winning",
            "Added Daily Mode stats tracking that tracks games played, won, average guesses, and one-guess wins",
            "Complete code refactor and reduced code duplication by 70% (3,500+ lines)",
            "Added Feedback Form",
            "Removed Dev Panel"
        ]
    },
    {
        version: "v0.3.0 (Beta)",
        changes: [
            "Added Daily Mode where you can visit each day and try to guess the daily item and increase your daily streak",
            "Added Infinite Mode where you can try to get the highest win streak possible. Win streaks only increase if you get the item in 6 or less guesses (subject to change).",
            "Made it so if you leave during a session it will save your progress to your local storage so you wont lose anything",
            "Updated gamemode menu to include both of these and changed the icons a bit to reflect them",
            "Updated the colors indicator helper thing to be able to be toggled off in the settings",
            "Made it so it remembers your settings"
        ]
    },
    {
        version: "v0.2.2 (Beta)",
        changes: [
            "Fixed Luden's echo not showing up as a mage item",
            "BT acronym added for bloodthirster",
            "Optimized code a bit in preparation for infinite mode and daily mode"
        ]
    },
    {
        version: "v0.2.1 (Beta)",
        changes: [
            "Fixed filter incorrectly removing Bloodletter's Curse and Hollow Radiance from pool",
            "Updated search suggestions to include common acronyms like LDR or BORK to be able to search with",
            "Fixed gamemode selector not working correctly",
            "Added gamemode selector to alpha version to easily change back to original mode"
        ]
    },
    {
        version: "v0.2.0 (Beta)",
        changes: [
            "Fixed bug where guessing an item with Item Group 'None' would incorrectly display as red when Item Group is actually 'None'",
            "Added settings menu with colorblind support",
            "Added gamemodes/versions dropdown for future content and expansion",
            "Added alpha version of Null-Magic Mantdle to gamemodes dropdown menu"
        ]
    },
    {
        version: "v0.1.1 (Beta)",
        changes: [
            "Updated Item Group description to be less confusing",
            "Changed class pool when item has no class from 'Component' to 'N/A'",
            "Added Future Plans in patch notes for a To-Do list"
        ]
    },
    {
        version: "v0.1.0 (Beta)",
        changes: [
            "Moved the 'Item Group' column to the far-right side of the results row.",
            "Added descriptive tooltips when hovering over table column headers.",
            "Fixed a visual glitch where a thin black line clipped underneath the search box input.",
            "Updated items added in Season 16 to match appropriate rarity, classes, and item groups",
            "Fixed Tenacity not showing up in Primary Stats column"
        ]
    },
    {
        version: "v0.0.1 (Alpha Release)",
        changes: [
            "Launched Null-Magic Mantdle core guess engine using live server items database.",
            "Integrated prioritized search auto-suggestions and standard grid color feedback.",
            "Updated item patch from 14.23.1 to 16.10.1",
            "Added Item Group column to help guessing",
            "Added Patch Notes/Changelogs Button to track development progress",
            "Removed Arena and ARAM items from list"
        ]
    }
];

// Render patch notes into modal
function renderPatchNotes() {
    const container = document.getElementById('patchNotesContainer');
    if (!container) return;

    container.innerHTML = '';

    PATCH_NOTES.forEach(update => {
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('patch-version');
        titleDiv.textContent = update.version;

        const listUl = document.createElement('ul');
        listUl.classList.add('patch-list');

        update.changes.forEach(changeText => {
            const itemLi = document.createElement('li');
            itemLi.innerHTML = changeText;
            listUl.appendChild(itemLi);
        });

        container.appendChild(titleDiv);
        container.appendChild(listUl);
    });
}

// Export for use in HTML
window.renderPatchNotes = renderPatchNotes;
