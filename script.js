const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const bookingForm = document.querySelector("#booking-form");
const serviceCards = document.querySelectorAll(".service-card");
const appointmentDateInputs = document.querySelectorAll('input[name="appointmentDate"]');

const today = new Date();
const timezoneOffset = today.getTimezoneOffset() * 60000;
const localToday = new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];

appointmentDateInputs.forEach((input) => {
  input.setAttribute("min", localToday);
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
  const data = new FormData(bookingForm);
  const name = data.get("name")?.toString().trim() || "";
  const phone = data.get("phone")?.toString().trim() || "";
  const consultation = data.get("consultation")?.toString().trim() || "";
  const appointmentDate = data.get("appointmentDate")?.toString().trim() || "";
  const appointmentTime = data.get("appointmentTime")?.toString().trim() || "Flexible";
  const message = data.get("message")?.toString().trim() || "";
  const body = [
    `Full name: ${name}`,
    `Phone: ${phone}`,
    `Preferred consultation: ${consultation}`,
    `Preferred appointment date: ${appointmentDate}`,
    `Preferred time: ${appointmentTime}`,
    "",
    "Support request:",
    message
  ].join("\n");

  window.location.href = `mailto:mabidilalapsychologist@gmail.com?subject=${encodeURIComponent("Appointment request")}&body=${encodeURIComponent(body)}`;
});
