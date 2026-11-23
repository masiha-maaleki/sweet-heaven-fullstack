
"use strict";

// Sweet Heaven - Contact Page

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const messageInput = document.getElementById("message");
const characterCount = document.getElementById("characterCount");

const fields = [
  "firstName",
  "lastName",
  "email",
  "subject",
  "message"
];

// Show or clear an error
function setFieldError(fieldId, errorMessage) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(fieldId + "Error");

  error.textContent = errorMessage;
  input.classList.toggle("input-error", Boolean(errorMessage));

  if (errorMessage) {
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", fieldId + "Error");
  } else {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  }
}

// Validate individual field
function validateField(fieldId) {
  const input = document.getElementById(fieldId);
  const value = input.value.trim();
  let error = "";

  if (!value) {
    error = "This field is required.";
  } else if (
    (fieldId === "firstName" || fieldId === "lastName") &&
    value.length < 2
  ) {
    error = "Please enter at least 2 characters.";
  } else if (fieldId === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value)) {
      error = "Please enter a valid email address.";
    }
  } else if (fieldId === "message" && value.length < 10) {
    error = "Please write at least 10 characters.";
  }

  setFieldError(fieldId, error);
  return !error;
}

// Validate while editing
fields.forEach((fieldId) => {
  const input = document.getElementById(fieldId);

  input.addEventListener("blur", () => {
    validateField(fieldId);
  });

  input.addEventListener("input", () => {
    if (input.classList.contains("input-error")) {
      validateField(fieldId);
    }

    formStatus.hidden = true;
  });

  input.addEventListener("change", () => {
    if (input.classList.contains("input-error")) {
      validateField(fieldId);
    }
  });
});

// Character counter
messageInput.addEventListener("input", () => {
  characterCount.textContent =
    `${messageInput.value.length} / 1000`;
});

// Form submission - DEMO ONLY
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let isValid = true;
  let firstInvalidField = null;

  fields.forEach((fieldId) => {
    const valid = validateField(fieldId);

    if (!valid) {
      isValid = false;

      if (!firstInvalidField) {
        firstInvalidField = document.getElementById(fieldId);
      }
    }
  });

  if (!isValid) {
    formStatus.textContent =
      "Please correct the highlighted fields.";

    formStatus.className = "form-status error";
    formStatus.hidden = false;

    firstInvalidField.focus();
    return;
  }

  // No data is transmitted or stored.
  formStatus.textContent =
    "Your form is valid! This is a portfolio demo, so no message was sent.";

  formStatus.className = "form-status success";
  formStatus.hidden = false;

  contactForm.reset();
  characterCount.textContent = "0 / 1000";

  fields.forEach((fieldId) => {
    setFieldError(fieldId, "");
  });
});

// Mobile navigation
const contactMenuToggle =
  document.getElementById("contactMenuToggle");

const contactNavLinks =
  document.getElementById("contactNavLinks");

contactMenuToggle.addEventListener("click", () => {
  const isOpen = contactNavLinks.classList.toggle("open");

  contactMenuToggle.setAttribute(
    "aria-expanded",
    String(isOpen)
  );
});
