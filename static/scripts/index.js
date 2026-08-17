// Redirect if not logged in
if (localStorage.getItem("session_token") == null) {
    window.location.href = "/login";
}

// Fetch User Details
async function welcome_message() {
    const response = await fetch("/fetch-user-details", {
        headers: {
            "session-token": localStorage.getItem("session_token")
        }
    });

    if (!response.ok) {
        return;
    }

    const data = await response.json();

    document.getElementById("welcome-msg").textContent = `Welcome back, ${data.full_name}!!`
}

welcome_message();

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

// Function to get remaining days
function getRemainingDays(item) {
    const now = Date.now();

    const daysPassed = Math.floor(
        (now - item.addedDate) / (1000 * 60 * 60 * 24)
    );

    return item.expiryDays - daysPassed;
}

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
const addItemBtn = document.getElementById("add-item");

addItemBtn.addEventListener("click", () => {
    const name = prompt("Enter Food Item name:");
    if (!name) return;

    const number = prompt("Enter Number of Servings:");
    if (!number) return;

    const amount = prompt("Enter Days Till Expiry:");
    if (!amount) return;

    items.push({
        name: name,
        expiryDays: Number(amount),
        addedDate: Date.now(),
        number: Number(number),
        expiryRiskScore: 1/(Number(amount) + 1)
    });

    localStorage.setItem("items", JSON.stringify(items));
});
