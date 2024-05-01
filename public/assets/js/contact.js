// Get the form element with the id "contact-form"
const contactForm = document.getElementById("contact-form");

// Get the submit button
const submitButton = contactForm.querySelector("button[type=submit]");

// Function to handle form submission event
const submitForm = async (event) => {
    event.preventDefault();

    // Get the contactForm data
    const formData = new FormData(event.target);

    // Get the message field and replace newline characters with <br> tags
    const message = formData.get('message').replace(/\n/g, '<br>');
    formData.set('message', message);

    // Disable all contactForm elements
    contactForm.querySelectorAll("input, textarea")
    .forEach((input) => (input.disabled = true));

    // Change the button text to "Sending message..."
    submitButton.textContent = "Sending message...";
    submitButton.className = "btn btn-lg btn-primary disabled";

    // Send the form to the Cloudflare Workers API
    try {
        const response = await fetch("/api/contact", {
            method: "POST",
            body: formData,
        });

        const text = await response.text();
        submitButton.textContent = text;

        if (response.ok) {
            submitButton.className = "btn btn-lg btn-success disabled";
        } else {
            submitButton.className = "btn btn-lg btn-danger disabled";
        }
    } catch (error) {
        submitButton.textContent = "Error sending message";
        submitButton.className = "btn btn-lg btn-danger disabled";
    }
}

// Add an event listener to the form element
contactForm.addEventListener("submit", submitForm);
