(function () {
  "use strict";

  function initializeHomeHero() {
    var carousel = document.getElementById("heroslider");
    var toggle = document.querySelector("[data-home-hero-toggle]");
    if (!carousel || !toggle || !window.jQuery) return;

    var isPaused = false;
    var icon = toggle.querySelector(".glyphicon");
    var label = toggle.querySelector(".sr-only");

    function updateToggle() {
      toggle.setAttribute("aria-pressed", String(isPaused));
      toggle.setAttribute("aria-label", isPaused ? "Carousel is paused; click to play" : "Carousel is playing; click to pause");
      if (icon) {
        icon.classList.toggle("glyphicon-pause", !isPaused);
        icon.classList.toggle("glyphicon-play", isPaused);
      }
      if (label) label.textContent = isPaused ? "Play carousel" : "Pause carousel";
    }

    function updateSlides() {
      Array.prototype.forEach.call(carousel.querySelectorAll(".item"), function (slide) {
        var isActive = slide.classList.contains("active");
        slide.setAttribute("aria-hidden", String(!isActive));
        Array.prototype.forEach.call(slide.querySelectorAll("a, button, input, select, textarea, [tabindex]"), function (control) {
          control.setAttribute("tabindex", isActive ? "0" : "-1");
        });
      });
    }

    toggle.addEventListener("click", function () {
      isPaused = !isPaused;
      window.jQuery(carousel).carousel(isPaused ? "pause" : "cycle");
      updateToggle();
    });

    window.jQuery(carousel).on("slid.bs.carousel", updateSlides);
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      isPaused = true;
      window.jQuery(carousel).carousel("pause");
    }
    updateSlides();
    updateToggle();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeHomeHero);
  else initializeHomeHero();
})();
