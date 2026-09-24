"use strict";
(() => {
  const measurementId = document.currentScript?.dataset.measurementId;
  // Preview visits must never enter the production property.
  if (
    location.hostname !== "onebe-inc.github.io" ||
    !location.pathname.startsWith("/sample_food1/") ||
    !/^G-[A-Z0-9]+$/.test(measurementId || "")
  )
    return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_prefix: "demo_food1",
    cookie_path: "/sample_food1/",
  });

  const tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
  document.head.append(tag);

  const consultation = document.querySelector(".web-consultation");
  consultation?.addEventListener("click", () => {
    gtag("event", "web_consultation_click", {
      send_to: measurementId,
      link_url: "https://lin.ee/pGcDjdz",
      link_text: "Web制作を相談する",
    });
  });
})();
