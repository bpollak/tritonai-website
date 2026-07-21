(function () {
  "use strict";

  function visible(element) {
    if (!element) return false;
    var style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
  }

  function removeClonedNavigationIds() {
    Array.prototype.forEach.call(document.querySelectorAll(".navmenu.offcanvas-clone"), function (clone) {
      clone.removeAttribute("id");
      clone.removeAttribute("aria-label");
      clone.setAttribute("aria-hidden", "true");
      Array.prototype.forEach.call(clone.querySelectorAll("[id]"), function (element) {
        element.removeAttribute("id");
      });
    });
  }

  function desktopDropdowns() {
    return Array.prototype.slice.call(document.querySelectorAll("#navbar > .navbar-nav-list > li.dropdown"));
  }

  function dropdownTrigger(dropdown) {
    return dropdown && dropdown.querySelector(":scope > [data-tritonai-nav-dropdown]");
  }

  function syncDropdown(dropdown) {
    var trigger = dropdownTrigger(dropdown);
    if (!trigger) return;
    trigger.setAttribute("aria-expanded", String(dropdown.classList.contains("open")));
  }

  function openDropdown(dropdown) {
    if (!dropdown) return;
    dropdown.classList.add("open");
    syncDropdown(dropdown);
  }

  function closeDropdown(dropdown, restoreFocus) {
    var trigger = dropdownTrigger(dropdown);
    if (!trigger) return;
    var menu = dropdown.querySelector(":scope > .dropdown-menu");
    var finalize = function () {
      dropdown.classList.remove("open");
      if (menu) menu.style.removeProperty("display");
      syncDropdown(dropdown);
    };
    finalize();
    if (restoreFocus) trigger.focus();
    window.setTimeout(finalize, 0);
  }

  function desktopSearch() {
    return document.querySelector("nav.navbar .search");
  }

  function removeDuplicateSearchIds() {
    var search = desktopSearch();
    if (!search) return;
    var desktopPanel = search.querySelector(".search-content[id]");
    if (!desktopPanel) return;
    Array.prototype.forEach.call(document.querySelectorAll(".search-content[id]"), function (panel) {
      if (panel !== desktopPanel && panel.id === desktopPanel.id) panel.removeAttribute("id");
    });
  }

  function syncSearch() {
    var search = desktopSearch();
    if (!search) return;
    var toggle = search.querySelector("[data-tritonai-search-toggle]");
    var panel = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
    if (!toggle || !panel) return;
    var expanded = search.classList.contains("open") || visible(panel);
    toggle.setAttribute("aria-expanded", String(expanded));
    panel.setAttribute("aria-hidden", String(!expanded));
  }

  function closeSearch(restoreFocus) {
    var search = desktopSearch();
    if (!search) return;
    var toggle = search.querySelector("[data-tritonai-search-toggle]");
    if (!toggle) return;
    if (toggle.getAttribute("aria-expanded") === "true") toggle.click();
    window.setTimeout(function () {
      syncSearch();
      if (restoreFocus) toggle.focus();
    }, 0);
  }

  function mobileNavigation() {
    return document.getElementById("mobile-navigation");
  }

  function mobileToggle() {
    return document.querySelector("[data-tritonai-mobile-toggle]");
  }

  function syncMobileNavigation() {
    var navigation = mobileNavigation();
    var toggle = mobileToggle();
    if (!navigation || !toggle) return;
    var expanded = navigation.classList.contains("in");
    toggle.setAttribute("aria-expanded", String(expanded));
    navigation.setAttribute("aria-hidden", String(!expanded));
  }

  function closeMobileNavigation(restoreFocus) {
    var navigation = mobileNavigation();
    var toggle = mobileToggle();
    if (!navigation || !toggle) return;
    navigation.classList.remove("in", "canvas-sliding");
    document.body.classList.remove("canvas-sliding");
    window.setTimeout(function () {
      syncMobileNavigation();
      if (restoreFocus) toggle.focus();
    }, 0);
  }

  function syncAll() {
    removeClonedNavigationIds();
    removeDuplicateSearchIds();
    desktopDropdowns().forEach(syncDropdown);
    syncSearch();
    syncMobileNavigation();
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var target = event.target;
    var dropdown = target.closest && target.closest("#navbar > .navbar-nav-list > li.dropdown");
    if (dropdown && dropdown.classList.contains("open")) {
      event.preventDefault();
      closeDropdown(dropdown, true);
      return;
    }
    if (target.closest && target.closest("nav.navbar .search")) {
      event.preventDefault();
      closeSearch(true);
      return;
    }
    if (
      (target.closest && target.closest("#mobile-navigation")) ||
      (target.matches && target.matches("[data-tritonai-mobile-toggle]"))
    ) {
      event.preventDefault();
      closeMobileNavigation(true);
    }
  });

  document.addEventListener("focusout", function (event) {
    var dropdown = event.target.closest && event.target.closest("#navbar > .navbar-nav-list > li.dropdown");
    if (!dropdown) return;
    window.setTimeout(function () {
      if (!dropdown.contains(document.activeElement)) closeDropdown(dropdown, false);
    }, 0);
  });

  document.addEventListener("focus", function (event) {
    if (event.target.matches && event.target.matches("#navbar [data-tritonai-nav-dropdown]")) {
      openDropdown(event.target.closest("#navbar > .navbar-nav-list > li.dropdown"));
    }
  }, true);

  document.addEventListener("click", function (event) {
    if (event.target.closest && event.target.closest("[data-tritonai-search-toggle], [data-tritonai-mobile-toggle], [data-tritonai-mobile-close]")) {
      window.setTimeout(syncAll, 0);
    }
  });

  function observeNavigationState() {
    var navigation = mobileNavigation();
    var search = desktopSearch();
    if (navigation) new MutationObserver(syncMobileNavigation).observe(navigation, { attributes: true, attributeFilter: ["class", "style"] });
    if (search) new MutationObserver(syncSearch).observe(search, { attributes: true, attributeFilter: ["class", "style"], subtree: true });
    desktopDropdowns().forEach(function (dropdown) {
      dropdown.addEventListener("mouseenter", function () {
        openDropdown(dropdown);
      });
      dropdown.addEventListener("mouseleave", function () {
        window.setTimeout(function () {
          if (!dropdown.contains(document.activeElement)) closeDropdown(dropdown, false);
        }, 0);
      });
      new MutationObserver(function () {
        syncDropdown(dropdown);
      }).observe(dropdown, { attributes: true, attributeFilter: ["class"] });
    });
    new MutationObserver(removeClonedNavigationIds).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      syncAll();
      observeNavigationState();
    });
  } else {
    syncAll();
    observeNavigationState();
  }
  document.addEventListener("tritonai:decorator-ready", syncAll);
})();
