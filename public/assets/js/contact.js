// Get the form element with the id "contact-form"
const contactForm = document.getElementById("contact-form");

// Add an event listener to the form element
contactForm.addEventListener("submit", submitForm);

// Function to handle form submission event
function submitForm(event) {
event.preventDefault();

// document
//     .querySelectorAll("input, textarea, button")
//     .forEach((input) => (input.disabled = true));

// Get the submit button
const submitButton = document.getElementById("contact-form-submit");

// Change the button text to "Sending message..."
submitButton.textContent = "Sending message...";

const formData = new FormData(event.target);

// Send the form to the Cloudflare Workers API
fetch("/api/contact", {
    method: "POST",
    body: formData,
})
    .then((response) => {
    // Parse the response text and include the response status
    return response.text().then((text) => ({
        text,
        ok: response.ok,
    }));
    })
    .then(({ text, ok }) => {
    // If the request was successful, disable the form
    if (ok) {
        // You can modify/add something else here
        contactForm.removeEventListener("submit", submitForm);
        contactForm.reset();
        // Change the button text to "Message sent!"
        submitButton.textContent = "Message sent!";
        submitButton.classList.add("btn-success");
    } else {
        // If the request was not successful, throw an error
        submitButton.textContent = "Something went wrong!";
        submitButton.classList.add("btn-danger");
        throw new Error();
    }
    })
    // Catch any errors that occur during the fetch request
    .catch(() => {
    console.log("Error");
    // You can add something that should happen when the form failed
    });
}
