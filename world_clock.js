// Define a function to update the clock display
function drawAnalogClock() {
    const canvas = document.getElementById("MelbourneClock");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);

    const MelbourneTime = new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "Australia/Melbourne"
        })
    );

    // Outer bezel
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#2f3b52";
    ctx.stroke();

    // Numbers
    ctx.font = "bold 16px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#2f3b52";

    for (let num = 3; num <= 12; num += 3) {
        const ang = (num - 3) * Math.PI / 6;
        const x = Math.cos(ang) * (radius - 18);
        const y = Math.sin(ang) * (radius - 18);
        ctx.fillText(num, x, y);
    }

    const second =
        MelbourneTime.getSeconds() +
        MelbourneTime.getMilliseconds() / 1000;

    const minute =
        MelbourneTime.getMinutes() +
        second / 60;

    const hour =
        (MelbourneTime.getHours() % 12) +
        minute / 60;

    const hourAngle = hour * Math.PI / 6;
    const minuteAngle = minute * Math.PI / 30;
    //const secondAngle = second * Math.PI / 30;

    // Hour hand
    ctx.save();
    ctx.rotate(hourAngle);
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -(radius * 0.45));
    ctx.strokeStyle = "#2f3b52";
    ctx.stroke();
    ctx.restore();

    // Minute hand
    ctx.save();
    ctx.rotate(minuteAngle);
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.moveTo(0, 15);
    ctx.lineTo(0, -(radius * 0.70));
    ctx.strokeStyle = "#444";
    ctx.stroke();
    ctx.restore();

    // Centre pin
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "#2f3b52";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.restore();
}

function updateTime() {
    const tzList = [
        "Pacific/Auckland",
        "Europe/London",
        "Europe/Helsinki",
        "Europe/Copenhagen",
        "Australia/Perth",
        "Australia/Darwin",
        "Australia/Canberra",
        "Australia/Brisbane",
        "Australia/Adelaide",
        "America/Vancouver",
        "America/Denver"
    ];

    const timeObj = new Date();
    tzList.forEach(tz => {
        const city = tz.split('/')[1];
        const clockElement = document.getElementById(`${city}Clock`);
        if (clockElement) {
            clockElement.textContent = timeObj.toLocaleTimeString('en-US', {
                timeZone: tz,
                hour: '2-digit', minute: '2-digit',
            });
        }

    });
}

document.addEventListener('DOMContentLoaded', () => {
    const dateCaptionElement = document.getElementById("currentDate");
    const today = new Date();
    dateCaptionElement.textContent = today.toISOString().split('T')[0];

    const refreshClock = () => {
        updateTime();
        drawAnalogClock();
    };
    // Show now
    refreshClock();
    // then every 15 seconds
    setInterval(refreshClock, 1000 * 15);
});