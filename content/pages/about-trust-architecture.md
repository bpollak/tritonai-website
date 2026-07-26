---
title: Trust, Privacy and Hosting
path: /about/trust-architecture.html
description: How TritonAI combines approved hosting, shared model access, approved information sources, and clear service ownership.
eyebrow: Trust, privacy and hosting
lastReviewed: 2026-07-26
audiences: [staff, faculty, students, developers, leaders]
source: TritonAI architecture presentation and public developer documentation
canonicalUrl: /about/trust-architecture.html
relatedSlides: [platform-architecture, six-principles-for-enterprise-ai]
landingHub: true
---

<section class="hub-section hub-section-intro trust-intro" aria-labelledby="trust-intro-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-6 hub-split-copy">
<p class="home-kicker">Clear choices, clear owners</p>
<h2 id="trust-intro-heading">Trust comes from the whole service—not just the model</h2>
<p class="hub-lede">TritonAI gives campus services approved ways to reach AI models and information sources while keeping privacy, security, testing, accessibility, and support visible.</p>
<p>Each service still needs a clear purpose, approved data use, a named owner, and people who review the results.</p>
<p class="trust-intro-actions"><a class="btn btn-primary" href="/tritongpt/privacy.html">Read the privacy statement</a> <a class="btn btn-default" href="/developer-apis/index.html">Explore developer resources</a></p>
</div>
<div class="col-md-6 hub-split-media">
<figure class="trust-service-map" aria-describedby="trust-service-map-caption">
<p class="trust-service-map-label">How a supported service fits together</p>
<ol>
<li><span>01</span><div><strong>Campus service</strong><small>A named owner defines the users, purpose, data, and review process.</small></div></li>
<li><span>02</span><div><strong>TritonAI LLM Gateway</strong><small>One managed access path connects supported applications to approved models.</small></div></li>
<li class="trust-service-map-routes"><span>03</span><div><strong>Approved model routes</strong><ul><li>Enterprise cloud<br><small>AWS, Microsoft Azure, and Google Cloud Vertex AI</small></li><li>SDSC-hosted<br><small>Models hosted at the San Diego Supercomputer Center</small></li></ul></div></li>
<li><span>04</span><div><strong>Approved information sources</strong><small>Assistants can look up relevant information when a user asks a question.</small></div></li>
</ol>
<figcaption class="sr-only" id="trust-service-map-caption">A campus service with a named owner connects through the TritonAI LLM Gateway to approved enterprise cloud or SDSC-hosted models and can use approved information sources when responding.</figcaption>
</figure>
</div>
</div>
</section>

<!-- AGENT_SECTION: ux-about-trust-layers -->
<section class="hub-section hub-section-dark hub-full-bleed trust-layers" id="trust-layers" aria-labelledby="trust-layers-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">The shared foundation</p><h2 id="trust-layers-heading">Three parts work together</h2><p>Hosting, model access, and information sources solve different problems. A trustworthy service needs to treat them separately.</p></div>
<div class="trust-layer-grid">
<article><span>01</span><h3>Approved hosting choices</h3><p>Services can use approved enterprise cloud models or locally hosted models at SDSC. The right route depends on the service, data, capability, and required controls.</p><ul><li>AWS</li><li>Microsoft Azure</li><li>Google Cloud Vertex AI</li><li>SDSC-hosted models</li></ul></article>
<article><span>02</span><h3>One gateway for model access</h3><p>Supported applications use one managed gateway to reach available models. The gateway provides a consistent technical path, but it does not approve a service’s data use.</p></article>
<article><span>03</span><h3>Approved sources at request time</h3><p>An assistant can look up relevant information from approved sources when a user asks a question. This does not mean the model was trained on private campus content.</p></article>
</div>
</div>
</section>
<!-- END_AGENT_SECTION -->

<section class="hub-section trust-responsibility" id="trust-responsibility" aria-labelledby="trust-responsibility-heading">
<div class="hub-heading"><p class="home-kicker">Shared responsibility</p><h2 id="trust-responsibility-heading">The platform and each service own different decisions</h2><p>Shared infrastructure helps teams start from a consistent foundation. It does not replace service-level review and ownership.</p></div>
<div class="trust-responsibility-grid">
<article><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span><div><h3>The TritonAI foundation</h3><ul><li>Operates the shared gateway and supported model routes</li><li>Publishes common technical patterns and guidance</li><li>Provides a consistent path for approved access</li></ul></div></article>
<article><span class="glyphicon glyphicon-user" aria-hidden="true"></span><div><h3>Each campus service</h3><ul><li>Defines the purpose, users, and approved data</li><li>Tests quality and keeps human review in the workflow</li><li>Names an owner for accessibility, support, and operations</li></ul></div></article>
</div>
<aside class="trust-boundary-note"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span><p><strong>Gateway access does not authorize new data use.</strong> The service owner remains responsible for approved data, testing, accessibility, support, and human review.</p></aside>
</section>

<section class="hub-section hub-section-sand hub-full-bleed trust-surfaces" id="trust-surfaces" aria-labelledby="trust-surfaces-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">Where people experience it</p><h2 id="trust-surfaces-heading">One foundation can support many kinds of service</h2><p>The same architecture can support different user experiences. Each one still needs a named owner and an approved support path.</p></div>
<div class="trust-surface-grid">
<article><span class="glyphicon glyphicon-comment" aria-hidden="true"></span><h3>TritonGPT</h3><p>A campus assistant for chat, documents, and available models.</p></article>
<article><span class="glyphicon glyphicon-globe" aria-hidden="true"></span><h3>Website assistants</h3><p>Focused help embedded in a department or service website.</p></article>
<article><span class="glyphicon glyphicon-phone" aria-hidden="true"></span><h3>Mobile experiences</h3><p>AI features delivered through approved campus applications.</p></article>
<article><span class="glyphicon glyphicon-education" aria-hidden="true"></span><h3>Teaching and learning</h3><p>Instructional experiences designed around clear learning goals.</p></article>
<article><span class="glyphicon glyphicon-console" aria-hidden="true"></span><h3>Developer applications and agents</h3><p>Department tools and supervised workflows built through supported APIs.</p></article>
</div>
</div>
</section>

<section class="hub-section hub-subscribe trust-start" id="trust-start" aria-labelledby="trust-start-heading">
<div class="row hub-split hub-split-align-center"><div class="col-md-8"><p class="home-kicker">Start with the service</p><h2 id="trust-start-heading">Define the need before choosing the model</h2><p>Bring the users, purpose, approved data, review process, owner, and success measure into the first conversation.</p></div><div class="col-md-4 hub-subscribe-action"><a class="btn btn-primary btn-lg" href="/developer-apis/start.html">Start the access process</a></div></div>
</section>
