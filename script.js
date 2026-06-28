const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const bookingForm = document.querySelector("#booking-form");
const reviewForm = document.querySelector("#review-form");
const serviceCards = document.querySelectorAll(".service-card");
const appointmentDateInputs = document.querySelectorAll('input[name="appointmentDate"]');
const bookingForms = document.querySelectorAll(".booking-form");
const unavailableSlotStorageKey = "mokgadiMabidilalaBookedSlots";
const manuallyUnavailableSlots = [
  // Add confirmed unavailable slots here in "YYYY-MM-DDTHH:MM" format.
  // Example: "2026-07-05T10:00"
];

const today = new Date();
const timezoneOffset = today.getTimezoneOffset() * 60000;
const localToday = new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];

appointmentDateInputs.forEach((input) => {
  input.setAttribute("min", localToday);
});

const getStoredUnavailableSlots = () => {
  try {
    return JSON.parse(localStorage.getItem(unavailableSlotStorageKey)) || [];
  } catch {
    return [];
  }
};

const getUnavailableSlots = () => new Set([...manuallyUnavailableSlots, ...getStoredUnavailableSlots()]);

const getSlotKey = (form) => {
  const data = new FormData(form);
  const appointmentDate = data.get("appointmentDate")?.toString().trim();
  const appointmentTime = data.get("appointmentTime")?.toString().trim();

  if (!appointmentDate || !appointmentTime) {
    return "";
  }

  return `${appointmentDate}T${appointmentTime}`;
};

const saveUnavailableSlot = (slotKey) => {
  if (!slotKey) {
    return;
  }

  const slots = getUnavailableSlots();
  slots.add(slotKey);
  localStorage.setItem(unavailableSlotStorageKey, JSON.stringify([...slots]));
};

const updateSlotAvailability = (form) => {
  const slotKey = getSlotKey(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector(".form-status");
  const isUnavailable = Boolean(slotKey && getUnavailableSlots().has(slotKey));

  submitButton?.toggleAttribute("disabled", isUnavailable);
  status?.classList.toggle("error", isUnavailable);

  if (status && isUnavailable) {
    status.textContent = "This date and time is already booked. Please choose another appointment slot.";
  } else if (status?.textContent === "This date and time is already booked. Please choose another appointment slot.") {
    status.textContent = "";
  }

  return !isUnavailable;
};

bookingForms.forEach((form) => {
  form.querySelector('input[name="appointmentDate"]')?.addEventListener("change", () => updateSlotAvailability(form));
  form.querySelector('input[name="appointmentTime"]')?.addEventListener("change", () => updateSlotAvailability(form));
});

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteNav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

serviceCards.forEach((card) => {
  card.addEventListener("click", () => {
    const wasActive = card.classList.contains("is-active");
    serviceCards.forEach((item) => item.classList.remove("is-active"));
    if (!wasActive) {
      card.classList.add("is-active");
    }
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitButton = bookingForm.querySelector('button[type="submit"]');
  const status = bookingForm.querySelector(".form-status");
  const data = new FormData(bookingForm);
  const name = data.get("name")?.toString().trim() || "";
  const phone = data.get("phone")?.toString().trim() || "";
  const consultation = data.get("consultation")?.toString().trim() || "";
  const appointmentDate = data.get("appointmentDate")?.toString().trim() || "";
  const appointmentTime = data.get("appointmentTime")?.toString().trim() || "Flexible";
  const message = data.get("message")?.toString().trim() || "";
  const slotKey = getSlotKey(bookingForm);
  const subject = "Appointment at MC Mabidilala Clinical Psycology";
  const body = [
    "Appointment request",
    "",
    `Full name: ${name}`,
    `Phone: ${phone}`,
    `Preferred consultation: ${consultation}`,
    `Preferred appointment date: ${appointmentDate}`,
    `Preferred time: ${appointmentTime}`,
    "",
    "Support request:",
    message
  ].join("\n");
  const whatsappUrl = `https://wa.me/27815494535?text=${encodeURIComponent(body)}`;
  const emailUrl = `mailto:info@mabidilalapsychologist.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  if (!updateSlotAvailability(bookingForm)) {
    return;
  }

  data.append("_subject", subject);
  data.append("_template", "box");
  data.append("_captcha", "false");
  data.append("booking_summary", body);

  submitButton?.setAttribute("disabled", "true");
  status?.classList.remove("error");
  if (status) {
    status.textContent = "Sending booking request...";
  }

  fetch("https://formsubmit.co/ajax/info@mabidilalapsychologist.co.za", {
    method: "POST",
    headers: {
      Accept: "application/json"
    },
    body: data
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Booking request could not be sent.");
      }
      return response.json();
    })
    .then(() => {
      saveUnavailableSlot(slotKey);
      bookingForm.reset();
      if (status) {
        status.textContent = "Booking request sent. The practice will respond to confirm availability.";
      }
    })
    .catch(() => {
      status?.classList.add("error");
      if (status) {
        status.innerHTML = `The automatic email could not be sent. <a href="${whatsappUrl}">Send on WhatsApp</a> or <a href="${emailUrl}">open email</a>.`;
      }
    })
    .finally(() => {
      submitButton?.removeAttribute("disabled");
    });
});

reviewForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(reviewForm);
  const name = data.get("reviewName")?.toString().trim() || "";
  const rating = data.get("reviewRating")?.toString().trim() || "";
  const message = data.get("reviewMessage")?.toString().trim() || "";
  const status = reviewForm.querySelector(".review-status");
  const subject = "Website comment or review";
  const body = [
    "Website comment or review",
    "",
    `Name: ${name}`,
    `Rating: ${rating}`,
    "",
    "Comment:",
    message
  ].join("\n");

  if (status) {
    status.textContent = "Opening email for review submission...";
  }

  window.location.href = `mailto:info@mabidilalapsychologist.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
