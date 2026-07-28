---
title: Sustainable AI at UC San Diego
path: /about/sustainability.html
description: How TritonAI considers model fit, hosting, reuse, cost, resource use, and evidence when designing campus AI services.
eyebrow: About TritonAI
lastReviewed: 2026-07-27
audiences: [students, faculty, staff, developers, leaders]
source: TritonAI public architecture, memory architecture, and service design guidance
canonicalUrl: /about/sustainability.html
relatedSlides: [tritongpt-secure-scalable-ai-platform, uc-san-diego-ai-strategy-2026, memory-quality-is-an-operational-service]
bannerImage: /_images/building-branch-hero.jpg
bannerPosition: center 44%
---

<section class="hub-section hub-section-intro" aria-labelledby="sustainability-intro-heading">
<div class="row hub-split">
<div class="col-md-7 hub-split-copy"><p class="home-kicker">Service design and operations</p><h2 id="sustainability-intro-heading">Use the resources the work requires</h2><p class="hub-lede">Sustainable AI starts with choosing an appropriate model and workflow, avoiding unnecessary processing, reusing shared capabilities, and measuring quality, latency, cost, and resource use together.</p><p>No hosting choice is automatically best for every workload. TritonAI revisits the route as models, demand, evidence, and campus requirements change.</p></div>
<div class="col-md-5"><aside class="hub-quote-card"><span class="glyphicon glyphicon-leaf" aria-hidden="true"></span><h3>Measure before making a claim</h3><p>A public environmental comparison needs a defined workload, boundaries, measurement period, source, and owner. Architecture alone does not establish superiority.</p></aside></div>
</div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" aria-labelledby="sustainability-decisions-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">Design decisions</p><h2 id="sustainability-decisions-heading">What teams should account for</h2></div>
<div class="row hub-number-grid">
<div class="col-md-4"><article><span>01</span><h3>Model and workload fit</h3><p>Use the smallest capable model, reduce repeated work, and evaluate whether retrieval, rules, or a simpler tool can solve part of the task.</p></article></div>
<div class="col-md-4"><article><span>02</span><h3>Shared infrastructure</h3><p>Reuse the gateway, knowledge sources, skills, connectors, and hosting patterns campus already operates.</p></article></div>
<div class="col-md-4"><article><span>03</span><h3>Service lifecycle</h3><p>Monitor use and outcomes, revisit inefficient routes, and retire stale indexes, duplicated context, services, or pipelines that no longer justify their operating cost.</p></article></div>
</div></div>
</section>

<section class="hub-section" aria-labelledby="hosting-context-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-6 hub-split-copy"><p class="home-kicker">Hosting context</p><h2 id="hosting-context-heading">UC-controlled and enterprise cloud routes</h2><p>TritonAI supports approved enterprise cloud models and open models on UC-controlled infrastructure, including resources at the <a href="https://www.sdsc.edu/">San Diego Supercomputer Center</a>. The service, data, required capability, and approved controls determine which route is appropriate.</p><p>UC-controlled hosting can support shared capacity and local operational choices. Enterprise cloud routes can provide capabilities and scale under institutional agreements. Environmental comparisons still require workload-level evidence.</p><p><a class="btn btn-primary" href="/about/trust-architecture.html">Explore trust and hosting</a></p></div>
<div class="col-md-6"><dl class="hub-measure-grid"><div><dt>Quality</dt><dd>Can the selected route complete the task reliably?</dd></div><div><dt>Latency</dt><dd>Does the experience respond within the service need?</dd></div><div><dt>Cost</dt><dd>What does the full service consume and require to operate?</dd></div><div><dt>Resources</dt><dd>What compute, storage, retrieval, and repeated processing does it use?</dd></div></dl></div>
</div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" aria-labelledby="sustainability-practice-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">Operating practice</p><h2 id="sustainability-practice-heading">Questions for every service review</h2></div>
<ul class="hub-feature-list"><li><strong>Is the model larger than the task requires?</strong><span>Compare a smaller approved model and a non-generative method where either could meet the need.</span></li><li><strong>Are we repeating work?</strong><span>Reuse approved sources, cache safe results where appropriate, and remove unnecessary retries or duplicate pipelines.</span></li><li><strong>Is shared context still current?</strong><span>Check the source, owner, review date, index, and cached material. Correct or retire stale context before it causes more work.</span></li><li><strong>Does the evidence justify continued operation?</strong><span>Review use, outcome, reliability, support effort, and resource consumption together.</span></li><li><strong>Can another team reuse this?</strong><span>Package stable instructions, integrations, and evaluation patterns so the next service starts further ahead.</span></li></ul>
<p><a class="btn btn-default" href="/about/impact.html">See the evidence standard</a> <a class="btn btn-default" href="/skills/index.html">Browse reusable skills</a></p></div>
</section>
