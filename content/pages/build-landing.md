---
title: Build with TritonAI
path: /developer-apis/index.html
description: Personal productivity, application building, reusable skills, approved connections, hosting, and support through TritonAI.
eyebrow: Developer tools and resources
lastReviewed: 2026-07-27
audiences: [developers, researchers, staff, leaders]
source: TritonAI developer documentation, public architecture and memory presentations, and July 24 AI Use Case Office Hours demonstration
canonicalUrl: /developer-apis/index.html
relatedSlides: [tritonai-developer-api-program, tritongpt-secure-scalable-ai-platform, campus-app-hosting-intake, cabinet-people-10-domain-expert, harness-memory-architecture]
landingHub: true
bannerImage: /_images/homepage/TritonAI_Hero_2500.webp
bannerPosition: center 44%
---

<section class="hub-section hub-section-intro" aria-labelledby="build-intro-heading">
<div class="row hub-split hub-split-align-center"><div class="col-md-6 hub-split-copy"><p class="home-kicker">Personal productivity and building</p><h2 id="build-intro-heading">Use AI for your own work or build a service</h2><p class="hub-lede">For personal productivity, the TritonAI Harness can work across files, browser tasks, and the productivity tools you choose to connect, using reusable skills and memory sources available through the Harness within the permissions you grant. For application building, you can use the Harness and shared APIs to create an integration, then move it into a secure hosting environment supported by IT Services when other people need to rely on it.</p></div><div class="col-md-6 hub-split-media">
<figure class="build-architecture" aria-describedby="build-architecture-caption">
<p class="build-architecture-label">The TritonAI service model</p>
<ol class="build-architecture-flow">
<li><span>01</span><div><strong>Campus need</strong><small>A real person, a real task, data you are allowed to use.</small></div></li>
<li><span>02</span><div><strong>Supported build path</strong><small>Start in the TritonAI Harness, or use the developer APIs and campus skills.</small></div></li>
<li><span>03</span><div><strong>Shared AI platform</strong><small>Reach approved models through the gateway.</small></div></li>
<li><span>04</span><div><strong>Owned service</strong><small>Hosting, support, and review sized to what breaks if it fails.</small></div></li>
</ol>
<figcaption class="sr-only" id="build-architecture-caption">A campus need moves through a supported build path and the shared AI platform into an owned service.</figcaption>
</figure>
</div></div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" id="builder-entry-points" aria-labelledby="builder-routes-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">Start here</p><h2 id="builder-routes-heading">Choose the resource you need</h2></div>
<div class="row hub-number-grid">
<div class="col-md-4"><article><span>01</span><h3>Browse models</h3><p>Review available models, how much information each can handle, and current rates.</p><a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/">Open the Model Hub</a></article></div>
<div class="col-md-4"><article><span>02</span><h3>Request access</h3><p>Get your credentials, agree to the responsible-use terms, and name who owns the project.</p><a href="/developer-apis/start.html">Get started</a></article></div>
<div class="col-md-4"><article><span>03</span><h3>Reuse a capability</h3><p>Check whether another campus team has already written the skill you need.</p><a href="/skills/index.html">Browse the Skills Library</a></article></div>
</div></div>
</section>

<section class="hub-section build-harness" id="tritonai-harness" aria-labelledby="harness-heading">
<div class="hub-heading"><p class="home-kicker">Primary supported workspace</p><h2 id="harness-heading">Use TritonAI Harness for desktop agent work</h2><p>The Harness is UC San Diego’s main supported desktop workspace for building and running AI agents. Installation, model access, campus skills, and permissions all come set up together, so you are not assembling them yourself. Claude Code and the Codex desktop app are also supported if you already prefer one of those.</p></div>
<div class="build-tool-grid">
<article class="build-tool-preferred"><span class="glyphicon glyphicon-star" aria-hidden="true"></span><p class="build-tool-label">Primary supported workspace</p><h3>TritonAI Harness</h3><p>A desktop workspace set up for campus, so approved models, skills, and permissions are already wired together.</p></article>
<article><span class="glyphicon glyphicon-console" aria-hidden="true"></span><p class="build-tool-label">Supported</p><h3>Claude Code</h3><p>A command-line environment, if you would rather work directly with Anthropic models from a terminal.</p></article>
<article><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span><p class="build-tool-label">Supported</p><h3>Codex desktop app</h3><p>OpenAI's desktop app, for builders already juggling repositories and parallel agent tasks.</p></article>
</div>
<div class="row hub-split build-harness-detail"><div class="col-md-7 hub-split-copy"><h3>Why we point people at the Harness first</h3><ul class="build-harness-benefits">
<li><strong>One installer for Mac and Windows</strong><span>Bundles the required runtime, packages, skills library, configurations, and the campus-selected Harness version.</span></li>
<li><strong>UC San Diego model access</strong><span>Routes requests through the shared gateway to available UC-hosted and approved frontier models.</span></li>
<li><strong>Campus skills built in</strong><span>Official skills ship with it, plus a reviewed way to pick up community ones. You do not assemble a toolchain.</span></li>
<li><strong>Managed Microsoft 365 connections</strong><span>The Harness plugin makes structured calls and keeps connection tokens outside the agent context; users choose the permissions they grant.</span></li>
<li><strong>Adjustable supervision</strong><span>Approve every step, auto-accept, or hand over full access. Set it to whatever the task and your nerves can take.</span></li>
<li><strong>Desktop work in one place</strong><span>Chat, files, images, voice input, and a built-in browser, all on the same approved model route.</span></li>
</ul><p class="build-harness-actions"><a class="btn btn-primary" href="/developer-apis/start.html">Request developer access</a><a class="build-harness-text-link" href="/skills/index.html">Browse compatible skills <span aria-hidden="true">→</span></a></p></div><div class="col-md-5 hub-split-media"><div class="build-harness-card"><p class="build-harness-card-label">A shared execution path</p><ol class="build-harness-flow" aria-label="TritonAI Harness workflow"><li><span>01</span><strong>Install once</strong><small>Campus setup and skills are bundled</small></li><li class="build-harness-core"><span>02</span><strong>Connect deliberately</strong><small>Pick your models, plugins, and permissions</small></li><li><span>03</span><strong>Work with context</strong><small>Approved tools and campus patterns</small></li><li><span>04</span><strong>Review the result</strong><small>You still answer for the decision</small></li></ol></div></div></div>
<p class="build-harness-source">The Harness is an early pilot and changes quickly. What you can access depends on your approved service path.</p>
</section>

<section class="hub-section hub-section-sand hub-full-bleed api-gateway-section" id="api-gateway" aria-labelledby="api-gateway-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">The shared API path</p><h2 id="api-gateway-heading">Everything goes through one gateway</h2><p>You build in a supported environment and send model requests to the TritonAI LLM Gateway. One endpoint handles routing to approved cloud or UC-hosted models.</p></div>
<figure class="api-gateway-workflow" aria-describedby="api-gateway-caption">
<div class="api-gateway-map">
<div class="api-gateway-source-cluster">
<section class="api-gateway-lane api-gateway-builders" aria-labelledby="api-gateway-builders-heading">
<p class="api-gateway-lane-label">Start with a campus need</p>
<h3 id="api-gateway-builders-heading">Campus builders</h3>
<ul class="api-gateway-node-list"><li><span class="glyphicon glyphicon-user" aria-hidden="true"></span>Department staff</li><li><span class="glyphicon glyphicon-education" aria-hidden="true"></span>Research labs</li><li><span class="glyphicon glyphicon-stats" aria-hidden="true"></span>Administrative analysts</li><li><span class="glyphicon glyphicon-blackboard" aria-hidden="true"></span>Faculty teams</li></ul>
</section>
<section class="api-gateway-lane api-gateway-workspaces" aria-labelledby="api-gateway-workspaces-heading">
<p class="api-gateway-lane-label">Build in a supported workspace</p>
<h3 id="api-gateway-workspaces-heading">Development environments</h3>
<ul class="api-gateway-node-list"><li class="api-gateway-node-preferred"><span class="glyphicon glyphicon-star" aria-hidden="true"></span><span><strong>TritonAI Harness</strong><small>Primary supported workspace</small></span></li><li><span class="glyphicon glyphicon-console" aria-hidden="true"></span>Claude Code</li><li><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span>Codex desktop app</li></ul>
</section>
</div>
<div class="api-gateway-connector api-gateway-connector-in" aria-hidden="true"><span>Connect through</span><i></i></div>
<section class="api-gateway-core" aria-labelledby="api-gateway-core-heading"><div><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span><p>Shared managed route</p><h3 id="api-gateway-core-heading">TritonAI<br>LLM Gateway</h3></div></section>
<div class="api-gateway-connector api-gateway-connector-out" aria-hidden="true"><span>Access</span><i></i></div>
<div class="api-gateway-target-cluster">
<section class="api-gateway-lane api-gateway-routes" aria-labelledby="api-gateway-routes-heading">
<p class="api-gateway-lane-label">Choose an approved route</p>
<h3 id="api-gateway-routes-heading">Model routes</h3>
<ul class="api-gateway-node-list"><li><span class="glyphicon glyphicon-cloud" aria-hidden="true"></span><span><strong>Enterprise cloud</strong><small>AWS, Microsoft Azure, and Google Cloud Vertex AI</small></span></li><li><span class="glyphicon glyphicon-hdd" aria-hidden="true"></span><span><strong>SDSC-hosted</strong><small>Locally hosted at the San Diego Supercomputer Center</small></span></li></ul>
</section>
<section class="api-gateway-capabilities" aria-labelledby="api-gateway-capabilities-heading"><p class="api-gateway-lane-label">Capabilities vary by model</p><h3 id="api-gateway-capabilities-heading">Available capabilities</h3><ul><li>Chat</li><li>Reasoning</li><li>Vision</li><li>Image generation</li><li>OCR</li><li>Coding</li></ul></section>
</div>
</div>
<figcaption id="api-gateway-caption">Getting gateway access does not give your application permission to use new data. Your application is still responsible for approved data, testing, accessibility, support, and human review.</figcaption>
</figure>
</div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed shared-compute-bridge" id="shared-compute" aria-labelledby="shared-compute-heading">
<div class="container"><div class="row hub-split hub-split-align-center"><div class="col-md-6 hub-split-copy"><p class="home-kicker">Shared campus compute</p><h2 id="shared-compute-heading">TritonAI uses shared campus computing</h2><p>DataHub is the web front door to the Data Science and Machine Learning Platform (DSMLP), which supplies CPU and GPU capacity, storage, and environments that are ready to go. Coursework, formal independent study, eligible student projects, and some TritonAI workloads all run there.</p><p><a class="btn btn-primary" href="/developer-apis/dsmlp-datahub.html">Explore DSMLP and DataHub</a></p></div><div class="col-md-6 hub-split-media"><figure class="shared-compute-mini" aria-describedby="shared-compute-caption"><p>Shared infrastructure at a glance</p><ol><li><span class="glyphicon glyphicon-blackboard" aria-hidden="true"></span><div><strong>DataHub and launch tools</strong><small>Web and command-line access</small></div></li><li><span class="glyphicon glyphicon-tasks" aria-hidden="true"></span><div><strong>DSMLP</strong><small>Containers, compute, storage, and datasets</small></div></li><li><span class="glyphicon glyphicon-cog" aria-hidden="true"></span><div><strong>Selected TritonAI workloads</strong><small>Services built on shared campus capacity</small></div></li></ol><figcaption class="sr-only" id="shared-compute-caption">DataHub and command-line launch tools provide access to DSMLP shared compute, which supports coursework, formal independent study, eligible student projects, and selected TritonAI workloads.</figcaption></figure></div></div></div>
</section>

<section class="hub-section gateway-usage-section" id="gateway-usage" aria-labelledby="gateway-usage-heading">
<div data-gateway-usage="true"></div>
</section>

<section class="hub-section" id="service-lifecycle" aria-labelledby="build-lifecycle-heading">
<div class="hub-heading"><p class="home-kicker">From request to service</p><h2 id="build-lifecycle-heading">What a prototype needs before it becomes a service</h2><p>The more people rely on it and the worse the failure, the more of this you have to have in place.</p></div>
<ol class="hub-lifecycle"><li><span>Request</span><p>Name the user, the task, the data you may use, and how you will know it worked.</p></li><li><span>Prototype</span><p>Keep the data bounded and put a person in the loop on purpose.</p></li><li><span>Evaluate</span><p>Test quality, accessibility, security, and what it costs to run.</p></li><li><span>Operate</span><p>Name an owner, write down the controls, support your users, and watch it.</p></li></ol>
</section>

<section class="hub-section hub-section-sand hub-full-bleed hosting-lanes-section" id="hosting-lanes" aria-labelledby="hosting-lanes-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">Hosting and support</p><h2 id="hosting-lanes-heading">Pick the hosting lane that matches your reach and risk</h2><p>Something useful is not yet a production service. As more people depend on it, as it touches more data, or as failure starts to cost something, move it into a more managed lane.</p></div>
<figure class="hosting-lanes-figure" aria-describedby="hosting-lanes-caption">
<ol class="hosting-lanes">
<li class="hosting-lane hosting-lane-personal">
<div class="hosting-lane-tier"><span>Lane 0</span><span class="glyphicon glyphicon-user" aria-hidden="true"></span><strong>Personal workspace</strong></div>
<div class="hosting-lane-purpose"><span class="hosting-lane-label">Best for</span><strong>Explore a bounded task</strong><p>Working on your own, in an approved desktop environment or sandbox.</p></div>
<div class="hosting-lane-host"><span class="hosting-lane-label">Hosting</span><strong>User-controlled workspace</strong><p>Fine for learning and prototypes. Not something to hand other people.</p><p class="hosting-lane-address"><span class="hosting-lane-label">URL</span><code>localhost</code></p></div>
<div class="hosting-lane-review"><span class="hosting-lane-label">Accountability</span><strong>Individual owner</strong><p>You protect the data, you check the results, you keep the scope small.</p></div>
</li>
<li class="hosting-lane-escalation"><span aria-hidden="true">↓</span><strong>Move to a managed lane as scope grows</strong></li>
<li class="hosting-lane hosting-lane-department">
<div class="hosting-lane-tier"><span>Lane 1</span><span class="glyphicon glyphicon-th-large" aria-hidden="true"></span><strong>Department application</strong></div>
<div class="hosting-lane-purpose"><span class="hosting-lane-label">Best for</span><strong>Serve a defined team</strong><p>One application, a known set of users, and a business owner who wants it.</p></div>
<div class="hosting-lane-host"><span class="hosting-lane-label">Hosting</span><strong>Department-owned application</strong><p>Published through an approved campus application path.</p><p class="hosting-lane-address"><span class="hosting-lane-label">URL</span><code>apps.ucsd.edu</code></p></div>
<div class="hosting-lane-review"><span class="hosting-lane-label">Accountability</span><strong>Initial risk and scope review</strong><p>Say who maintains it, who answers support, and what data it may touch.</p></div>
</li>
<li class="hosting-lane-escalation"><span aria-hidden="true">↓</span><strong>Move to a managed lane as scope grows</strong></li>
<li class="hosting-lane hosting-lane-managed">
<div class="hosting-lane-tier"><span>Lane 2</span><span class="glyphicon glyphicon-cog" aria-hidden="true"></span><strong>Managed campus service</strong></div>
<div class="hosting-lane-purpose"><span class="hosting-lane-label">Best for</span><strong>Support many users</strong><p>A shared workflow, usually with integrations, that other teams now depend on.</p></div>
<div class="hosting-lane-host"><span class="hosting-lane-label">Hosting</span><strong>TritonAI or ITS-managed path</strong><p>A named team operates and supports the service.</p><p class="hosting-lane-address"><span class="hosting-lane-label">URL</span><code>tritonai.ucsd.edu</code></p></div>
<div class="hosting-lane-review"><span class="hosting-lane-label">Accountability</span><strong>Recurring risk and scope review</strong><p>Teams monitor quality, security, accessibility, and uptime. They also own support.</p></div>
</li>
<li class="hosting-lane-escalation"><span aria-hidden="true">↓</span><strong>Move to a managed lane as scope grows</strong></li>
<li class="hosting-lane hosting-lane-enterprise">
<div class="hosting-lane-tier"><span>Lane 3</span><span class="glyphicon glyphicon-tower" aria-hidden="true"></span><strong>Enterprise service</strong></div>
<div class="hosting-lane-purpose"><span class="hosting-lane-label">Best for</span><strong>Campus-wide delivery</strong><p>Something the whole university uses, or something that hurts badly when it breaks.</p></div>
<div class="hosting-lane-host"><span class="hosting-lane-label">Hosting</span><strong>Enterprise platform</strong><p>Built with real architecture, identity, and service management behind it.</p><p class="hosting-lane-address"><span class="hosting-lane-label">URL</span><code>ucsd.edu</code></p></div>
<div class="hosting-lane-review"><span class="hosting-lane-label">Accountability</span><strong>Formal operating ownership</strong><p>Governance, monitoring, continuity, and support come with the service.</p></div>
</li>
</ol>
<div class="hosting-lane-triggers" aria-label="Reasons to move an artifact to a more managed hosting lane"><strong>Escalate when:</strong><ul><li><span class="glyphicon glyphicon-stats" aria-hidden="true"></span>Audience or reliance grows</li><li><span class="glyphicon glyphicon-lock" aria-hidden="true"></span>Data or integrations expand</li><li><span class="glyphicon glyphicon-alert" aria-hidden="true"></span>Failure or support impact rises</li></ul></div>
<figcaption id="hosting-lanes-caption">Lane is about scope and risk, not headcount. A prototype can move between lanes as what it does and what it needs to run change.</figcaption>
</figure>
</div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" id="shared-responsibility" aria-labelledby="responsibility-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">Shared responsibility</p><h2 id="responsibility-heading">Who owns what</h2></div>
<div class="row hub-responsibility-grid"><div class="col-md-6"><article><span class="glyphicon glyphicon-cloud" aria-hidden="true"></span><h3>Platform responsibilities</h3><p>We run the gateway, publish the patterns and standards, and review the service path you propose.</p></article></div><div class="col-md-6"><article><span class="glyphicon glyphicon-user" aria-hidden="true"></span><h3>Department responsibilities</h3><p>You own the application logic, the data it uses, accessibility, testing, your users' support, and a named technical owner.</p></article></div></div>
<p class="hub-section-action"><a class="btn btn-default" href="/about/trust-architecture.html">See trust and architecture</a> <a class="btn btn-default" href="/developer-apis/faq.html">Read developer FAQs</a></p></div>
</section>

<nav class="hub-section hub-link-panel" id="builder-resources" aria-labelledby="build-resources-heading"><div class="hub-heading"><p class="home-kicker">Builder resources</p><h2 id="build-resources-heading">Where to go next</h2></div><div class="row hub-link-columns"><div class="col-sm-6 col-md-4"><a href="#tritonai-harness"><strong>TritonAI Harness</strong><span>Agentic development workspace</span></a></div><div class="col-sm-6 col-md-4"><a href="/developer-apis/start.html"><strong>Get started</strong><span>Access and onboarding</span></a></div><div class="col-sm-6 col-md-4"><a href="/developer-apis/faq.html"><strong>Developer FAQ</strong><span>Common implementation questions</span></a></div><div class="col-sm-6 col-md-4"><a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/"><strong>Model Hub</strong><span>Capabilities and rates</span></a></div><div class="col-sm-6 col-md-4"><a href="/skills/index.html"><strong>Skills Library</strong><span>Reusable capability packages</span></a></div><div class="col-sm-6 col-md-4"><a href="/about/trust-architecture.html"><strong>Trust and architecture</strong><span>Hosting and oversight</span></a></div></div></nav>

<section class="hub-section hub-subscribe" id="build-start" aria-labelledby="prototype-heading"><div class="row hub-split hub-split-align-center"><div class="col-md-8"><p class="home-kicker">Before you email us</p><h2 id="prototype-heading">Bring a narrow, measurable problem</h2><p>Work out who it is for and what data it may use. Name the review point and a result you can measure. Then choose the model.</p></div><div class="col-md-4 hub-subscribe-action"><a class="btn btn-primary btn-lg" href="/developer-apis/start.html">Start the access process</a></div></div></section>
