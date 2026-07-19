(function () {
  "use strict";

  function hydrateNativeVideo(video) {
    if (video.dataset.mediaHydrated === "true") return;
    if (video.dataset.poster) {
      video.poster = video.dataset.poster;
      delete video.dataset.poster;
    }
    if (video.dataset.src) {
      video.src = video.dataset.src;
      delete video.dataset.src;
    }
    Array.prototype.forEach.call(video.querySelectorAll("source[data-src]"), function (source) {
      source.src = source.dataset.src;
      delete source.dataset.src;
    });
    video.dataset.mediaHydrated = "true";
    video.load();
  }

  function playMuted(video) {
    video.muted = true;
    video.defaultMuted = true;
    var result = video.play();
    if (result && typeof result.catch === "function") result.catch(function () {});
  }

  function initializeVisibilityMedia() {
    var nativeVideos = Array.prototype.slice.call(document.querySelectorAll("video[data-autoplay-when-visible='true']"));
    var embeddedVideos = Array.prototype.slice.call(document.querySelectorAll("iframe[data-autoplay-when-visible='true'][data-src]"));
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!("IntersectionObserver" in window)) {
      var checkFallbackMedia = function () {
        nativeVideos.forEach(function (video) {
          var bounds = video.getBoundingClientRect();
          var isNearViewport = bounds.top < window.innerHeight + 120 && bounds.bottom > -120;
          if (isNearViewport) {
            hydrateNativeVideo(video);
            if (!reducedMotion) playMuted(video);
          } else if (!video.paused) video.pause();
        });
        embeddedVideos.forEach(function (iframe) {
          var bounds = iframe.getBoundingClientRect();
          if (bounds.top < window.innerHeight + 120 && bounds.bottom > -120 && iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
            delete iframe.dataset.src;
          }
        });
      };
      document.addEventListener("scroll", checkFallbackMedia, { passive: true });
      window.addEventListener("resize", checkFallbackMedia, { passive: true });
      checkFallbackMedia();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.target.tagName === "VIDEO") {
            if (entry.isIntersecting) {
              hydrateNativeVideo(entry.target);
              if (!reducedMotion) playMuted(entry.target);
            } else if (!entry.target.paused) {
              entry.target.pause();
            }
            return;
          }
          if (entry.isIntersecting && entry.target.dataset.src) {
            entry.target.src = entry.target.dataset.src;
            delete entry.target.dataset.src;
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );

    nativeVideos.concat(embeddedVideos).forEach(function (element) {
      observer.observe(element);
    });
  }

  function loadIdleIntegrations() {
    var scheduled = false;
    var load = function () {
      if (scheduled) return;
      scheduled = true;
      document.querySelectorAll("script[data-idle-src]").forEach(function (placeholder) {
        var script = document.createElement("script");
        script.src = placeholder.dataset.idleSrc;
        script.async = true;
        placeholder.replaceWith(script);
      });
    };
    var schedule = function () {
      if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 2000 });
      else window.setTimeout(load, 1);
    };
    document.addEventListener("tritonai:decorator-ready", schedule, { once: true });
    window.setTimeout(schedule, 12000);
  }

  function loadAfterRenderDependencies() {
    var placeholders = Array.prototype.slice.call(document.querySelectorAll("script[data-after-render-src]"));
    placeholders.forEach(function (placeholder) {
      var preload = document.createElement("link");
      preload.rel = "preload";
      preload.as = "script";
      preload.href = placeholder.dataset.afterRenderSrc;
      document.head.appendChild(preload);
    });

    var sequence = Promise.resolve();
    placeholders.forEach(function (placeholder) {
      sequence = sequence.then(function () {
        return new Promise(function (resolve) {
          var source = placeholder.dataset.afterRenderSrc;
          var mount = placeholder;

          function attemptLoad(attempt) {
            var script = document.createElement("script");
            script.async = false;
            script.src = attempt === 0 ? source : source + (source.indexOf("?") === -1 ? "?" : "&") + "tritonai-retry=1";
            script.onload = resolve;
            script.onerror = function () {
              if (attempt === 0) {
                mount = script;
                attemptLoad(1);
              } else {
                resolve();
              }
            };
            mount.replaceWith(script);
            mount = script;
          }

          attemptLoad(0);
        });
      });
    });

    sequence.then(function () {
      document.querySelectorAll("script[type='application/x-tritonai-after-render-inline']").forEach(function (placeholder) {
        var script = document.createElement("script");
        script.text = placeholder.textContent;
        placeholder.replaceWith(script);
      });
      document.dispatchEvent(new CustomEvent("tritonai:decorator-ready"));
    });
  }

  function initializeLinkPrefetch() {
    var prefetched = new Set();
    var maximumPrefetches = 8;
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && (connection.saveData || /2g/.test(connection.effectiveType || ""))) return;

    function eligibleLink(target) {
      var link = target.closest && target.closest("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return null;
      var url;
      try {
        url = new URL(link.href, window.location.href);
      } catch (error) {
        return null;
      }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname || url.hash) return null;
      if (!/(?:\/|\.html)$/.test(url.pathname)) return null;
      return url.href;
    }

    function prefetch(event) {
      var href = eligibleLink(event.target);
      if (!href || prefetched.has(href) || prefetched.size >= maximumPrefetches) return;
      prefetched.add(href);
      var hint = document.createElement("link");
      hint.rel = "prefetch";
      hint.as = "document";
      hint.href = href;
      document.head.appendChild(hint);
    }

    document.addEventListener("pointerover", prefetch, { passive: true });
    document.addEventListener("touchstart", prefetch, { passive: true });
    document.addEventListener("focusin", prefetch);
  }

  function initialize() {
    document.querySelectorAll(".footer-copyright-year").forEach(function (year) {
      year.textContent = String(new Date().getFullYear());
    });
    initializeVisibilityMedia();
    initializeLinkPrefetch();
    loadIdleIntegrations();
    loadAfterRenderDependencies();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
