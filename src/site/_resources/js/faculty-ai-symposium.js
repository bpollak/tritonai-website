(function () {
  "use strict";

  var trigger = document.getElementById("symposium-slideshow-open");
  var dialog = document.getElementById("symposium-slideshow");
  var closeButton = document.getElementById("symposium-slideshow-close");
  var previousButton = document.getElementById("symposium-slideshow-previous");
  var nextButton = document.getElementById("symposium-slideshow-next");
  var slideshowImage = document.getElementById("symposium-slideshow-image");
  var status = document.getElementById("symposium-slideshow-status");
  var photos = Array.prototype.slice.call(document.querySelectorAll(".symposium-photo-card img"));
  var activeIndex = 0;

  if (!trigger || !dialog || !closeButton || !previousButton || !nextButton || !slideshowImage || !status || !photos.length || typeof dialog.showModal !== "function") {
    return;
  }

  function renderPhoto() {
    var photo = photos[activeIndex];

    slideshowImage.src = photo.currentSrc || photo.src;
    slideshowImage.alt = photo.alt;
    status.textContent = String(activeIndex + 1) + " of " + String(photos.length);
  }

  function showPreviousPhoto() {
    activeIndex = (activeIndex - 1 + photos.length) % photos.length;
    renderPhoto();
  }

  function showNextPhoto() {
    activeIndex = (activeIndex + 1) % photos.length;
    renderPhoto();
  }

  trigger.hidden = false;

  trigger.addEventListener("click", function () {
    activeIndex = 0;
    renderPhoto();
    dialog.showModal();
    closeButton.focus();
  });

  closeButton.addEventListener("click", function () {
    dialog.close();
  });

  previousButton.addEventListener("click", showPreviousPhoto);
  nextButton.addEventListener("click", showNextPhoto);

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousPhoto();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextPhoto();
    }

    if (event.key === "Home") {
      event.preventDefault();
      activeIndex = 0;
      renderPhoto();
    }

    if (event.key === "End") {
      event.preventDefault();
      activeIndex = photos.length - 1;
      renderPhoto();
    }
  });

  dialog.addEventListener("close", function () {
    trigger.focus();
  });
})();
