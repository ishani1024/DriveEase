const form = document.getElementById("bookingForm");

const carSelect = document.getElementById("car");
const seatsField = document.getElementById("seats");
const priceField = document.getElementById("price");

const pickupDate = document.getElementById("pickupDate");
const pickupTime = document.getElementById("pickupTime");
const returnDate = document.getElementById("returnDate");
const returnTime = document.getElementById("returnTime");

const fromField = document.getElementById("from");
const toField = document.getElementById("to");

const summaryCar = document.getElementById("summaryCar");
const summarySeats = document.getElementById("summarySeats");
const summaryRate = document.getElementById("summaryRate");
const durationField = document.getElementById("duration");
const totalPriceField = document.getElementById("totalPrice");

const result = document.getElementById("result");

// Get today's date in the user's local timezone.
const now = new Date();

const today = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

// Prevent choosing dates in the past.
pickupDate.min = today;
returnDate.min = today;

// Get the currently selected car's details.
function getSelectedCar() {
    const option = carSelect.options[carSelect.selectedIndex];

    if (!option || !option.value) {
        return null;
    }

    return {
        name: option.value,
        seats: Number(option.dataset.seats),
        price: Number(option.dataset.price)
    };
}

// Update car details and refresh the price estimate.
function updateCarDetails() {
    const car = getSelectedCar();

    if (!car) {
        seatsField.value = "";
        priceField.value = "";

        summaryCar.textContent = "Not selected";
        summarySeats.textContent = "—";
        summaryRate.textContent = "—";

        updateEstimate();
        return;
    }

    seatsField.value = car.seats + " seats";
    priceField.value = "₹" + car.price + " / hour";

    summaryCar.textContent = car.name;
    summarySeats.textContent = car.seats + " seats";
    summaryRate.textContent = "₹" + car.price + " / hour";

    updateEstimate();
}

// Convert the selected dates and times into Date objects.
function getRentalTimes() {
    if (
        !pickupDate.value ||
        !pickupTime.value ||
        !returnDate.value ||
        !returnTime.value
    ) {
        return null;
    }

    return {
        pickup: new Date(
            pickupDate.value + "T" + pickupTime.value
        ),
        returning: new Date(
            returnDate.value + "T" + returnTime.value
        )
    };
}

// Calculate the rental duration and estimated cost.
function updateEstimate() {
    const car = getSelectedCar();
    const times = getRentalTimes();

    durationField.textContent = "—";
    totalPriceField.textContent = "₹0";

    if (!times) {
        return;
    }

    const difference =
        times.returning.getTime() - times.pickup.getTime();

    // The return must be after the pickup.
    if (difference <= 0) {
        durationField.textContent = "Check dates and times";
        return;
    }

    const exactHours = difference / (1000 * 60 * 60);
    const chargedHours = Math.ceil(exactHours);

    const wholeDays = Math.floor(chargedHours / 24);
    const remainingHours = chargedHours % 24;

    let durationText = "";

    if (wholeDays > 0) {
        durationText += wholeDays +
            (wholeDays === 1 ? " day" : " days");
    }

    if (remainingHours > 0) {
        if (durationText) {
            durationText += " ";
        }

        durationText += remainingHours +
            (remainingHours === 1 ? " hour" : " hours");
    }

    durationField.textContent = durationText;

    if (car) {
        const total = chargedHours * car.price;

        totalPriceField.textContent =
            "₹" + total.toLocaleString("en-IN");
    }
}

// Keep the return date no earlier than the pickup date.
pickupDate.addEventListener("change", function () {
    returnDate.min = pickupDate.value || today;

    if (
        returnDate.value &&
        returnDate.value < pickupDate.value
    ) {
        returnDate.value = "";
    }

    updateEstimate();
});

// Refresh the estimate whenever booking details change.
carSelect.addEventListener("change", updateCarDetails);

pickupTime.addEventListener("input", updateEstimate);
pickupDate.addEventListener("input", updateEstimate);
returnDate.addEventListener("input", updateEstimate);
returnTime.addEventListener("input", updateEstimate);

// Display booking details after form validation.
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const car = getSelectedCar();
    const times = getRentalTimes();

    if (!car) {
        alert("Please select a car.");
        return;
    }

    if (!times || times.returning <= times.pickup) {
        alert("Please select a valid return date and time.");
        return;
    }

    const from = fromField.value.trim();
    const to = toField.value.trim();

    if (from.toLowerCase() === to.toLowerCase()) {
        alert("Pickup and destination must be different.");
        return;
    }

    const difference =
        times.returning.getTime() - times.pickup.getTime();

    const hours = Math.ceil(difference / (1000 * 60 * 60));
    const total = hours * car.price;

    const safe = escapeHTML;

    result.innerHTML = `
        <h3>Booking Request Summary</h3>

        <strong>Car:</strong> ${safe(car.name)}<br>
        <strong>Seating capacity:</strong> ${car.seats} seats<br>
        <strong>Hourly rate:</strong> ₹${car.price}<br>
        <strong>Pickup:</strong> ${safe(from)}<br>
        <strong>Destination:</strong> ${safe(to)}<br>
        <strong>Pickup date:</strong> ${pickupDate.value}<br>
        <strong>Pickup time:</strong> ${pickupTime.value}<br>
        <strong>Return date:</strong> ${returnDate.value}<br>
        <strong>Return time:</strong> ${returnTime.value}<br>
        <strong>Charged duration:</strong> ${hours} hours<br>
        <strong>Estimated total:</strong>
        ₹${total.toLocaleString("en-IN")}<br>
        <hr>
        <strong>Status:</strong> Request prepared<br>
        <p>This is an estimate. No booking has been saved
        and no payment has been processed.</p>
    `;

    result.style.display = "block";

    result.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
});

// Safely display text entered by the customer.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Initialize the page.
updateCarDetails();
updateEstimate();