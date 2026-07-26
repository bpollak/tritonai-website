---
title: DSMLP and DataHub
path: /developer-apis/dsmlp-datahub.html
description: Learn how UC San Diego DataHub provides web access to the Data Science and Machine Learning Platform and how selected TritonAI workloads use this shared computing foundation.
eyebrow: Shared campus infrastructure
lastReviewed: 2026-07-26
audiences: [students, faculty, researchers, staff, developers, leaders]
source: UC San Diego DataHub and Research Platform, IT Services DSMLP documentation, and TritonAI platform architecture
canonicalUrl: /developer-apis/dsmlp-datahub.html
relatedSlides: [platform-architecture, tritonai-developer-api-program]
landingHub: true
bannerImage: /_images/homepage/TritonAI_Hero_2500.webp
bannerPosition: center 44%
---

<section class="hub-section hub-section-intro dsmlp-intro" aria-labelledby="dsmlp-intro-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-6 hub-split-copy">
<p class="home-kicker">One shared computing foundation</p>
<h2 id="dsmlp-intro-heading">DataHub is the front door. DSMLP is the platform underneath.</h2>
<p class="hub-lede">UC San Diego DataHub provides browser-based access to the Data Science and Machine Learning Platform (DSMLP), a shared environment for notebook-based coursework, independent study, student projects, and selected TritonAI workloads.</p>
<p>DSMLP brings container orchestration, research-class CPU and GPU resources, storage, and reusable software environments together as a managed campus platform. DataHub makes those capabilities accessible through familiar web tools such as Jupyter and RStudio.</p>
<p class="dsmlp-intro-actions"><a class="btn btn-primary" href="https://datahub.ucsd.edu/hub/login?next=%2Fhub%2F">Open DataHub</a> <a class="btn btn-default" href="https://support.ucsd.edu/its?id=kb_article_view&amp;sys_kb_id=b096442e9718f650992771611153afed">Read the official FAQ</a></p>
</div>
<div class="col-md-6 hub-split-media">
<figure class="dsmlp-platform-map" aria-describedby="dsmlp-platform-caption">
<p class="dsmlp-map-label">How the pieces fit</p>
<div class="dsmlp-map-entry">
<article><span class="glyphicon glyphicon-blackboard" aria-hidden="true"></span><strong>DataHub</strong><small>Web access to Jupyter, RStudio, and course environments</small></article>
<article><span class="glyphicon glyphicon-console" aria-hidden="true"></span><strong>Command line</strong><small>Advanced container and batch workflows through dsmlp-login</small></article>
</div>
<div class="dsmlp-map-connector" aria-hidden="true"><span>Launch a workspace</span><i></i></div>
<div class="dsmlp-map-core"><span class="glyphicon glyphicon-tasks" aria-hidden="true"></span><div><p>Shared computing platform</p><h3>DSMLP</h3><ul><li>Containers</li><li>CPU and GPU</li><li>Storage</li><li>Datasets</li></ul></div></div>
<div class="dsmlp-map-connector" aria-hidden="true"><span>Support many workloads</span><i></i></div>
<div class="dsmlp-map-outcomes"><span>Teaching and research</span><span>Selected TritonAI workloads</span></div>
<figcaption id="dsmlp-platform-caption">People enter through DataHub or command-line tools, launch isolated workspaces on DSMLP shared compute, and use those resources for teaching, research, student projects, and selected TritonAI workloads.</figcaption>
</figure>
</div>
</div>
</section>
<section class="hub-section hub-section-dark hub-full-bleed dsmlp-capabilities" aria-labelledby="dsmlp-capabilities-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">Platform capabilities</p><h2 id="dsmlp-capabilities-heading">A common environment for computational work</h2><p>DSMLP packages the infrastructure needed to move from a notebook or command-line request to an isolated, resource-managed workspace.</p></div>
<div class="dsmlp-feature-grid">
<article><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span><h3>Isolated containers</h3><p>Docker-based environments separate users and projects while supporting standard or custom software images.</p></article>
<article><span class="glyphicon glyphicon-dashboard" aria-hidden="true"></span><h3>CPU and GPU resources</h3><p>Workspaces request the compute, memory, and accelerator capacity appropriate for the task.</p></article>
<article><span class="glyphicon glyphicon-hdd" aria-hidden="true"></span><h3>Storage and datasets</h3><p>Course, team, personal, and shared dataset locations support work that continues across sessions.</p></article>
<article><span class="glyphicon glyphicon-cog" aria-hidden="true"></span><h3>Managed orchestration</h3><p>Kubernetes schedules containers onto cluster nodes, monitors them, and applies resource limits and quotas.</p></article>
</div>
</div>
</section>

<section class="hub-section dsmlp-access-section" aria-labelledby="dsmlp-access-heading">
<div class="hub-heading"><p class="home-kicker">Two ways in</p><h2 id="dsmlp-access-heading">Choose the access path that fits the work</h2><p>DataHub and command-line access reach the same underlying platform, but they serve different working styles.</p></div>
<div class="row dsmlp-access-grid">
<div class="col-md-6"><article class="dsmlp-access-card dsmlp-access-card-web"><header><span class="glyphicon glyphicon-new-window" aria-hidden="true"></span><div><p>Browser-based</p><h3>DataHub</h3></div></header><ul><li>Launch a course or independent-study environment from the web.</li><li>Work in Jupyter notebooks, terminals, and supported graphical tools.</li><li>Use curated software images and shared course resources.</li></ul><p><a href="https://datahub.ucsd.edu/hub/login?next=%2Fhub%2F">Go to DataHub <span aria-hidden="true">→</span></a></p></article></div>
<div class="col-md-6"><article class="dsmlp-access-card dsmlp-access-card-cli"><header><span class="glyphicon glyphicon-console" aria-hidden="true"></span><div><p>Command-line</p><h3>DSMLP launch tools</h3></div></header><ul><li>Start interactive, batch, or custom-container workloads with <code>launch.sh</code>.</li><li>Request CPU, memory, and GPU resources for the container.</li><li>Use advanced workflows without running jobs on the shared login host.</li></ul><p><a href="https://support.ucsd.edu/services?id=kb_article_view&amp;sysparm_article=KB0032269">Read the container launch guide <span aria-hidden="true">→</span></a></p></article></div>
</div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed dsmlp-tritonai-section" aria-labelledby="dsmlp-tritonai-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">Where TritonAI fits</p><h2 id="dsmlp-tritonai-heading">Shared compute supports the workload; the gateway governs model access</h2><p>Selected TritonAI workloads use DSMLP as shared campus compute. TritonAI’s user interfaces, service ownership, and approved model routes remain distinct parts of the architecture.</p></div>
<figure class="dsmlp-tritonai-flow" aria-describedby="dsmlp-tritonai-caption">
<ol>
<li><span class="glyphicon glyphicon-tasks" aria-hidden="true"></span><div><small>Shared compute</small><strong>DSMLP</strong><p>Containerized CPU/GPU capacity, storage, and platform operations</p></div></li>
<li><span class="glyphicon glyphicon-cog" aria-hidden="true"></span><div><small>Selected workloads</small><strong>TritonAI services</strong><p>Applications, evaluation, automation, and supporting processes</p></div></li>
<li><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span><div><small>Approved model access</small><strong>TritonAI LLM Gateway</strong><p>Managed routes to enterprise cloud and SDSC-hosted models</p></div></li>
</ol>
<figcaption id="dsmlp-tritonai-caption">DSMLP provides shared compute for selected TritonAI workloads. Model requests continue through the TritonAI LLM Gateway to approved enterprise or SDSC-hosted model routes.</figcaption>
</figure>
<div class="dsmlp-distinction"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span><p><strong>Related, but not the same service:</strong> DataHub is the web interface for authorized notebook and computational work. TritonAI users work through TritonGPT, the TritonAI Harness, APIs, or department applications. <a href="/developer-apis/index.html#api-gateway">See the TritonAI gateway architecture.</a></p></div>
</div>
</section>

<section class="hub-section dsmlp-responsibility" aria-labelledby="dsmlp-responsibility-heading">
<div class="row hub-split">
<div class="col-md-7 hub-split-copy">
<p class="home-kicker">Use the right operating path</p>
<h2 id="dsmlp-responsibility-heading">Shared infrastructure still has boundaries</h2>
<p>DSMLP is primarily an instructional resource with authorized access and published usage policies. UC San Diego documentation states that DataHub/DSMLP is not suitable for P3/P4 protected data. Projects involving sensitive data, production service commitments, or specialized operating requirements need an appropriate review and hosting path.</p>
<p>DSMLP is built and operated by UC San Diego IT Services, with additional financial contributions from Cognitive Science and the Jacobs School of Engineering.</p>
</div>
<div class="col-md-5 hub-split-media"><aside class="dsmlp-resource-panel" aria-labelledby="dsmlp-resources-heading"><p class="home-kicker">Official resources</p><h3 id="dsmlp-resources-heading">Learn more and get help</h3><ul><li><a href="https://datahub.ucsd.edu/hub/login?next=%2Fhub%2F">DataHub and Research Platform</a></li><li><a href="https://support.ucsd.edu/its?id=kb_article_view&amp;sys_kb_id=b096442e9718f650992771611153afed">DataHub and DSMLP FAQ</a></li><li><a href="https://support.ucsd.edu/its?id=kb_article_view&amp;sysparm_article=KB0030588">Instructor guidance</a></li><li><a href="https://datahub.ucsd.edu/hub/status">Cluster status</a></li></ul><p>Support: <a href="mailto:datahub@ucsd.edu">datahub@ucsd.edu</a></p></aside></div>
</div>
</section>
