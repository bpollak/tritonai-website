import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  addArticle,
  existingUrls,
  normalizeUrl,
  renderArticleSections,
  rewriteMarkdown,
  SECTION_END,
  SECTION_START,
} from "../scripts/lib/media-articles.mjs";
import { discover, isRelevant, publisherFromHost } from "../scripts/sync-media-coverage.mjs";

function baseData() {
  return {
    schemaVersion: 1,
    lastReviewed: "2026-07-30",
    sections: [
      {
        year: 2025,
        heading: "Existing section",
        description: "Already curated.",
        articles: [
          {
            date: "2025-08-08",
            source: "CIO.com",
            title: "Unpacking UC San Diego's Use of LLMs",
            url: "https://www.cio.com/article/4032770/unpacking.html",
            kind: "Case study",
            curated: true,
          },
        ],
      },
    ],
  };
}

test("normalizeUrl strips tracking params and dedupes variants", () => {
  const a = normalizeUrl("https://example.com/post?utm_source=twitter&id=1");
  const b = normalizeUrl("https://example.com/post?id=1&fbclid=abc");
  assert.equal(a, b);
  assert.equal(normalizeUrl("not a url"), null);
  assert.equal(normalizeUrl("mailto:foo@bar.com"), null);
});

test("addArticle inserts into the right year and refuses duplicates", () => {
  const data = baseData();
  const added = addArticle(data, {
    date: "2025-09-01",
    source: "EdTech Magazine",
    title: "New coverage of TritonGPT",
    url: "https://edtechmagazine.com/article/tritongpt",
    kind: "News",
  });
  assert.equal(added, true);
  // Newer article sorts first within the year.
  assert.equal(data.sections[0].articles[0].date, "2025-09-01");

  const dup = addArticle(data, {
    date: "2025-09-01",
    source: "EdTech Magazine",
    title: "New coverage of TritonGPT",
    url: "https://edtechmagazine.com/article/tritongpt?utm_source=x",
    kind: "News",
  });
  assert.equal(dup, false);
  assert.equal(data.sections[0].articles.length, 2);
});

test("addArticle creates a section for a new year", () => {
  const data = baseData();
  addArticle(data, {
    date: "2026-01-15",
    source: "Forbes",
    title: "TritonGPT in 2026",
    url: "https://www.forbes.com/sites/x/tritongpt-2026",
    kind: "Article",
  });
  assert.equal(data.sections[0].year, 2026);
});

test("renderArticleSections produces the expected markup", () => {
  const data = baseData();
  const html = renderArticleSections(data);
  assert.match(html, /aria-labelledby="articles-2025-heading"/);
  assert.match(html, /<h2 id="articles-2025-heading">Existing section<\/h2>/);
  assert.match(html, /href="https:\/\/www\.cio\.com\/article\/4032770\/unpacking\.html"/);
  assert.match(html, /<span>Aug<\/span><strong>8<\/strong>/);
});

test("rewriteMarkdown replaces only the generated region", () => {
  const markdown = `---\ntitle: Test\n---\n<p class="lead">lead</p>\n\n${SECTION_START}\nOLD\n${SECTION_END}\n\n<footer></footer>\n`;
  const out = rewriteMarkdown(markdown, "<section>NEW</section>");
  assert.ok(out.includes(SECTION_START));
  assert.ok(out.includes(SECTION_END));
  assert.ok(out.includes("<section>NEW</section>"));
  assert.ok(!out.includes("\nOLD\n"));
  assert.ok(out.includes("<footer></footer>"));
});

test("isRelevant accepts TritonGPT coverage and blocks self/social hosts", () => {
  assert.ok(isRelevant({ title: "TritonGPT launches at UCSD", url: "https://edtechmagazine.com/x", snippet: "" }));
  assert.ok(isRelevant({ title: "UC San Diego AI chatbot expands", url: "https://www.govtech.com/x", snippet: "ai" }));
  assert.equal(isRelevant({ title: "TritonGPT homepage", url: "https://tritonai.ucsd.edu/x", snippet: "" }), false);
  assert.equal(isRelevant({ title: "TritonGPT tweet", url: "https://x.com/x", snippet: "" }), false);
  assert.equal(isRelevant({ title: "Unrelated higher ed news", url: "https://example.com/x", snippet: "tuition" }), false);
});

test("publisherFromHost maps known higher-ed and news hosts", () => {
  assert.equal(publisherFromHost("www.dailycal.org"), "The Daily Californian");
  assert.equal(publisherFromHost("ucsdguardian.org"), "The UCSD Guardian");
  assert.equal(publisherFromHost("www.cio.com"), "CIO.com");
  assert.equal(publisherFromHost("example.com"), "example.com");
});

test("discover appends relevant results and skips known urls", async () => {
  const data = baseData();
  const fakeSearch = async () => [
    {
      title: "TritonGPT expands across campus",
      url: "https://edtechmagazine.com/article/tritongpt-expands",
      snippet: "UC San Diego AI",
    },
    {
      title: "Unrelated story",
      url: "https://example.com/other",
      snippet: "tuition costs",
    },
    {
      title: "Already archived",
      url: "https://www.cio.com/article/4032770/unpacking.html",
      snippet: "TritonGPT",
    },
  ];
  const fakeMeta = async () => ({ date: "2026-02-10" });
  const added = await discover(data, ["TritonGPT"], { searchFn: fakeSearch, fetchMeta: fakeMeta });
  assert.equal(added.length, 1);
  assert.equal(added[0].url, "https://edtechmagazine.com/article/tritongpt-expands");
  assert.equal(added[0].date, "2026-02-10");
  assert.equal(added[0].discoveredVia, "duckduckgo");
  assert.equal(existingUrls(data).has("https://edtechmagazine.com/article/tritongpt-expands"), true);
});

test("renderLatestCoverage shows the newest articles and a link to the archive", async () => {
  const { renderLatestCoverage } = await import("../scripts/lib/media-articles.mjs");
  const data = baseData();
  addArticle(data, {
    date: "2026-02-10",
    source: "EdTech Magazine",
    title: "New coverage of TritonGPT",
    url: "https://edtechmagazine.com/article/tritongpt",
    kind: "News",
  });
  const html = renderLatestCoverage(data, 5);
  assert.match(html, /id="media-latest-heading"/);
  assert.match(html, /New coverage of TritonGPT/);
  assert.match(html, /href="\/about\/media-articles\.html"/);
  // The newest article appears first.
  const newestIdx = html.indexOf("New coverage of TritonGPT");
  const olderIdx = html.indexOf("Unpacking");
  assert.ok(newestIdx < olderIdx && newestIdx > 0);
});
