# Hosted search cutover

The static staging site keeps “This Site” searches pointed at the production `tritonai.ucsd.edu` index. This preserves live search while GitHub Pages is only a staging host.

Before moving the production domain:

1. Confirm the future host serves every route in `_data/routes.json`, plus `sitemap.xml` and `robots.txt`.
2. Ask the hosted-search owner to crawl the future production origin and verify representative generated pages, use cases, PDFs, and legacy routes.
3. Compare result coverage and ranking with the current production index.
4. Change the search collection/site identifier only after the new index is ready.
5. Remove the staging override in `scripts/build.mjs`, build without `SITE_BASE_PATH`, and test “This Site” plus all UCSD search scopes.
6. Monitor zero-result queries and crawl failures after cutover; retain the old index until the acceptance window closes.

Do not change the current staging override merely because the website is available on GitHub Pages.
