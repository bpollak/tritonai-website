---
title: Trust, Privacy and Hosting
path: /about/trust-architecture.html
description: Where campus AI services run, how they reach models, what data they can use, and who is responsible.
eyebrow: Trust, privacy and hosting
lastReviewed: 2026-07-27
audiences: [staff, faculty, students, developers, leaders]
source: TritonAI architecture and memory presentations, plus public developer documentation
canonicalUrl: /about/trust-architecture.html
relatedSlides: [tritongpt-secure-scalable-ai-platform, tritongpt-to-tritonai-comparison, the-agentic-ai-stack, harness-memory-architecture, harness-memory-scale-ucsd]
---

<section class="hub-section hub-section-intro trust-intro" aria-labelledby="trust-intro-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-6 hub-split-copy">
<p class="home-kicker">Hosting and ownership</p>
<h2 id="trust-intro-heading">What we check before a service ships</h2>
<p class="hub-lede">TritonAI gives campus services approved routes to AI models and campus information. Anyone can review the privacy, security, and accessibility decisions behind those routes on this site.</p>
<p>The platform does not make a service trustworthy on its own. Each service still needs a stated purpose, data it is allowed to use, a named owner, and people who check the results.</p>
<p class="trust-intro-actions"><a class="btn btn-primary" href="/tritongpt/privacy.html">Read the privacy statement</a> <a class="btn btn-default" href="/developer-apis/index.html">Explore developer resources</a></p>
</div>
<div class="col-md-6 hub-split-media">
<figure class="trust-service-map" aria-describedby="trust-service-map-caption">
<p class="trust-service-map-label">How a supported service fits together</p>
<ol>
<li><span>01</span><div><strong>Campus service</strong><small>A named owner says who it is for, what it does, and how results get reviewed.</small></div></li>
<li><span>02</span><div><strong>TritonAI LLM Gateway</strong><small>One managed route from supported applications to approved models.</small></div></li>
<li class="trust-service-map-routes"><span>03</span><div><strong>Approved model routes</strong><ul><li>Enterprise cloud<br><small>AWS, Microsoft Azure, and Google Cloud Vertex AI</small></li><li>SDSC-hosted<br><small>Models hosted at the San Diego Supercomputer Center</small></li></ul></div></li>
<li><span>04</span><div><strong>Approved information sources</strong><small>Assistants look things up when someone asks, from sources they are cleared for.</small></div></li>
<li><span>05</span><div><strong>Bounded tools and review</strong><small>Agentic services use approved capabilities within a stated scope, with people reviewing consequential results and actions.</small></div></li>
</ol>
<figcaption class="sr-only" id="trust-service-map-caption">A campus service with a named owner connects through the TritonAI LLM Gateway to approved enterprise cloud or SDSC-hosted models, can use approved information sources and tools, and retains human review for consequential results and actions.</figcaption>
</figure>
</div>
</div>
</section>

<!-- AGENT_SECTION: ux-about-trust-layers -->
<section class="hub-section hub-section-dark hub-full-bleed trust-layers" id="trust-layers" aria-labelledby="trust-layers-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">The shared foundation</p><h2 id="trust-layers-heading">What the foundation separates</h2><p>Hosting, model access, information sources, and actions solve different problems. Each needs its own approval and operating boundary.</p></div>
<div class="trust-layer-grid trust-layer-grid-four">
<article><span>01</span><h3>Approved hosting choices</h3><p>A service can use approved enterprise cloud models or models hosted locally at SDSC. Which route it takes depends on the data involved and the controls that data requires.</p><ul><li>AWS</li><li>Microsoft Azure</li><li>Google Cloud Vertex AI</li><li>SDSC-hosted models</li></ul></article>
<article><span>02</span><h3>One gateway for model access</h3><p>Supported applications reach models through a single managed gateway. It gives everyone the same technical path. It does not approve what data a service may send through it.</p></article>
<article><span>03</span><h3>Approved sources at request time</h3><p>When someone asks a question, the assistant looks the answer up in sources it is cleared for. The model itself was not trained on private campus content.</p></article>
<article><span>04</span><h3>Bounded tools and actions</h3><p>Skills and connectors expose only the capabilities approved for a service. The service defines who may use them, where a person reviews the result, and when the workflow must stop or escalate.</p></article>
</div>
</div>
</section>
<!-- END_AGENT_SECTION -->

<section class="hub-section trust-context" id="context-lifecycle" aria-labelledby="context-lifecycle-heading">
<div class="hub-heading"><p class="home-kicker">Context lifecycle</p><h2 id="context-lifecycle-heading">How context becomes reusable</h2><p>An AI service can use recent context and shared campus knowledge without treating every conversation or document as permanent memory. Promotion into shared use is an explicit human decision.</p></div>
<ol class="memory-governance-flow">
<li><span>01</span><div><h3>Task context</h3><p>The service retrieves only what the current task and user are allowed to use. Personal context stays private by default.</p></div></li>
<li><span>02</span><div><h3>Reviewed shared context</h3><p>A person decides what a team or service may reuse. The record includes its source, owner, review date, and freshness expectations.</p></div></li>
<li><span>03</span><div><h3>Governed agent use</h3><p>Agents retrieve approved context within their scope. Proposed corrections and additions return to a person for approval, reconciliation, or retirement.</p></div></li>
</ol>
<div class="memory-trust-rail"><p><strong>Trust rail</strong><span>These checks follow context from source to use.</span></p><ul><li>Provenance</li><li>Freshness</li><li>Privacy</li><li>Human correction</li></ul></div>
</section>

<section class="hub-section trust-responsibility" id="trust-responsibility" aria-labelledby="trust-responsibility-heading">
<div class="hub-heading"><p class="home-kicker">Shared responsibility</p><h2 id="trust-responsibility-heading">Who decides what</h2><p>Shared infrastructure gives every team the same starting point. It does not stand in for review and ownership at the service level.</p></div>
<div class="trust-responsibility-grid">
<article><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span><div><h3>The TritonAI foundation</h3><ul><li>Runs the shared gateway and the supported model routes</li><li>Publishes the technical patterns other teams build on</li><li>Keeps one consistent path for getting approved access</li></ul></div></article>
<article><span class="glyphicon glyphicon-user" aria-hidden="true"></span><div><h3>Each campus service</h3><ul><li>Says what it is for, who uses it, and what data it may touch</li><li>Tests the output and keeps a person in the workflow</li><li>Names who answers for accessibility, support, and operations</li></ul></div></article>
</div>
<aside class="trust-boundary-note"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span><p><strong>Gateway access does not authorize new data use.</strong> Getting connected does not widen what your service is allowed to touch. The service owner still owns the approved data, testing, and accessibility. They also own support and human review.</p></aside>
</section>

<section class="hub-section hub-section-sand hub-full-bleed trust-surfaces" id="trust-surfaces" aria-labelledby="trust-surfaces-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">Where people experience it</p><h2 id="trust-surfaces-heading">Where you actually meet it</h2><p>The same architecture sits behind all of these. Each one still needs its own named owner and an approved support path.</p></div>
<div class="trust-surface-grid">
<article><span class="glyphicon glyphicon-comment" aria-hidden="true"></span><h3>TritonGPT</h3><p>A campus assistant for chat, documents, and available models.</p></article>
<article><span class="glyphicon glyphicon-globe" aria-hidden="true"></span><h3>Website assistants</h3><p>An assistant sitting on a department site, answering from that site's content.</p></article>
<article><span class="glyphicon glyphicon-phone" aria-hidden="true"></span><h3>Mobile experiences</h3><p>AI features delivered through approved campus applications.</p></article>
<article><span class="glyphicon glyphicon-education" aria-hidden="true"></span><h3>Teaching and learning</h3><p>Course tools built around what the instructor wants students to learn.</p></article>
<article><span class="glyphicon glyphicon-console" aria-hidden="true"></span><h3>Developer applications and agents</h3><p>Department tools and supervised workflows built through supported APIs.</p></article>
</div>
</div>
</section>

<section class="hub-section hub-subscribe trust-start" id="trust-start" aria-labelledby="trust-start-heading">
<div class="row hub-split hub-split-align-center"><div class="col-md-8"><p class="home-kicker">Start with the service</p><h2 id="trust-start-heading">Work out the need before picking the model</h2><p>Come to the first conversation knowing who it is for, what it should do, what data it may use, and who reviews the output.</p></div><div class="col-md-4 hub-subscribe-action"><a class="btn btn-primary btn-lg" href="/developer-apis/start.html">Start the access process</a></div></div>
</section>
