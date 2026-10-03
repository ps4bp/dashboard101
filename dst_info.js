function firstSundayOfApril(year) {
    const d = new Date(year, 3, 1); // Apr 1

    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    d.setHours(3, 0, 0, -1); // Set time to 3:00 AM

    return d;
}

function lastSundayOfSeptember(year) {
    const d = new Date(year, 8, 30); // Sep 30

    d.setDate(d.getDate() - d.getDay());
    d.setHours(2, 0, 0, -1); // Set time to 2:00 AM

    return d;
}

function firstSundayOfOctober(year) {
    const d = new Date(year, 9, 1); // Oct 1

    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    d.setHours(2, 0, 0, -1); // Set time to 2:00 AM

    return d;
}

function getDSTDetails(startFn, endFn) {
    const now = new Date();
    const year = now.getFullYear();

    const startThisYear = startFn(year);
    const endThisYear = endFn(year);

    let isDST;
    let lastChange;
    let nextChange;
    let lastEvent;
    let nextEvent;

    // Period 1: Late in current year (Oct - Dec) -> DST active
    if (now >= startThisYear) {
        isDST = true;
        lastChange = startThisYear;
        lastEvent = "Start";
        nextChange = endFn(year + 1);
        nextEvent = "End";
    }
    // Period 2: Early in current year (Jan - Apr) -> DST active
    else if (now < endThisYear) {
        isDST = true;
        lastChange = startFn(year - 1);
        lastEvent = "Start";
        nextChange = endThisYear;
        nextEvent = "End";
    }
    // Period 3: Middle of year (Apr - Oct) -> Standard Time
    else {
        isDST = false;
        lastChange = endThisYear;
        lastEvent = "End";
        nextChange = startThisYear;
        nextEvent = "Start";
    }

    return {
        isDST,
        lastChange,
        lastEvent,
        nextChange,
        nextEvent
    };
}

const nz = getDSTDetails(
    lastSundayOfSeptember,
    firstSundayOfApril
);

const au = getDSTDetails(
    firstSundayOfOctober,
    firstSundayOfApril
);

function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function updateCountdown(targetDate, tz) {
    const className = {
        "Australia/Adelaide": "au2Countdown",
        "Australia/Sydney": "au1Countdown",
        "Pacific/Auckland": "nzCountdown"
    }[tz];
    if (!className) return;

    const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: tz })
    );
    const diff = targetDate - now;
    if (diff <= 0) {
        element.textContent = "Time change is occurring now";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    document.querySelectorAll(`.${className}`)
        .forEach(el => {
            el.textContent = `Countdown to next change: ${days}d ${hours}h ${minutes}m`;
        });

}

function refreshCountdowns() {
    updateCountdown(nz.nextChange, "Pacific/Auckland");
    updateCountdown(au.nextChange, "Australia/Sydney");
    updateCountdown(au.nextChange, "Australia/Adelaide");
}

document.addEventListener("DOMContentLoaded", () => {
    let status;

    status = document.getElementById("nzStatus");
    status.textContent = `DST: ${nz.isDST}`;
    status.classList.toggle("active", nz.isDST);
    document.getElementById("nzLastChange").textContent = `${nz.lastEvent}ed: ${formatDate(nz.lastChange)}`;
    document.getElementById("nzNextChange").textContent = `${nz.nextEvent}s on ${formatDate(nz.nextChange)}`;

    document.querySelectorAll(".auStatus").forEach(el => {
        el.textContent = `DST: ${au.isDST}`;
        el.classList.toggle("active", au.isDST);
    });
    document.querySelectorAll(".auLastChange")
        .forEach(el =>
            el.textContent =
            `${au.lastEvent}ed: ${formatDate(au.lastChange)}`
        );
    document.querySelectorAll(".auNextChange")
        .forEach(el =>
            el.textContent =
            `${au.nextEvent}s on ${formatDate(au.nextChange)}`
        );

    refreshCountdowns();
    setInterval(refreshCountdowns, 60000);
});