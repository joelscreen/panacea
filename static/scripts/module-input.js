const temperature_element = document.getElementById("temperature");
const humidity_element = document.getElementById("humidity");
const alcohol_element = document.getElementById("alcohol");
const broadcast_btn = document.getElementById("broadcast-btn");

broadcast_btn.addEventListener('click', async function() {

    if (Number.isNaN(Number(temperature_element.value)) || Number.isNaN(Number(humidity_element.value)) || Number.isNaN(Number(alcohol_element.value))) {
        return;
    }

    const response = await fetch('/update-freshness', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            temperature: temperature_element.value,
            humidity: humidity_element.value,
            alcohol: alcohol_element.value
        })
    });

    const data = await response.json();

    if (data.success) {
        document.getElementById("return-back-module-input").textContent = "Success!! Return to the main page.";

        temperature_element.value = "";
        humidity_element.value = "";
        alcohol_element.value = "";
    }
});
