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

// Suggest Expiring Recipes
const expiring_recipes = document.getElementById("expiring-recipes");
var items = JSON.parse(localStorage.getItem("items")) || [];
var expiringItems = [];

items = items.filter(item => getRemainingDays(item) > 0);

items.forEach((item, index) => {
    const remainingDays = getRemainingDays(item);

    if (remainingDays <= 3) {
        expiringItems.push(item.name);
        expiring_recipes.innerHTML += `
            <img src="static/assets/expiry-warning.png" style="border-radius: 99px;" alt="expiry warning" width="100" height="100">
            <p>
                <strong>Your <b>${item.name}</b> is expiring soon!</strong>
                <br>
                Try our ${item.name} Recipes before it's too late
                <br>
                <a href="/recipes" class="view-recipes" data-food="${item.name}">View Recipes &nbsp;<i class="fa-solid fa-arrow-right"></i></a>
            </p>
        `;
    }
});

// View Recipes
document.querySelectorAll(".view-recipes").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        const food = this.dataset.food;

        const AIPrompt = `My ${food} is expiring soon. Suggest some ${food} recipes to me.`;

        localStorage.setItem("recipePrompt", AIPrompt);

        window.location.href = "/recipes";
    });
});

// Add Item
const kitchen_inventory = document.getElementById("kitchen-inventory-table");

function renderTable() {
    kitchen_inventory.innerHTML = "";
    kitchen_inventory.innerHTML = `
        <tr>
            <th>Sr. No.</th>
            <th>Food Name</th>
            <th>Days Till Expiry</th>
        </tr>
    `;

    items.forEach((item, index) => {
        const remainingDays = getRemainingDays(item);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${remainingDays}</td>
        `;

        kitchen_inventory.appendChild(row);
    });
}

renderTable();

// Reduce Expriy Date
function getRemainingDays(item) {
    const now = Date.now();

    const daysPassed = Math.floor(
        (now - item.addedDate) / (1000 * 60 * 60 * 24)
    );

    return item.expiryDays - daysPassed;
}

items = items.filter(item => getRemainingDays(item) > 0);

localStorage.setItem("items", JSON.stringify(items));

// Use Soon
const use_soon = document.getElementById("use-soon");

function renderUseSoon() {
    items = items.filter(item => getRemainingDays(item) > 0);

    use_soon.innerHTML = "";
    use_soon.innerHTML = `
        <tr>
            <th>Sr. No.</th>
            <th>Food Name</th>
            <th>Days Till Expiry</th>
            <th>Expiry Risk Score</th>
        </tr>
    `;

    items.forEach((item, index) => {
        const remainingDays = getRemainingDays(item);

        const expiry_risk = (1/(item.expiryDays + 1)).toFixed(2);

        if (expiry_risk >= 0.25) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${remainingDays}</td>
                <td>${expiry_risk}</td>
            `;

            use_soon.appendChild(row);
        }
    });
}

renderUseSoon();
