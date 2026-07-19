(function () {
  "use strict";

  function initializeHomeHero() {
    var carousel = document.getElementById("heroslider");
    var toggle = document.querySelector("[data-home-hero-toggle]");
    if (!carousel || !toggle) return;

    var isPaused = false;
    var icon = toggle.querySelector(".glyphicon");
    var label = toggle.querySelector(".sr-only");
    var fallbackTimer = null;

    function hydrateSlideImage(slide) {
      if (!slide) return;
      Array.prototype.forEach.call(slide.querySelectorAll("img[data-src]"), function (image) {
        image.src = image.getAttribute("data-src");
        image.removeAttribute("data-src");
      });
    }

    Array.prototype.forEach.call(carousel.querySelectorAll("img[data-fallback-src]"), function (image) {
      image.addEventListener("error", function useFallback() {
        var fallback = image.getAttribute("data-fallback-src");
        if (!fallback) return;
        image.src = fallback;
        image.removeAttribute("data-fallback-src");
      });
    });

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
        if (isActive) hydrateSlideImage(slide);
        slide.setAttribute("aria-hidden", String(!isActive));
        Array.prototype.forEach.call(slide.querySelectorAll("a, button, input, select, textarea, [tabindex]"), function (control) {
          control.setAttribute("tabindex", isActive ? "0" : "-1");
        });
      });
    }

    function showFallbackSlide(offset) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".item"));
      var indicators = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-indicators li"));
      var activeIndex = slides.findIndex(function (slide) {
        return slide.classList.contains("active");
      });
      var nextIndex = (activeIndex + offset + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle("active", index === nextIndex);
      });
      indicators.forEach(function (indicator, index) {
        indicator.classList.toggle("active", index === nextIndex);
      });
      updateSlides();
    }

    function startFallbackCycle() {
      if (isPaused || fallbackTimer) return;
      var interval = Number(carousel.getAttribute("data-interval")) || 7000;
      fallbackTimer = window.setInterval(function () {
        showFallbackSlide(1);
      }, interval);
    }

    function stopFallbackCycle() {
      if (!fallbackTimer) return;
      window.clearInterval(fallbackTimer);
      fallbackTimer = null;
    }

    toggle.addEventListener("click", function () {
      isPaused = !isPaused;
      if (isPaused) stopFallbackCycle();
      else startFallbackCycle();
      updateToggle();
    });

    var previous = carousel.querySelector("[data-home-hero-direction='prev']");
    var next = carousel.querySelector("[data-home-hero-direction='next']");
    if (previous) previous.addEventListener("click", function (event) {
      event.preventDefault();
      stopFallbackCycle();
      showFallbackSlide(-1);
      startFallbackCycle();
    });
    if (next) next.addEventListener("click", function (event) {
      event.preventDefault();
      stopFallbackCycle();
      showFallbackSlide(1);
      startFallbackCycle();
    });
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      isPaused = true;
    }
    updateSlides();
    updateToggle();
    startFallbackCycle();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeHomeHero);
  else initializeHomeHero();
})();
