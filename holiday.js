/**
 * Show this month's public holidays under the HQ clock.
 * Regions: Canada–Alberta, UK–England, Australia–Victoria.
 * Fetches from Nager.Date API and caches by year+country.
 * If none this month, show nothing.
 */

const API_BASE = "https://date.nager.at/api/v3/PublicHolidays";

// Regions to include: [countryCode, subdivisionCode|null, label]
const REGIONS = [
    { country: "CA", subdivision: "CA-AB", label: "Alberta" },
    { country: "GB", subdivision: "GB-ENG", label: "England" },
    { country: "AU", subdivision: "AU-VIC", label: "Victoria" },
];

// In-memory cache: "COUNTRY-YEAR" → array of { date, name, region }
const cache = new Map();

async function fetchHolidays(country, year) {
    const key = `${country}-${year}`;
    if (cache.has(key)) return cache.get(key);

    const res = await fetch(`${API_BASE}/${year}/${country}`);
    if (!res.ok) throw new Error(`Failed to fetch holidays for ${country} ${year}`);

    const data = await res.json();
    cache.set(key, data);
    return data;
}

function isRelevant(holiday, subdivision) {
    if (holiday.global) return true;
    if (!holiday.counties || holiday.counties.length === 0) return true;
    return subdivision && holiday.counties.includes(subdivision);
}

function getMonthRange(now = new Date()) {
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    return { first, last };
}

function toDateString(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

async function getThisMonthsHolidays() {
    const { first, last } = getMonthRange();
    const start = toDateString(first);
    const end = toDateString(last);
    const year = first.getFullYear();

    const results = [];

    for (const region of REGIONS) {
        const data = await fetchHolidays(region.country, year);
        for (const h of data) {
            if (!isRelevant(h, region.subdivision)) continue;
            if (h.date < start || h.date > end) continue;

            results.push({
                date: h.date,
                name: h.localName || h.name,
                region: region.label
            });
        }
    }

    // Sort by date, then by region name
    results.sort((a, b) => a.date.localeCompare(b.date) || a.region.localeCompare(b.region));
    return results;
}

function groupByRegion(holidays) {
    const groups = new Map();
    for (const h of holidays) {
        if (!groups.has(h.region)) groups.set(h.region, []);
        groups.get(h.region).push(h);
    }
    return groups; // only regions that have holidays
}

async function renderHolidays() {
    const container = document.getElementById("holidays");
    if (!container) return;

    try {
        const holidays = await getThisMonthsHolidays();

        if (holidays.length === 0) {
            container.textContent = "";
            container.hidden = true;
            return;
        }

        const groups = groupByRegion(holidays); // empty regions already excluded
        const hideEmpty = document.getElementById("hideEmptyRegions")?.checked ?? true;

        let html = "";
        for (const [region, items] of groups) {
            if (hideEmpty && items.length === 0) continue;

            html += `<div class="holiday-region-group">
                <div class="holiday-region-name">${region}</div>`;
            for (const h of items) {
                const d = new Date(h.date + "T00:00:00");
                const label = d.toLocaleDateString("en-CA", {
                    weekday: "short",
                    day: "numeric",
                    month: "short"
                });
                html += `
                    <div class="holiday-item">
                        <strong>${label}</strong> – ${h.name}
                    </div>`;
            }
            html += `</div>`;
        }

        container.hidden = false;
        container.innerHTML = html;
    } catch (err) {
        console.error("Holiday fetch failed:", err);
        container.hidden = true;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderHolidays();
    const toggle = document.getElementById("hideEmptyRegions");
    if (toggle) {
        toggle.addEventListener("change", renderHolidays);
    }
});