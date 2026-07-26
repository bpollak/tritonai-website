---
title: Trust, Privacy and Hosting
path: /about/trust-architecture.html
description: An overview of TritonAI hosting choices, model routing, grounded knowledge, and service responsibilities.
eyebrow: About TritonAI
lastReviewed: 2026-07-26
audiences: [staff, faculty, students, developers, leaders]
source: TritonAI architecture presentation and public developer documentation
canonicalUrl: /about/trust-architecture.html
relatedSlides: [platform-architecture, six-principles-for-enterprise-ai]
---

<p class="lead">TritonAI gives campus services approved choices for models, information sources, and user experiences while keeping shared privacy, security, and service requirements in place.</p>

<!-- AGENT_SECTION: ux-about-trust-layers -->
<div class="row agent-card-grid">
<div class="col-md-4"><div class="panel panel-default agent-card"><div class="panel-heading"><h2 class="panel-title">1. Approved model hosting</h2></div><div class="panel-body"><p>Workloads can use approved enterprise cloud models or open models hosted on UC-controlled infrastructure at the San Diego Supercomputer Center. Selection depends on the service, data, capability, and approved controls.</p></div></div></div>
<div class="col-md-4"><div class="panel panel-default agent-card"><div class="panel-heading"><h2 class="panel-title">2. One gateway for model access</h2></div><div class="panel-body"><p>Supported applications use one shared gateway to reach available models. Each service still decides who may use it, what data is allowed, and how results are reviewed.</p></div></div></div>
<div class="col-md-4"><div class="panel panel-default agent-card"><div class="panel-heading"><h2 class="panel-title">3. Assistants use approved sources</h2></div><div class="panel-body"><p>An assistant can look up relevant information from approved sources when a user asks a question. This does not mean the model was trained on private campus content.</p></div></div></div>
</div>
<!-- END_AGENT_SECTION -->

## Delivery surfaces

The same foundation can support TritonGPT, embedded website assistants, the UC San Diego mobile app, instructional experiences, developer applications, and supervised workflow agents. Each surface needs a named service owner and an approved support path.

<p><a class="btn btn-primary" href="/developer-apis/index.html">Explore Developer APIs</a> <a class="btn btn-default" href="/tritongpt/privacy.html">Read the privacy statement</a></p>
