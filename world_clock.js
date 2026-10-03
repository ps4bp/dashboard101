const CONFIG = {
    analogTimezone: "Australia/Melbourne",
    refreshInterval: 1000,
    colors: {
        black: "#444",
        white: "#fff"
    }
};

const TIMEZONES = [
    "Pacific/Auckland",
    "Europe/London",
    "Europe/Helsinki",
    "Europe/Copenhagen",
    "Australia/Perth",
    "Australia/Darwin",
    "Australia/Sydney",
    "Australia/Brisbane",
    "Australia/Adelaide",
    "America/Vancouver",
    "America/Denver"
];

function drawHand(ctx, angle, length, width, color) {
    ctx.save();

    ctx.rotate(angle);

    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    ctx.moveTo(0, width);
    ctx.lineTo(0, -length);

    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.restore();
}

function drawClockFace(ctx, radius) {
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);

    ctx.fillStyle = CONFIG.colors.white;
    ctx.fill();

    ctx.lineWidth = 6;
    ctx.strokeStyle = CONFIG.colors.black;
    ctx.stroke();
}

function drawClockNumbers(ctx, radius) {
    ctx.font = "bold 16px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = CONFIG.colors.black;

    [3, 6, 9, 12].forEach(number => {
        const angle = (number - 3) * Math.PI / 6;

        ctx.fillText(
            number,
            Math.cos(angle) * (radius - 18),
            Math.sin(angle) * (radius - 18)
        );
    });
}

function drawCenterPin(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.colors.black;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.colors.white;
    ctx.fill();
}

function drawAnalogClock() {
    const canvas = document.getElementById("hq-clock");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);

    const now = new Date(new Date().toLocaleString("en-US", { timeZone: CONFIG.analogTimezone }));

    const seconds =
        now.getSeconds() +
        now.getMilliseconds() / 1000;

    const minutes =
        now.getMinutes() +
        seconds / 60;

    const hours =
        (now.getHours() % 12) +
        minutes / 60;

    drawClockFace(ctx, radius);
    drawClockNumbers(ctx, radius);

    drawHand(
        ctx,
        hours * Math.PI / 6,
        radius * 0.5,
        8,
        CONFIG.colors.black
    );

    drawHand(
        ctx,
        minutes * Math.PI / 30,
        radius * 0.8,
        5,
        CONFIG.colors.black
    );

    drawCenterPin(ctx);

    ctx.restore();
}

// Helper to extract city name consistently (e.g., "Pacific/Auckland" -> "Auckland")
const getCity = zone => zone.split("/").pop();

// Cache DOM elements in a Map after DOM loads
const cityElements = {};

function updateTime() {
    const now = new Date();

    TIMEZONES.forEach(zone => {
        const element = cityElements[getCity(zone)];
        if (!element) return;

        element.textContent = now.toLocaleTimeString("en-US", {
            timeZone: zone,
            hour: "2-digit",
            minute: "2-digit"
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("currentDate").textContent = new Date().toISOString().split("T")[0];

    // Map DOM elements by city and perform initial render
    TIMEZONES.forEach(zone => {
        const city = getCity(zone);
        cityElements[city] = document.getElementById(`${city}Clock`);
    });

    function render() {
        updateTime();
        drawAnalogClock();
    }

    render();
    setInterval(render, CONFIG.refreshInterval);
});