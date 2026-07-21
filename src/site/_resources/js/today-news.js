(function () {
  "use strict";

  var feedUrl = "https://today.ucsd.edu/news-and-features-api?category=190&limit=3";
  var todayOrigin = "https://today.ucsd.edu";
  var recentPhotoCutoff = 1660546800000;

  function safeUrl(value) {
    try {
      var url = new URL(value, todayOrigin);
      return /^https?:$/.test(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function storyImage(story) {
    var image = Number(story.entry_date) >= recentPhotoCutoff ? story.teaser_photo : story.feature_image || story.primary_photo;
    var resolved = safeUrl(image || "https://today.ucsd.edu/img/news-placeholder.jpg");
    if (!resolved || Number(story.entry_date) < recentPhotoCutoff) return resolved;
    try {
      var url = new URL(resolved);
      if (!url.pathname.includes("/_ucsd-feed/")) url.pathname = url.pathname.replace(/\/([^/]+)$/, "/_ucsd-feed/$1");
      return url.href;
    } catch {
      return resolved;
    }
  }

  function storyUrl(story) {
    var segments = { 21: "/photo-essays/", 12: "/slideshows/", 17: "/videos/", 24: "/area-story/" };
    var segment = segments[Number(story.channel_id)] || "/story/";
    var slug = String(story.url_title || "").replace(/^\/+/, "");
    return slug ? safeUrl(segment + slug) : "";
  }

  function storyDate(value) {
    var date = new Date(Number(value));
    if (Number.isNaN(date.valueOf())) return "";
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
  }

  function createCard(story) {
    var column = document.createElement("div");
    column.className = "col-sm-4";
    var card = document.createElement("a");
    card.className = "panel panel-default";
    card.href = storyUrl(story) || "https://today.ucsd.edu/";
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    var image = document.createElement("img");
    image.className = "img-responsive";
    image.src = storyImage(story);
    image.alt = String(story.pp_alt || "");
    image.loading = "lazy";
    image.decoding = "async";

    var heading = document.createElement("div");
    heading.className = "panel-heading";
    var date = document.createElement("span");
    date.className = "panel-news-date small";
    date.textContent = storyDate(story.entry_date);
    var title = document.createElement("h3");
    title.className = "panel-news-title";
    title.textContent = String(story.title || "Latest AI story from Today@UCSD");

    heading.append(date, title);
    card.append(image, heading);
    column.append(card);
    return column;
  }

  function initializeTodayNews() {
    var section = document.querySelector("[data-today-news]");
    if (!section) return;
    var cards = section.querySelector("[data-today-news-cards]");
    var status = section.querySelector("[data-today-news-status]");
    var fallback = section.querySelector("[data-today-news-fallback]");
    if (!cards || !status || !fallback) return;
    var started = false;

    function fail() {
      cards.replaceChildren();
      cards.removeAttribute("aria-busy");
      var column = document.createElement("div");
      column.className = "col-xs-12";
      var alert = document.createElement("div");
      alert.className = "alert alert-info";
      alert.textContent = "Today@UCSD stories are temporarily unavailable. ";
      var link = document.createElement("a");
      link.href = "https://today.ucsd.edu/search/results?q=ai#gsc.tab=0&gsc.q=ai&gsc.page=1";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Browse current AI coverage on Today@UCSD.";
      alert.append(link);
      column.append(alert);
      cards.append(column);
      fallback.hidden = true;
      status.textContent = "Today@UCSD stories are temporarily unavailable.";
    }

    async function loadStories() {
      if (started) return;
      started = true;
      try {
        var response = await fetch(feedUrl, { credentials: "omit" });
        if (!response.ok) throw new Error(`Today@UCSD returned ${response.status}`);
        var stories = await response.json();
        if (!Array.isArray(stories) || !stories.length) throw new Error("Today@UCSD returned no stories");
        cards.replaceChildren();
        stories.slice(0, 3).forEach(function (story) {
          cards.append(createCard(story));
        });
        cards.removeAttribute("aria-busy");
        fallback.hidden = true;
        status.textContent = `Loaded ${Math.min(stories.length, 3)} latest AI ${stories.length === 1 ? "story" : "stories"} from Today@UCSD.`;
      } catch {
        fail();
      }
    }

    if (!("IntersectionObserver" in window)) {
      loadStories();
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
        observer.disconnect();
        loadStories();
      },
      { rootMargin: "300px 0px", threshold: 0.01 },
    );
    observer.observe(section);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeTodayNews);
  else initializeTodayNews();
})();
