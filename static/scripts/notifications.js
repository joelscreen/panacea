// Redirect if not logged in
if (localStorage.getItem("session_token") == null) {
    window.location.href = "/login";
}

// Log Out
const log_out = document.getElementById("log-out");
log_out.addEventListener('click', async function() {
    await fetch("/logout", {
        method: "POST",
        headers: {
            "session-token": localStorage.getItem("session_token")
        }
    });

    localStorage.removeItem("session_token");

    window.location.href = "/login";
})

const events = [
    "Eastern Orthodox Christmas - 7 January",
    "Ramadan Begins - 17 February",
    "Holi - 13 March",
    "Eid al-Fitr - 19 March",
    "Passover Begins - 1 April",
    "Good Friday - 3 April",
    "Easter - 5 April",
    "Vaisakhi - 14 April",
    "Eid-ul-Adha - 26 May",
    "Mawlid al-Nabi - 25 August",
    "Krishna Janmashtami - 4 September",
    "Rosh Hashanah - 11 September",
    "Yom Kippur - 20 September",
    "Diwali - 8 November",
    "Guru Nanak Gurpurab - 24 November",
    "Hanukkah Begins - 4 December",
    "Christmas - 25 December",
    "Kwanzaa - 26 December"
];

let celebrations = JSON.parse(localStorage.getItem("celebrations")) || {};

let currentIndex = 0;

function showNextEvent() {
    if (allAnswered()) {
        document.getElementById("notifications").innerHTML = `
            <strong>All Done</strong>
            <p>Thank you for answering our survey.</p>
        `;
        return;
    }

    while (currentIndex < events.length) {
        const eventName = events[currentIndex];

        if (celebrations[eventName] === undefined) {
            showNotification(eventName);
            return;
        }

        currentIndex++;
    }
}

function showNotification(eventName) {

    if (!allAnswered()) {
        document.getElementById("notifications").innerHTML = `
            <strong>Upcoming Events:</strong>
            <p style="margin-top:10px;">Do you celebrate <b>${eventName}</b>?</p>
            <div style="margin-top:10px; display:flex; gap:10px;">
                <button id="yesBtn" style="background-color: #09851aff;">Yes</button>
                <button id="noBtn" style="background-color: rgb(255, 0, 0);">No</button>
            </div>
        `;

        document.getElementById("yesBtn").onclick = () => saveAnswer(eventName, true);
        document.getElementById("noBtn").onclick = () => saveAnswer(eventName, false);
    }
}

function saveAnswer(eventName, value) {
    celebrations[eventName] = value;
    localStorage.setItem("celebrations", JSON.stringify(celebrations));

    currentIndex++;
    showNextEvent();
}

function allAnswered() {
    return Object.keys(celebrations).length === events.length;
}

window.addEventListener("load", () => {
    showNextEvent();
});