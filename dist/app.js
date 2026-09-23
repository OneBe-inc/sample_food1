"use strict";
const siteLoader = document.querySelector(".site-loader");
if (siteLoader) {
  const removeLoader = () => siteLoader.remove();
  siteLoader.addEventListener("animationend", (event) => {
    if (event.target === siteLoader) removeLoader();
  });
  // CSS also dismisses the intro if JavaScript is unavailable.
  window.setTimeout(removeLoader, 1600);
}

const dialogs = [...document.querySelectorAll("dialog")];
let lastTrigger = null;
function openDialog(id, trigger) {
  const dialog = document.getElementById(id);
  if (!dialog) return;
  dialogs.filter((item) => item.open).forEach((item) => item.close());
  const activeTrigger = trigger || document.activeElement;
  if (!activeTrigger?.closest("dialog")) lastTrigger = activeTrigger;
  dialog.showModal();
  document.body.classList.add("dialog-open");
  document
    .querySelector(".menu-toggle")
    ?.setAttribute("aria-expanded", String(id === "navigation-dialog"));
}
function closeDialog(dialog) {
  dialog.close();
}
for (const dialog of dialogs) {
  dialog.addEventListener("close", () => {
    if (!dialogs.some((item) => item.open)) {
      document.body.classList.remove("dialog-open");
      document
        .querySelector(".menu-toggle")
        ?.setAttribute("aria-expanded", "false");
      if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      closeDialog(dialog);
  });
}
document
  .querySelectorAll("[data-dialog]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      openDialog(button.dataset.dialog, button),
    ),
  );
document
  .querySelectorAll("[data-close]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      closeDialog(button.closest("dialog")),
    ),
  );
document
  .querySelectorAll(".navigation-dialog a")
  .forEach((link) =>
    link.addEventListener("click", () => closeDialog(link.closest("dialog"))),
  );
document.querySelectorAll("[data-booking]").forEach((button) =>
  button.addEventListener("click", () => {
    openDialog("booking-dialog", button);
  }),
);
const dishes = {
  ketchup: {
    title: "ケチャップオムライス",
    description:
      "ふわとろのたまごに、親しみのあるケチャップソース。まずは食べたい、定番のひと皿をイメージしました。",
    price: "¥1,100（税込）",
  },
  demi: {
    title: "デミグラスオムライス",
    description:
      "やわらかなたまごに、たっぷりのデミグラスソース。コクのある味わいを楽しむひと皿をイメージしました。",
    price: "¥1,300（税込）",
  },
};
document.querySelectorAll("[data-menu]").forEach((button) =>
  button.addEventListener("click", () => {
    const dish = dishes[button.dataset.menu];
    if (!dish) return;
    document.getElementById("dish-title").textContent = dish.title;
    document.getElementById("dish-description").textContent = dish.description;
    document.getElementById("dish-price").textContent = dish.price;
    openDialog("menu-dialog", button);
  }),
);
const dateInput = document.getElementById("booking-date");
const now = new Date();
const localDate = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
dateInput.min = localDate(now);
const lastDate = new Date(now);
lastDate.setMonth(lastDate.getMonth() + 3);
dateInput.max = localDate(lastDate);
dateInput.addEventListener("input", () => dateInput.setCustomValidity(""));
const bookingForm = document.getElementById("booking-form");
const bookingResult = document.getElementById("booking-result");
bookingForm.addEventListener("input", () => {
  bookingResult.hidden = true;
});
bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  if (dateInput.value < dateInput.min || dateInput.value > dateInput.max) {
    dateInput.setCustomValidity("本日から3か月以内の日付をお選びください。");
    dateInput.reportValidity();
    return;
  }
  const form = new FormData(bookingForm);
  const chosenDate = new Date(form.get("date") + "T12:00:00");
  const formatted = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(chosenDate);
  bookingResult.textContent =
    formatted +
    " " +
    form.get("time") +
    " / " +
    form.get("guests") +
    "名。予約内容のプレビューです。実際の予約は送信されていません。";
  bookingResult.hidden = false;
});
