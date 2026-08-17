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

// Global Variables
var predicted_week_demand = JSON.parse(localStorage.getItem("predicted_demand_list")) || [];

// Get Remaining Days
function getRemainingDays(item) {
    const now = Date.now();

    const daysPassed = Math.floor(
        (now - item.addedDate) / (1000 * 60 * 60 * 24)
    );

    return item.expiryDays - daysPassed;
}

// Change Family Members
const change_fam_members = document.getElementById("change-fam-members");
const total_fam_members = document.getElementById("total-fam-members");
var fam_members = localStorage.getItem('family_members');

if (fam_members != null) {
    localStorage.setItem('family_members', fam_members);
    total_fam_members.textContent = localStorage.getItem('family_members');
}

change_fam_members.addEventListener('click', function(event) {
    event.preventDefault();

    fam_members = prompt("How many family members are there (give a number, eg:- 4)?")
    while (!Number.isInteger(Number(fam_members)) || fam_members.trim() == "") {
        if (fam_members == null) {
            return;
        }
        fam_members = prompt("Please give a valid number. How many family members are there (give a number, eg:- 4)?")
    }

    localStorage.setItem('family_members', fam_members);

    total_fam_members.textContent = localStorage.getItem('family_members');

    updateAverage();
});

// Today's Food Details
const today_food_details = document.getElementById("today-food-details");

var fam_members = Number(localStorage.getItem('family_members')) || Number(total_fam_members.textContent);
var total_food_weight = Number(localStorage.getItem('total_food_weight')) || 0;
var total_days = Number(localStorage.getItem('total_days')) || 1;
var meal = localStorage.getItem("meal") || "D";
localStorage.setItem("meal", meal);
var end = false;

today_food_details.addEventListener('click', function(event) {
    event.preventDefault();
    
    meal = prompt("Did you just eat breakfast (type 'B'), lunch (type 'L'), snacks (type 'S'), or dinner (type 'D')?");
    if (meal != null) {
        while (meal.trim() == "" || !["B", "L", "S", "D"].includes(meal.trim().toUpperCase())) {
            if (fam_members == null) {
                return;
            }
            meal = prompt("Please specify a value either 'B', 'L', 'S', or 'D'. Did you just eat breakfast (type 'B'), lunch (type 'L'), snacks (type 'S'), or dinner (type 'D')?");
        }
    }

    var food_weight = prompt("How much total weight (in grams) of food did your family eat today?");
    if (food_weight != null) {
        while (food_weight.trim() == "" || !Number.isInteger(Number(food_weight))) {
            if (food_weight == null) {
                return;
            }
            food_weight = prompt("Please specify a valid number (eg:- 500). How much total weight (in grams) of food did you eat today?");
        }
    }

    total_days += 0.25;

    total_food_weight += Number(food_weight);
    localStorage.setItem("total_food_weight", total_food_weight);

    localStorage.setItem('meal', meal);
    localStorage.setItem('food_weight', food_weight);

    localStorage.setItem("total_days", total_days);

    updateAverage();

    const prediction = Number(
        document.getElementById("predicted-week-food").textContent
    );

    predicted_week_demand.push(prediction);

    localStorage.setItem(
        "predicted_demand_list",
        JSON.stringify(predicted_week_demand)
    );

    predictedFoodPerWeek();
});

// Average Food per Person
function updateAverage() {
    const avg = total_food_weight/(fam_members*total_days);

    const avg_food_person_element = document.getElementById("avg-food-person");
    avg_food_person_element.textContent = avg.toFixed(2);

    localStorage.setItem("avg_food_person", avg.toFixed(2));

    if (!Number.isNaN(avg)) {
        avg_food_person_element.textContent = localStorage.getItem("avg_food_person");
    }
    else {
        avg_food_person_element.textContent = "0";
    }
    predictedFoodPerWeek()
}

updateAverage()

// Predicted Food this Day
function predictedFoodPerWeek() {
    const celebrations = JSON.parse(localStorage.getItem("celebrations")) || {};

    const predicted_week_food = document.getElementById("predicted-week-food");

    var avg = total_food_weight / (fam_members * total_days);
    var event_factor = 0;

    const today = new Date();
    const currentYear = today.getFullYear();

    for (var event in celebrations) {
        if (celebrations[event] === true) {
            var parts = event.split("- ");

            if (parts.length >= 2) {
                var dateText = parts[parts.length - 1].trim(); 

                var eventDate = new Date(currentYear + " " + dateText);

                if (eventDate < today) {
                    eventDate = new Date((currentYear + 1) + " " + dateText);
                }

                var todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                var eventMid = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

                var diffTime = eventMid - todayMid;
                var diffDays = diffTime / (1000 * 60 * 60 * 24);

                diffDays = 365 - diffDays;

                if (diffDays <= 10 && diffDays >= 0) {
                    event_factor = 2;
                    break;
                }
            }
        }
    }

    predicted_week_food.textContent = ((avg * (fam_members + event_factor))/total_days).toFixed(2);
}

// Calorie Requirement Calculator
document.addEventListener("DOMContentLoaded", () => {
    const calculateBtn = document.getElementById("calculate-btn");

    calculateBtn.addEventListener("click", () => {
        const weight = parseFloat(document.getElementById("calorie-weight").value);
        const height = parseFloat(document.getElementById("calorie-height").value);
        const age = parseFloat(document.getElementById("calorie-age").value);
        const genderInput = document.getElementById("calorie-gender").value.trim().toUpperCase();
        const activity_level = document.getElementById("activity-level").value;
        var gender = 0;
        var activity_mutiply = 0;

        if (genderInput == "M") {
            gender = 5;
        }
        else if (genderInput === "F") {
            gender = -161;
        }
        else {
            gender = 0;
        }

        if (activity_level == "sedentary") {
            activity_mutiply = 1.2;
        }
        else if (activity_level == "lightly-active") {
            activity_mutiply = 1.375;
        }
        else if (activity_level == "moderately-active") {
            activity_mutiply = 1.55;
        }
        else if (activity_level == "very-active") {
            activity_mutiply = 1.725;
        }
        else if (activity_level == "extra-active") {
            activity_mutiply = 1.9;
        }
        else {
            activity_mutiply = 0;
        }

        if (
            isNaN(weight) ||
            isNaN(height) ||
            isNaN(age) ||
            (genderInput !== "M" && genderInput !== "F") ||
            (activity_level == "select-option")
        ) {
            alert("Please enter valid values.");
            return;
        }

        var bmr = (10*weight)+(6.25*height)-(5*age)+gender;
        const result = bmr * activity_mutiply;

        document.getElementById("calorie-form").innerHTML = `
            <div style="text-align: center;">
                <h2>Calorie Requirement</h2>
                <p style="font-size: 28px; color: #186918;">
                    ${result}
                </p>
            </div>
        `;
    });
});

// Demand Graph
var graph_days_label = []
for (i = 0; i < predicted_week_demand.length; i++) {
    graph_days_label.push(`Day ${i + 1}`);
}

const ctx = document.getElementById('demand-graph');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: graph_days_label,
        datasets: [{
            label: 'Food Demand (g)',
            data: predicted_week_demand,
            borderWidth: 3,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Time that takes to use each food item
const time_to_use_item_element = document.getElementById("time-to-use-item");
var items = JSON.parse(localStorage.getItem("items")) || [];

function renderTimeToUseItemTable() {
    time_to_use_item_element.innerHTML = "";
    time_to_use_item_element.innerHTML = `
        <tr>
            <th>Sr. No.</th>
            <th>Food Name</th>
            <th>Days that will take to fully consume this item</th>
            <th>Will you consume the food with this rate</th>
        </tr>
    `;

    items.forEach((item, index) => {
        const avg = total_food_weight/(fam_members*total_days);

        const totalDailyUsage = total_food_weight / total_days;
        const itemShare = item.number / total_food_weight;
        const dailyUsageForItem = totalDailyUsage * itemShare;
        const timeToUseItem = (item.number / dailyUsageForItem).toFixed(2);

        const row = document.createElement("tr");

        var willConsume;

        if (timeToUseItem > item.expiryDays) {
            willConsume = "No";
        }
        else if (timeToUseItem < item.expiryDays) {
            willConsume = "Yes";
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${timeToUseItem}</td>
            <td>${willConsume}</td>
        `;

        time_to_use_item_element.appendChild(row);
    });
}

renderTimeToUseItemTable();
