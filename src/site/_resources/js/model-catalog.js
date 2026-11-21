import { renderModelCatalog } from "./model-catalog-view.js";

(function () {
  "use strict";

  var CACHE_TTL_MS = 60 * 60 * 1000;
  var RETRY_MS = 60 * 1000;

  function siteBasePath() {
    try {
      var pathname = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");
      return pathname === "/" ? "" : pathname;
    } catch {
      return "";
    }
  }

  function readFallbackPricing(section) {
    var node = section.querySelector("script[data-model-catalog-pricing]");
    if (!node) return {};
    try {
      var parsed = JSON.parse(node.textContent || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function mergePricing(models, fallbackPricing) {
    return models.map(function (model) {
      var fallback = fallbackPricing[model.id];
      if (!fallback) return model;
      return {
        ...model,
        inputCostPerToken: Number.isFinite(model.inputCostPerToken) ? model.inputCostPerToken : fallback.inputCostPerToken ?? null,
        outputCostPerToken: Number.isFinite(model.outputCostPerToken) ? model.outputCostPerToken : fallback.outputCostPerToken ?? null,
      };
    });
  }

  function initialize() {
    var section = document.querySelector("main#main-content [data-model-catalog-endpoint]");
    if (!section) return;
    var endpoint = section.dataset.modelCatalogEndpoint;
    var list = section.querySelector("[data-model-catalog-list]");
    var status = section.querySelector("[data-model-catalog-status]");
    if (!list || !status) return;
    var basePath = siteBasePath();
    var fallbackPricing = readFallbackPricing(section);
    var key = "tritonai-model-catalog-v3:" + endpoint;
    var saved = null;
    var expiresAt = 0;
    var retryAt = 0;
    var loading = false;
    var renderedModels = "";

    function valid(payload) {
      return payload && Number.isFinite(Date.parse(payload.fetchedAt))
        && typeof payload.stale === "boolean"
        && Array.isArray(payload.models) && payload.models.length > 0
        && payload.models.every(function (model) {
          return model && typeof model.id === "string" && model.id
            && typeof model.displayName === "string" && typeof model.type === "string"
            && ["UC-hosted", "Approved enterprise cloud"].includes(model.hosting)
            && (model.maxInputTokens === null || Number.isFinite(model.maxInputTokens));
        });
    }

    function render(payload) {
      var models = mergePricing(payload.models, fallbackPricing);
      var signature = JSON.stringify(models);
      if (signature !== renderedModels) {
        var openFamilies = Array.from(list.querySelectorAll("details[open]"), function (detail) { return detail.dataset.modelFamily; });
        var focusedFamily = document.activeElement?.closest("details")?.dataset.modelFamily;
        list.innerHTML = renderModelCatalog(models, endpoint, { siteBasePath: basePath });
        list.querySelectorAll("details").forEach(function (detail) {
          if (openFamilies.includes(detail.dataset.modelFamily)) detail.open = true;
          if (focusedFamily && detail.dataset.modelFamily === focusedFamily) detail.querySelector("summary").focus();
        });
        renderedModels = signature;
      }
      var date = new Date(payload.fetchedAt).toLocaleString("en-US");
      status.textContent = "Model list updated " + date + "."
        + (payload.stale ? " Showing the last available list while updates are unavailable." : "");
    }

    try {
      var cache = JSON.parse(localStorage.getItem(key));
      if (cache && valid(cache.payload) && Number.isFinite(cache.expiresAt)) {
        saved = cache.payload;
        expiresAt = cache.expiresAt;
        render(saved);
      }
    } catch {
      // Storage can be unavailable; HTTP caching still works.
    }

    async function refresh() {
      if (loading || document.hidden || Date.now() < Math.max(expiresAt, retryAt)) return;
      loading = true;
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 10000);
      try {
        var response = await fetch(endpoint, { credentials: "omit", signal: controller.signal });
        if (!response.ok) throw new Error("Model catalog unavailable");
        var payload = await response.json();
        if (!valid(payload)) throw new Error("Invalid model catalog");
        saved = payload;
        expiresAt = payload.stale ? Date.now() + RETRY_MS : Date.now() + CACHE_TTL_MS;
        retryAt = Date.now() + RETRY_MS;
        render(payload);
        try { localStorage.setItem(key, JSON.stringify({ expiresAt: expiresAt, payload: payload })); } catch { /* Optional cache. */ }
      } catch {
        retryAt = Date.now() + RETRY_MS;
        status.textContent = saved
          ? "Showing the saved model list from " + new Date(saved.fetchedAt).toLocaleString("en-US") + ". Live updates are temporarily unavailable."
          : "Showing the saved model list. Live updates are temporarily unavailable; see model details for the full catalog.";
      } finally {
        clearTimeout(timeout);
        loading = false;
      }
    }

    refresh();
    document.addEventListener("visibilitychange", refresh);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
