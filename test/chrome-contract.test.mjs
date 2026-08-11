import assert from "node:assert/strict";
import test from "node:test";
import { load } from "cheerio";
import {
  buildContract,
  canonicalizeUrl,
  checkCrossPageConsistency,
  checkGoldenFingerprint,
  checkStructuralRules,
  extractChrome,
  extractRegion,
  hashRegion,
  regionElements,
} from "../scripts/lib/chrome-contract.mjs";

// The drawer markup this site ships, reduced to the parts the contract pins.
function drawer({ form = true, scopeName = "search-scope", termName = "search-term-m" } = {}) {
  const search = form
    ? `<form action="/search/index.html" method="get">
         <label class="sr-only" for="search-scope-mobile">Search scope</label>
         <select class="search-scope" id="search-scope-mobile" name="${scopeName}">
           <option selected="selected" value="tritonai">This Site</option>
         </select>
         <div class="input-group">
           <label class="sr-only" for="search-term-mobile">Search term</label>
           <input class="form-control search-term" id="search-term-mobile" name="${termName}" placeholder="Search..." type="search">
         </div>
         <input class="sr-only" type="submit" value="Submit">
       </form>`
    : `<a href="/search/index.html">Search</a>`;
  return `<div class="navmenu navmenu-default navmenu-fixed-left offcanvas" id="mobile-navigation" style="">
      <ul class="nav navbar-nav navbar-right msearch"><li><div class="search">
        <div class="search-content" id="search-m">${search}</div>
      </div></li></ul>
      <ul class="nav navmenu-nav"><li><a href="/about/index.html">About</a></li></ul>
    </div>`;
}

function page(body, { basePath = "" } = {}) {
  const prefix = basePath ? `/${basePath}` : "";
  return load(`<html><body>
    <header class="layout-header">
      <a class="skip-to-main" href="#main-content">Skip to main content</a>
      <div id="uc-emergency"></div>
      <section class="layout-title"><a class="title-header" href="${prefix}/">TritonAI</a><a class="title-logo" href="https://www.ucsd.edu">UC San Diego</a></section>
    </header>
    ${body.replaceAll('href="/', `href="${prefix}/`).replaceAll('action="/', `action="${prefix}/`)}
    <nav class="navbar navbar-default navbar-static-top"><ul class="navbar-nav-list"><li><a href="${prefix}/about/index.html">About</a></li></ul></nav>
    <main id="main-content">page specific content</main>
    <footer class="footer"><div class="container"><span class="footer-copyright-year">2026</span></div>
      <script type="application/x-tritonai-idle-script" data-idle-src="https://cdn.ucsd.edu/tritongpt/widget/js/tgpt-loader.js"></script>
    </footer>
  </body></html>`);
}

const DRAWER_SELECTOR = ".navmenu.navmenu-default.navmenu-fixed-left.offcanvas:not(.offcanvas-clone)";

const SEARCH_FORM_RULE = {
  id: "mobile-drawer.search-form",
  region: "mobile-drawer",
  within: ".search-content",
  source: "vendor/decorator-5/templates/two-column.html",
  require: [
    { selector: "form[action][method='get']", count: 1 },
    { selector: "form select.search-scope[name='search-scope']", count: 1 },
    { selector: "form input.search-term[type='search']", count: 1 },
  ],
  forbid: [{ selector: "a[href]", reason: "the drawer search must submit a form" }],
};

const GPT_RULE = {
  id: "gpt-loader.embed",
  region: "gpt-loader",
  require: [
    { attribute: "data-idle-src", equals: "https://cdn.ucsd.edu/tritongpt/widget/js/tgpt-loader.js" },
    { attribute: "type", equals: "application/x-tritonai-idle-script" },
    { attribute: "src", absent: true },
  ],
};

test("canonicalizeUrl strips the site base path and leaves everything else alone", () => {
  assert.equal(canonicalizeUrl("/tritonai-website/search/index.html", "/", "tritonai-website"), "/search/index.html");
  assert.equal(canonicalizeUrl("/tritonai-website", "/", "tritonai-website"), "/");
  assert.equal(canonicalizeUrl("/search/index.html", "/", ""), "/search/index.html");
  assert.equal(canonicalizeUrl("https://cdn.ucsd.edu/a.js", "/", "tritonai-website"), "https://cdn.ucsd.edu/a.js");
  assert.equal(canonicalizeUrl("//cdn.ucsd.edu/a.js", "/", "tritonai-website"), "//cdn.ucsd.edu/a.js");
  assert.equal(canonicalizeUrl("#main-content", "/", "tritonai-website"), "#main-content");
  assert.equal(canonicalizeUrl("mailto:x@ucsd.edu", "/", ""), "mailto:x@ucsd.edu");
  // A path that merely starts with the same letters is not a base-path match.
  assert.equal(canonicalizeUrl("/tritonai-website-guide/x.html", "/", "tritonai-website"), "/tritonai-website-guide/x.html");
});

test("the same chrome hashes identically in both deployment modes", () => {
  const plain = extractChrome(page(drawer()), { route: "/about/index.html", basePath: "" });
  const prefixed = extractChrome(page(drawer(), { basePath: "tritonai-website" }), {
    route: "/about/index.html",
    basePath: "tritonai-website",
  });
  for (const id of Object.keys(plain)) {
    assert.equal(prefixed[id].hash, plain[id].hash, `region ${id} must survive the base path`);
  }
});

test("attribute order, class order, and empty class or style do not change the fingerprint", () => {
  const canonical = extractRegion(
    load('<div class="navmenu navmenu-default navmenu-fixed-left offcanvas" id="x"><span class="a b">t</span></div>'),
    DRAWER_SELECTOR,
  );
  const shuffled = extractRegion(
    load('<div id="x" class="offcanvas navmenu-fixed-left navmenu navmenu-default" style=""><span class="b a">t</span></div>'),
    DRAWER_SELECTOR,
  );
  assert.equal(hashRegion(shuffled), hashRegion(canonical));
});

test("a non-empty style attribute does stay in the fingerprint", () => {
  const plain = extractRegion(load('<div class="navmenu navmenu-default navmenu-fixed-left offcanvas"></div>'), DRAWER_SELECTOR);
  const styled = extractRegion(
    load('<div class="navmenu navmenu-default navmenu-fixed-left offcanvas" style="display:none"></div>'),
    DRAWER_SELECTOR,
  );
  assert.notEqual(hashRegion(styled), hashRegion(plain));
});

test("comments and whitespace are not part of the fingerprint", () => {
  const bare = extractRegion(load('<div class="navmenu navmenu-default navmenu-fixed-left offcanvas"><span>t</span></div>'), DRAWER_SELECTOR);
  const noisy = extractRegion(
    load('<div class="navmenu navmenu-default navmenu-fixed-left offcanvas">\n  <!-- nav -->\n  <span>  t  </span>\n</div>'),
    DRAWER_SELECTOR,
  );
  assert.equal(hashRegion(noisy), hashRegion(bare));
});

test("build-owned navigation lists are excluded, so adding a nav item is not chrome drift", () => {
  const one = extractRegion(load(drawer()), DRAWER_SELECTOR);
  const two = extractRegion(
    load(drawer().replace("</ul>\n    </div>", '<li><a href="/tools/index.html">Tools</a></li></ul>\n    </div>')),
    DRAWER_SELECTOR,
  );
  assert.equal(hashRegion(two), hashRegion(one));
});

test("the incident: replacing the drawer search form with a link fails tier 3", () => {
  const $ = page(drawer({ form: false }));
  const findings = checkStructuralRules($, regionElements($), [SEARCH_FORM_RULE]);
  assert.ok(findings.length >= 2, "the missing form and the forbidden link should both be reported");
  assert.ok(findings.every((finding) => finding.rule === "chrome/structure/mobile-drawer.search-form"));
  assert.ok(findings.some((finding) => /must not contain `a\[href\]`/.test(finding.issue)));
  assert.ok(findings.some((finding) => /form select\.search-scope/.test(finding.issue)));
  // The finding has to show the agent its own markup, or it cannot self-correct.
  assert.ok(findings.some((finding) => finding.markup?.includes('<a href="/search/index.html">')));
  assert.ok(findings.every((finding) => finding.source === "vendor/decorator-5/templates/two-column.html"));
});

test("tier 3 catches a renamed search input that tier 1 and tier 2 would both let through", () => {
  const rule = {
    ...SEARCH_FORM_RULE,
    id: "mobile-drawer.search-target",
    require: [{ selector: "form input.search-term[name='search-term-m']", count: 1 }],
    forbid: [],
  };
  const $ = page(drawer({ termName: "search-term" }));
  const findings = checkStructuralRules($, regionElements($), [rule]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].issue, /search-term-m/);
});

test("tier 1 stays green when every route changes identically", () => {
  // This is why tier 3 exists. One shell feeds every route, so a shell edit is
  // perfectly consistent drift and only a structural rule can see it.
  const byRoute = new Map(
    ["/", "/about/index.html", "/tools/index.html"].map((route) => [
      route,
      extractChrome(page(drawer({ form: false })), { route, basePath: "" }),
    ]),
  );
  assert.deepEqual(checkCrossPageConsistency(byRoute), []);
});

test("tier 1 reports the minority route against the majority with a readable diff", () => {
  const byRoute = new Map([
    ["/", extractChrome(page(drawer()), { route: "/", basePath: "" })],
    ["/about/index.html", extractChrome(page(drawer()), { route: "/about/index.html", basePath: "" })],
    ["/tools/index.html", extractChrome(page(drawer({ form: false })), { route: "/tools/index.html", basePath: "" })],
  ]);
  const findings = checkCrossPageConsistency(byRoute);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].page, "/tools/index.html");
  assert.equal(findings[0].rule, "chrome/consistent/mobile-drawer");
  assert.equal(findings[0].referenceCount, 2);
  assert.ok(findings[0].diff.length > 0);
});

test("tier 2 accepts a matching build and rejects a changed one", () => {
  const good = new Map([["/", extractChrome(page(drawer()), { route: "/", basePath: "" })]]);
  const contract = buildContract(good, { siteBasePath: "" });
  assert.deepEqual(checkGoldenFingerprint(good, contract), []);

  const changed = new Map([["/", extractChrome(page(drawer({ form: false })), { route: "/", basePath: "" })]]);
  const findings = checkGoldenFingerprint(changed, contract);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, "chrome/golden/mobile-drawer");
  assert.match(findings[0].remedy, /chrome:accept/);
});

test("tier 2 rejects a hand-edited contract whose hash no longer matches its tree", () => {
  const regions = new Map([["/", extractChrome(page(drawer()), { route: "/", basePath: "" })]]);
  const contract = buildContract(regions, { siteBasePath: "" });
  // Someone edits the recorded tree by hand and leaves the sha alone.
  contract.regions["mobile-drawer"].canonical.a.push(["data-tampered", "yes"]);
  const findings = checkGoldenFingerprint(regions, contract);
  assert.equal(findings.length, 1);
  assert.match(findings[0].issue, /hand-edited/);
});

test("tier 2 reports a missing contract rather than passing silently", () => {
  const regions = new Map([["/", extractChrome(page(drawer()), { route: "/", basePath: "" })]]);
  const findings = checkGoldenFingerprint(regions, null);
  assert.equal(findings.length, 1);
  assert.match(findings[0].remedy, /chrome:accept/);
});

test("the TritonGPT loader must keep its exact CDN url and stay deferred", () => {
  const $ = page(drawer());
  assert.deepEqual(checkStructuralRules($, regionElements($), [GPT_RULE]), []);

  const rehosted = page(drawer());
  rehosted("footer.footer > script[data-idle-src]").attr("data-idle-src", "/_resources/js/tgpt-loader.js");
  const moved = checkStructuralRules(rehosted, regionElements(rehosted), [GPT_RULE]);
  assert.equal(moved.length, 1);
  assert.match(moved[0].issue, /data-idle-src/);

  const eager = page(drawer());
  eager("footer.footer > script[data-idle-src]").attr("src", "https://cdn.ucsd.edu/tritongpt/widget/js/tgpt-loader.js");
  const blocking = checkStructuralRules(eager, regionElements(eager), [GPT_RULE]);
  assert.equal(blocking.length, 1);
  assert.match(blocking[0].issue, /must not be present/);
});

test("a url-pinning rule holds in both deployment modes", () => {
  // Structural rules run against the raw DOM, which still carries the base-path
  // prefix on the Pages build. equalsUrl normalizes before comparing, so one
  // rule covers both builds instead of failing on every prefixed route.
  const rule = {
    id: "mobile-drawer.search-target",
    region: "mobile-drawer",
    within: ".search-content",
    require: [{ selector: "form", attribute: "action", equalsUrl: "/search/index.html" }],
  };
  for (const basePath of ["", "tritonai-website"]) {
    const $ = page(drawer(), { basePath });
    assert.deepEqual(
      checkStructuralRules($, regionElements($), [rule], { route: "/about/index.html", basePath }),
      [],
      `equalsUrl must hold with basePath=${JSON.stringify(basePath)}`,
    );
  }

  // A genuinely wrong target still fails in both modes.
  for (const basePath of ["", "tritonai-website"]) {
    const $ = page(drawer(), { basePath });
    $(".navmenu .search-content form").attr("action", "https://example.com/search");
    const findings = checkStructuralRules($, regionElements($), [rule], { route: "/about/index.html", basePath });
    assert.equal(findings.length, 1);
    assert.match(findings[0].issue, /example\.com/);
  }
});

test("a missing region is reported rather than silently skipped", () => {
  const $ = page(drawer());
  $(DRAWER_SELECTOR).remove();
  const findings = checkStructuralRules($, regionElements($), [SEARCH_FORM_RULE]);
  assert.equal(findings.length, 1);
  assert.match(findings[0].issue, /absent/);
});

test("editing the canvas is never chrome drift", () => {
  const before = extractChrome(page(drawer()), { route: "/", basePath: "" });
  const $ = page(drawer());
  $("main#main-content").html("<h1>Completely different content</h1><p>Rewritten.</p>");
  const after = extractChrome($, { route: "/", basePath: "" });
  for (const id of Object.keys(before)) assert.equal(after[id].hash, before[id].hash);
});
