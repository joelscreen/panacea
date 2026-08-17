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

const available_to_share = document.getElementById("available-to-share");
let items = JSON.parse(localStorage.getItem("items")) || [];

// Available to Share
function renderUseSoon() {
    available_to_share.innerHTML = "";
    available_to_share.innerHTML = `
        <tr>
            <th>Food Item</th>
            <th>Number of Servings</th>
            <th>Priority Score</th>
        </tr>
    `;

    items.forEach((item, index) => {
        const expiry_risk = (1/(item.expiryDays + 1)).toFixed(2);
        const priority_score = (item.number/(item.expiryDays + 1)).toFixed(2);

        if (expiry_risk >= 0.25) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.number}</td>
                <td>${priority_score}</td>
            `;

            available_to_share.appendChild(row);
        }
    });
}

// Reduce Expriy Date
function getRemainingDays(item) {
    const now = Date.now();

    const daysPassed = Math.floor(
        (now - item.addedDate) / (1000 * 60 * 60 * 24)
    );

    return item.expiryDays - daysPassed;
}

// Donate Expiring Recipes
const expiring_recipes = document.getElementById("expiring-recipes-donate");
var expiringItems = [];

items = items.filter(item => getRemainingDays(item) > 0);

items.forEach((item, index) => {
    const remainingDays = getRemainingDays(item);

    if (remainingDays <= 3) {
        expiringItems.push(item.name);
        expiring_recipes.innerHTML += `
            Recommended Action
            <br>
            <br>
            <div class="options">
                <img src="static/assets/expiry-warning.png" style="border-radius: 99px;" alt="expiry warning" width="100" height="100">
                &emsp;
                <p>
                    <strong>Your ${item.name} are expiring soon!</strong>
                    <br>
                    Consider donating today
                    <br>
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSes3-nuan93UXb4xj-ZLPtkte1gQRBNZkGm6mMFaYqm9ivCuw/viewform?usp=publish-editor" target="_blank" id="view-recipes">Donate &nbsp;<i class="fa-solid fa-arrow-right"></i></a>
                </p>
            </div>
        `;
    }
});

renderUseSoon();

// Sustainable Index Score Calculator
document.addEventListener("DOMContentLoaded", () => {
    const calculateBtn = document.getElementById("calculate-btn-sustain");

    calculateBtn.addEventListener("click", () => {
        const consumed = parseFloat(document.getElementById("consumed").value);
        const donated = parseFloat(document.getElementById("donated").value);
        const purchased = parseFloat(document.getElementById("purchased").value);

        if (
            consumed == "" ||
            donated == "" ||
            purchased == ""
        ) {
            alert("Please enter valid values.");
            return;
        }

        const result = (((consumed+donated)/purchased)*100).toFixed(2);

        document.getElementById("calorie-form").innerHTML = `
            <div style="text-align: center;">
                <h2>Sustainable Index Score</h2>
                <p style="font-size: 28px; color: #186918;">
                    ${result}%
                </p>
            </div>
        `;
    });
});
