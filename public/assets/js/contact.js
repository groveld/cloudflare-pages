// Get the form element with the id "contact-form"
const contactForm = document.getElementById("contact-form");

// Get the submit button
const submitButton = contactForm.querySelector("button[type=submit]");

// Add an event listener to the form element
contactForm.addEventListener("submit", submitForm);

// Function to handle form submission event
function submitForm(event) {
    event.preventDefault();

    // Get the contactForm data
    const formData = new FormData(event.target);

    // Disable all contactForm elements
    contactForm.querySelectorAll("input, textarea")
    .forEach((input) => (input.disabled = true));

    // Change the button text to "Sending message..."
    submitButton.textContent = "Sending message...";
    submitButton.className = "btn btn-lg btn-primary disabled";

    // Send the form to the Cloudflare Workers API
    fetch("/api/contact", {
        method: "POST",
        body: formData,
    })
    .then((response) => {
        if (response.ok) {
            response.text().then((text) => {
                submitButton.textContent = text;
                submitButton.className = "btn btn-lg btn-success disabled";
            });
        } else {
            response.text().then((text) => {
                submitButton.textContent = text;
                submitButton.className = "btn btn-lg btn-danger disabled";
            });
        }
    });
}
