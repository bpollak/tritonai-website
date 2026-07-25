---
title: Build with TritonAI
path: /developer-apis/index.html
description: Use TritonAI model access, reusable skills, and accountable hosting patterns to build governed campus AI services.
eyebrow: Developer APIs and resources
lastReviewed: 2026-07-25
audiences: [developers, researchers, staff, leaders]
source: TritonAI developer documentation, public architecture presentation, and July 24 AI Use Case Office Hours demonstration
canonicalUrl: /developer-apis/index.html
relatedSlides: [tritonai-developer-api-program, tritongpt-secure-scalable-ai-platform, cabinet-people-10-domain-expert]
landingHub: true
bannerImage: /_images/homepage/TritonAI_Hero_2500.webp
bannerPosition: center 44%
---

<section class="hub-section hub-section-intro" aria-labelledby="build-intro-heading">
<div class="row hub-split hub-split-align-center"><div class="col-md-6 hub-split-copy"><p class="home-kicker">A governed path to production</p><h2 id="build-intro-heading">Build on shared infrastructure without giving up clear ownership</h2><p class="hub-lede">TritonAI gives campus teams a common model gateway, reusable skills, emerging patterns, and an explicit route from bounded experimentation to an owned service.</p></div><div class="col-md-6 hub-split-media"><figure class="hub-diagram-frame"><img alt="Public TritonAI architecture showing a campus need moving through an approved gateway to models, knowledge, tools, and human review" class="img-responsive" src="/_images/tritonai-architecture-public.svg"></figure></div></div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed api-gateway-section" aria-labelledby="api-gateway-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">The shared API path</p><h2 id="api-gateway-heading">One gateway connects campus builders to approved model choices</h2><p>Teams build in supported environments, send model requests through the TritonAI LLM Gateway, and reach approved cloud or UC-hosted models through one managed route.</p></div>
<figure class="api-gateway-workflow" aria-describedby="api-gateway-caption">
<div class="api-gateway-flow">
<article class="api-gateway-stage"><span class="api-gateway-stage-number">01</span><span class="glyphicon glyphicon-user api-gateway-stage-icon" aria-hidden="true"></span><h3>Campus builders</h3><p>Department staff, research labs, administrative analysts, and faculty teams</p></article>
<article class="api-gateway-stage"><span class="api-gateway-stage-number">02</span><span class="glyphicon glyphicon-console api-gateway-stage-icon" aria-hidden="true"></span><h3>Supported development environments</h3><p>Approved coding environments, templates, and campus solution patterns</p></article>
<article class="api-gateway-stage api-gateway-stage-core"><span class="api-gateway-stage-number">03</span><span class="glyphicon glyphicon-transfer api-gateway-stage-icon" aria-hidden="true"></span><h3>TritonAI LLM Gateway</h3><p>Shared access, routing, usage tracking, templates, and guardrails</p></article>
<article class="api-gateway-stage"><span class="api-gateway-stage-number">04</span><span class="glyphicon glyphicon-cloud api-gateway-stage-icon" aria-hidden="true"></span><h3>Approved model routes</h3><p>Enterprise cloud providers and models hosted on UC-controlled infrastructure</p></article>
</div>
<div class="api-gateway-capabilities" aria-label="Capabilities available through approved model routes"><strong>Available capabilities vary by model and approval:</strong><ul><li>Chat</li><li>Reasoning</li><li>Vision</li><li>Image generation</li><li>OCR</li><li>Coding</li></ul></div>
<figcaption id="api-gateway-caption">This public view summarizes the API gateway workflow shown in the current TritonAI presentation. Gateway access does not authorize new data use; each application remains responsible for approved data, testing, accessibility, support, and human review.</figcaption>
</figure>
</div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" aria-labelledby="builder-routes-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">Choose a route</p><h2 id="builder-routes-heading">Start with the resource you need</h2></div>
<div class="row hub-number-grid">
<div class="col-md-4"><article><span>01</span><h3>Browse models</h3><p>Review current capabilities, context windows, and published rates.</p><a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/">Open the Model Hub</a></article></div>
<div class="col-md-4"><article><span>02</span><h3>Request access</h3><p>Follow the onboarding path for credentials, usage expectations, and project ownership.</p><a href="/developer-apis/start.html">Get started</a></article></div>
<div class="col-md-4"><article><span>03</span><h3>Reuse a capability</h3><p>Begin with a focused public skill when an established campus pattern fits the task.</p><a href="/skills/index.html">Browse the Skills Library</a></article></div>
</div></div>
</section>

<section class="hub-section build-harness" id="tritonai-harness" aria-labelledby="harness-heading">
<div class="hub-heading"><p class="home-kicker">Pilot development workspace</p><h2 id="harness-heading">TritonAI Harness brings campus-ready controls to desktop agent work</h2><p>UC San Diego supports Claude Code and the Codex desktop app for experienced builders. TritonAI Harness is the preferred starting point for most campus staff because it packages the installation, model access, campus skills, permissions, and supported integrations into one UC San Diego-oriented experience.</p></div>
<div class="build-tool-grid">
<article><span class="glyphicon glyphicon-console" aria-hidden="true"></span><p class="build-tool-label">Supported</p><h3>Claude Code</h3><p>A command-line environment for technical builders who want to work directly with Anthropic models and development tooling.</p></article>
<article><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span><p class="build-tool-label">Supported</p><h3>Codex desktop app</h3><p>An OpenAI desktop environment for experienced builders managing code, repositories, parallel tasks, and agent workflows.</p></article>
<article class="build-tool-preferred"><span class="glyphicon glyphicon-star" aria-hidden="true"></span><p class="build-tool-label">Preferred for most UC San Diego staff</p><h3>TritonAI Harness</h3><p>A campus-oriented desktop experience that reduces setup burden and keeps approved models, skills, permissions, and integrations together.</p></article>
</div>
<div class="row hub-split build-harness-detail"><div class="col-md-7 hub-split-copy"><h3>Why the Harness is the preferred campus path</h3><ul class="build-harness-benefits">
<li><strong>One installer for Mac and Windows</strong><span>Bundles the required runtime, packages, skills library, configurations, and the campus-selected Harness version.</span></li>
<li><strong>UC San Diego model access</strong><span>Routes requests through the shared gateway to available UC-hosted and approved frontier models.</span></li>
<li><strong>Campus skills built in</strong><span>Provides official reusable skills and a reviewed community pathway instead of asking each user to assemble a toolchain.</span></li>
<li><strong>Managed Microsoft 365 connections</strong><span>The Harness plugin makes structured calls and keeps connection tokens outside the agent context; users choose the permissions they grant.</span></li>
<li><strong>Adjustable supervision</strong><span>Supports supervised, auto-accept, and full-access modes so autonomy can match the task and the user’s comfort level.</span></li>
<li><strong>Desktop work in one place</strong><span>Combines chat, files, images, voice input, and a built-in browser with the same approved model route.</span></li>
</ul><p class="build-harness-actions"><a class="btn btn-primary" href="/developer-apis/start.html">Request developer access</a><a class="build-harness-text-link" href="/skills/index.html">Browse compatible skills <span aria-hidden="true">→</span></a></p></div><div class="col-md-5 hub-split-media"><div class="build-harness-card"><p class="build-harness-card-label">A shared execution path</p><ol class="build-harness-flow" aria-label="TritonAI Harness workflow"><li><span>01</span><strong>Install once</strong><small>Campus setup and skills are bundled</small></li><li class="build-harness-core"><span>02</span><strong>Connect deliberately</strong><small>Choose models, plugins, and permissions</small></li><li><span>03</span><strong>Work with context</strong><small>Use approved tools and campus patterns</small></li><li><span>04</span><strong>Review the result</strong><small>People remain accountable for decisions</small></li></ol></div></div></div>
<p class="build-harness-source">Current capabilities reflect David Balderston’s TritonAI Harness demonstration at AI Use Case Office Hours on July 24, 2026. The Harness is an early pilot and changes quickly; access and individual capabilities depend on the approved service path.</p>
</section>

<section class="hub-section" aria-labelledby="build-lifecycle-heading">
<div class="hub-heading"><p class="home-kicker">From request to service</p><h2 id="build-lifecycle-heading">A narrow prototype is the beginning, not the finish line</h2><p>Production readiness grows with reach, risk, integrations, and the consequences of failure.</p></div>
<ol class="hub-lifecycle"><li><span>Request</span><p>Define the user, task, approved data, and success measure.</p></li><li><span>Prototype</span><p>Use bounded data and an explicit human review point.</p></li><li><span>Evaluate</span><p>Test quality, accessibility, security, cost, and operational fit.</p></li><li><span>Operate</span><p>Name an owner, document controls, support users, and monitor the service.</p></li></ol>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" aria-labelledby="responsibility-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">Shared responsibility</p><h2 id="responsibility-heading">The platform and the department own different parts of the result</h2></div>
<div class="row hub-responsibility-grid"><div class="col-md-6"><article><span class="glyphicon glyphicon-cloud" aria-hidden="true"></span><h3>Platform responsibilities</h3><p>Common gateway operations, reusable patterns, published standards, and review of the proposed service path.</p></article></div><div class="col-md-6"><article><span class="glyphicon glyphicon-user" aria-hidden="true"></span><h3>Department responsibilities</h3><p>Application logic, approved content and data, accessibility, testing, end-user support, and a named technical owner.</p></article></div></div>
<p class="hub-section-action"><a class="btn btn-default" href="/about/trust-architecture.html">See trust and architecture</a> <a class="btn btn-default" href="/developer-apis/faq.html">Read developer FAQs</a></p></div>
</section>

<nav class="hub-section hub-link-panel" aria-labelledby="build-resources-heading"><div class="hub-heading"><p class="home-kicker">Builder resources</p><h2 id="build-resources-heading">Move from idea to an owned service</h2></div><div class="row hub-link-columns"><div class="col-sm-6 col-md-4"><a href="#tritonai-harness"><strong>TritonAI Harness</strong><span>Agentic development workspace</span></a></div><div class="col-sm-6 col-md-4"><a href="/developer-apis/start.html"><strong>Get started</strong><span>Access and onboarding</span></a></div><div class="col-sm-6 col-md-4"><a href="/developer-apis/faq.html"><strong>Developer FAQ</strong><span>Common implementation questions</span></a></div><div class="col-sm-6 col-md-4"><a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/"><strong>Model Hub</strong><span>Capabilities and rates</span></a></div><div class="col-sm-6 col-md-4"><a href="/skills/index.html"><strong>Skills Library</strong><span>Reusable capability packages</span></a></div><div class="col-sm-6 col-md-4"><a href="/about/trust-architecture.html"><strong>Trust and architecture</strong><span>Hosting and oversight</span></a></div></div></nav>

<section class="hub-section hub-subscribe" aria-labelledby="prototype-heading"><div class="row hub-split hub-split-align-center"><div class="col-md-8"><p class="home-kicker">A useful first conversation</p><h2 id="prototype-heading">Bring a narrow, measurable problem</h2><p>Define the user, task, approved data, human review, owner, and success measure before selecting the model or tool.</p></div><div class="col-md-4 hub-subscribe-action"><a class="btn btn-primary btn-lg" href="/developer-apis/start.html">Start the access process</a></div></div></section>
