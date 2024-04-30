// Get the form element with the id "contact-form"
const contactForm = document.getElementById("contact-form");

// Get the submit button
const submitButton = document.getElementById("contact-form-submit");

// Add an event listener to the form element
contactForm.addEventListener("submit", submitForm);

// Function to handle form submission event
function submitForm(event) {
    event.preventDefault();

    // Get the form data
    const formData = new FormData(event.target);

    // Disable all form elements
    document
    .querySelectorAll("input, textarea")
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
            submitButton.textContent = "Message sent!";
            submitButton.className = "btn btn-lg btn-success disabled";
            contactForm.removeEventListener("submit", submitForm);
            contactForm.reset();
        } else {
            submitButton.textContent = "Error sending message";
            submitButton.className = "btn btn-lg btn-danger disabled";
        }
    })
    .catch((error) => {
        submitButton.textContent = "Error sending message";
        submitButton.className = "btn btn-lg btn-danger disabled";
    });
}

