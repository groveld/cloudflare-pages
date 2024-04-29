// Get the form element with the id "contact-form"
const contactForm = document.getElementById("contact-form");

// Get the submit button
const submitButton = document.getElementById("contact-form-submit");

// Add an event listener to the form element
contactForm.addEventListener("submit", submitForm);

// Function to handle form submission event
function submitForm(event) {
    event.preventDefault();

    // Change the button text to "Sending message..."
    submitButton.textContent = "Sending message...";

    // Get the form data
    const formData = new FormData(event.target);

    // Send the form to the Cloudflare Workers API
    fetch("/api/contact", {
        method: "POST",
        body: formData,
    })
    .then((response) => {
        if (response.ok) {
            // Change the button text to "Message sent!"
            submitButton.textContent = "Message sent!";
            // Reset the form
            contactForm.removeEventListener("submit", submitForm);
            contactForm.reset();
        } else {
            // Change the button text to "Error sending message"
            submitButton.textContent = "Error sending message";
        }
    })
    .catch((error) => {
        // Change the button text to "Error sending message"
        submitButton.textContent = "Error sending message";
    });
}


// document
//     .querySelectorAll("input, textarea, button")
//     .forEach((input) => (input.disabled = true));
