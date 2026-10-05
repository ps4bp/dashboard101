/**
 * DST information and countdown for Australia & New Zealand
 *
 * Rules (Southern Hemisphere):
 *   NZ  – starts last Sunday of September, ends first Sunday of April
 *   AU  – starts first Sunday of October,  ends first Sunday of April
 */

// ---------------------------------------------------------------------------
// Date helpers – find the relevant Sundays
// ---------------------------------------------------------------------------
function firstSundayOfApril(year) {
    const d = new Date(year, 3, 1); // Apr 1
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    d.setHours(3, 0, 0, -1); // just before 3 am
    return d;
}

function lastSundayOfSeptember(year) {
    const d = new Date(year, 8, 30); // Sep 30
    d.setDate(d.getDate() - d.getDay());
    d.setHours(2, 0, 0, -1); // just before 2 am
    return d;
}

function firstSundayOfOctober(year) {
    // Always the Sunday after last Sunday of September
    const d = lastSundayOfSeptember(year);
    d.setDate(d.getDate() + 7);
    return d;
}

// ---------------------------------------------------------------------------
// Core DST calculation
// ---------------------------------------------------------------------------

/**
 * Calculate current DST state and the surrounding transition points.
 *
 * @param {function(number): Date} startFn  – returns DST start for a given year
 * @param {function(number): Date} endFn    – returns DST end for a given year
 */
function getDSTDetails(startFn, endFn) {
    const now = new Date();
    const year = now.getFullYear();

    const startThisYear = startFn(year);
    const endThisYear = endFn(year);

    // After the start of DST this year → currently in DST
    if (now >= startThisYear) {
        return {
            isDST: true,
            lastChange: startThisYear,
            lastEvent: "Start",
            nextChange: endFn(year + 1),
            nextEvent: "End"
        };
    }

    // Before the end of DST this year → still in DST (from previous year)
    if (now < endThisYear) {
        return {
            isDST: true,
            lastChange: startFn(year - 1),
            lastEvent: "Start",
            nextChange: endThisYear,
            nextEvent: "End"
        };
    }

    // Between end and next start → standard time
    return {
        isDST: false,
        lastChange: endThisYear,
        lastEvent: "End",
        nextChange: startThisYear,
        nextEvent: "Start"
    };
}

// Pre-compute once at load time
const nz = getDSTDetails(lastSundayOfSeptember, firstSundayOfApril);
const au = getDSTDetails(firstSundayOfOctober, firstSundayOfApril);

// ---------------------------------------------------------------------------
// Formatting & countdown
// ---------------------------------------------------------------------------

function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

/** Return a Date whose local components match the current wall time in `tz`. */
function nowInTimezone(tz) {
    return new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
}

function formatCountdown(targetDate, tz) {
    const now = nowInTimezone(tz);
    const diff = targetDate - now;

    if (diff <= 0) {
        return "Time change is occurring now";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `Countdown to next change: ${days}d ${hours}h ${minutes}m`;
}

const COUNTDOWN_TARGETS = [
    { nextChange: nz.nextChange, tz: "Pacific/Auckland", selector: ".nzCountdown" },
    { nextChange: au.nextChange, tz: "Australia/Sydney", selector: ".au1Countdown" },
    { nextChange: au.nextChange, tz: "Australia/Adelaide", selector: ".au2Countdown" }
];

function refreshCountdowns() {
    COUNTDOWN_TARGETS.forEach(({ nextChange, tz, selector }) => {
        const text = formatCountdown(nextChange, tz);
        document.querySelectorAll(selector).forEach(el => {
            el.textContent = text;
        });
    });
}

// ---------------------------------------------------------------------------
// DOM updates
// ---------------------------------------------------------------------------

function setStatus(element, isDST) {
    if (!element) return;
    element.textContent = `DST: ${isDST}`;
    element.classList.toggle("active", isDST);
}

function setChangeText(elements, event, date) {
    const text = `${event}ed: ${formatDate(date)}`;
    elements.forEach(el => {
        el.textContent = text;
    });
}

function setNextText(elements, event, date) {
    const text = `${event}s on ${formatDate(date)}`;
    elements.forEach(el => {
        el.textContent = text;
    });
}

function updateDSTUI() {
    // New Zealand
    setStatus(document.getElementById("nzStatus"), nz.isDST);
    setChangeText(
        [document.getElementById("nzLastChange")].filter(Boolean),
        nz.lastEvent,
        nz.lastChange
    );
    setNextText(
        [document.getElementById("nzNextChange")].filter(Boolean),
        nz.nextEvent,
        nz.nextChange
    );

    // Australia
    document.querySelectorAll(".auStatus").forEach(el => setStatus(el, au.isDST));
    setChangeText(
        document.querySelectorAll(".auLastChange"),
        au.lastEvent,
        au.lastChange
    );
    setNextText(
        document.querySelectorAll(".auNextChange"),
        au.nextEvent,
        au.nextChange
    );
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    updateDSTUI();
    refreshCountdowns();
    setInterval(refreshCountdowns, 60_000);
});