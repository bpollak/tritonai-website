(function () {
  "use strict";

  function initializeTritonAiUpdates() {
    var form = document.querySelector("[data-updates-filter]");
    var results = document.querySelector("[data-updates-results]");
    if (!form || !results) return;

    var search = form.querySelector("[data-updates-search]");
    var year = form.querySelector("[data-updates-year]");
    var area = form.querySelector("[data-updates-area]");
    var status = form.querySelector("[data-updates-status]");
    var cards = Array.prototype.slice.call(results.querySelectorAll("[data-update-card]"));
    var yearGroups = Array.prototype.slice.call(results.querySelectorAll("[data-update-year-group]"));
    var empty = results.querySelector("[data-updates-empty]");

    function update() {
      var query = search.value.trim().toLowerCase();
      var selectedYear = year.value;
      var selectedArea = area.value;
      var visible = 0;

      cards.forEach(function (card) {
        var group = card.closest("[data-update-year-group]");
        var matchesQuery = !query || card.getAttribute("data-update-search").indexOf(query) !== -1;
        var matchesYear = !selectedYear || group.getAttribute("data-update-year") === selectedYear;
        var matchesArea = !selectedArea || card.getAttribute("data-update-area") === selectedArea;
        card.hidden = !(matchesQuery && matchesYear && matchesArea);
        if (!card.hidden) visible += 1;
      });

      yearGroups.forEach(function (group) {
        group.hidden = !group.querySelector("[data-update-card]:not([hidden])");
      });

      empty.hidden = visible !== 0;
      status.textContent = visible + (visible === 1 ? " update shown" : " updates shown");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });
    form.addEventListener("reset", function () {
      window.setTimeout(update, 0);
    });
    search.addEventListener("input", update);
    year.addEventListener("change", update);
    area.addEventListener("change", update);
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeTritonAiUpdates);
  else initializeTritonAiUpdates();
})();
