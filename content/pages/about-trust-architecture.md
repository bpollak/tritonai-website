---
title: Trust & Architecture
path: /about/trust-architecture.html
description: A public view of TritonAI hosting choices, model routing, grounded knowledge, and service responsibilities.
eyebrow: About TritonAI
lastReviewed: 2026-07-19
audiences: [staff, faculty, students, developers, leaders]
source: TritonAI architecture presentation and public developer documentation
canonicalUrl: /about/trust-architecture.html
relatedSlides: [Architecture, Model Gateway, Trust as Infrastructure]
---

<p class="lead">TritonAI uses a layered architecture so campus services can choose an appropriate model, knowledge source, and delivery surface without giving up common governance.</p>

<!-- AGENT_SECTION: ux-about-trust-layers -->
<div class="row agent-card-grid">
<div class="col-md-4"><div class="panel panel-default agent-card"><div class="panel-heading"><h2 class="panel-title">1. Approved model hosting</h2></div><div class="panel-body"><p>Workloads can use approved enterprise cloud models or open models hosted on UC-controlled infrastructure at the San Diego Supercomputer Center. Selection depends on the service, data, capability, and approved controls.</p></div></div></div>
<div class="col-md-4"><div class="panel panel-default agent-card"><div class="panel-heading"><h2 class="panel-title">2. Common model gateway</h2></div><div class="panel-body"><p>A shared gateway gives supported applications a consistent way to access available models. It supports model choice and central operational visibility while leaving authorization and data decisions with the service.</p></div></div></div>
<div class="col-md-4"><div class="panel panel-default agent-card"><div class="panel-heading"><h2 class="panel-title">3. Grounded assistants</h2></div><div class="panel-body"><p>Retrieval-augmented generation can ground responses in approved knowledge sources. Assistants retrieve relevant context at request time; they are not described as being trained on private campus content.</p></div></div></div>
</div>
<!-- END_AGENT_SECTION -->

## Delivery surfaces

The same foundation can support TritonGPT, embedded website assistants, the UC San Diego mobile app, instructional experiences, developer applications, and supervised workflow agents. Each surface needs a named service owner and an approved support path.

## What this page does not promise

No single hosting lane is correct for every use case. TritonAI does not claim that all data stays in one environment or that all information can be used with every model. Teams must follow the applicable data-classification, privacy, security, accessibility, records, and procurement requirements.

<p><a class="btn btn-primary" href="/developer-apis/index.html">Explore Developer APIs</a> <a class="btn btn-default" href="/tritongpt/privacy.html">Read the privacy statement</a></p>
