---
title: Build with TritonAI APIs
path: /developer-apis/index.html
description: Request TritonAI API access, choose an approved model route, and connect from TritonAI Harness or another compatible client.
eyebrow: Developer APIs and resources
lastReviewed: 2026-08-25
audiences: [developers, researchers, staff, leaders]
source: TritonAI developer documentation, API access intake and funding guidance, UC Protection Level Classification, public architecture and memory presentations, July 24 AI Use Case Office Hours demonstration, ITS-TritonAI n8n service documentation, and TritonAI Installer release information reviewed August 21, 2026
canonicalUrl: /developer-apis/index.html
relatedSlides: [tritonai-developer-api-program, tritongpt-secure-scalable-ai-platform, campus-app-hosting-intake, cabinet-people-10-domain-expert, harness-memory-architecture]
landingHub: true
bannerImage: /_images/hero-abstract/build.webp
bannerPosition: center
bannerMode: abstract
---

<section class="hub-section hub-section-intro" aria-labelledby="build-intro-heading">
<div class="row hub-split hub-split-align-center"><div class="col-md-6 hub-split-copy"><p class="home-kicker">TritonAI Developer APIs</p><h2 id="build-intro-heading">Connect your tools to approved AI models</h2><p class="hub-lede">The TritonAI LLM Gateway gives campus builders one API for approved enterprise cloud and UC-hosted models. Request access, choose a model route, and connect from TritonAI Harness or another compatible client. When other people rely on what you build, move it into hosting and support sized to its users, data, and impact.</p></div><div class="col-md-6 hub-split-media">
<figure class="build-architecture" aria-describedby="build-architecture-caption">
<p class="build-architecture-label">From API access to a supported service</p>
<ol class="build-architecture-flow">
<li><span>01</span><div><strong>Campus need</strong><small>A real person, a real task, data you are allowed to use.</small></div></li>
<li><span>02</span><div><strong>Gateway access</strong><small>An approved API key, model route, and usage limits.</small></div></li>
<li><span>03</span><div><strong>Client or application</strong><small>TritonAI Harness, another compatible harness, or software you build.</small></div></li>
<li><span>04</span><div><strong>Owned service</strong><small>Hosting, support, and review sized to what breaks if it fails.</small></div></li>
</ol>
<figcaption class="sr-only" id="build-architecture-caption">A campus need moves through Gateway access and a compatible client or application into an owned service.</figcaption>
</figure>
</div></div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" id="builder-entry-points" aria-labelledby="builder-routes-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">Start here</p><h2 id="builder-routes-heading">Choose the resource you need</h2></div>
<div class="row hub-number-grid">
<div class="col-md-4"><article><span>01</span><h3>Request API access</h3><p>Get a Gateway key and the model route approved for your work.</p><a href="/developer-apis/start.html">Request access and choose a client</a></article></div>
<div class="col-md-4"><article><span>02</span><h3>Browse models</h3><p>Review current model hosting, capabilities, context lengths, and published rates.</p><a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/">Open the Model Hub</a></article></div>
<div class="col-md-4"><article><span>03</span><h3>Choose a client</h3><p>Use TritonAI Harness or connect another compatible harness to the same Gateway.</p><a href="#tritonai-harness">Compare client paths</a></article></div>
</div></div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed api-gateway-section" id="api-gateway" aria-labelledby="api-gateway-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">One API for approved models</p><h2 id="api-gateway-heading">Connect through the TritonAI LLM Gateway</h2><p>The Gateway routes each approved key to models in the TritonAI catalog. Your approval defines access, limits, and funding treatment. The <a href="/developer-apis/start.html">access page</a> covers those details and client setup.</p></div>
<figure class="api-gateway-workflow" aria-describedby="api-gateway-caption">
<div class="api-gateway-map">
<div class="api-gateway-source-cluster">
<section class="api-gateway-lane api-gateway-builders" aria-labelledby="api-gateway-builders-heading">
<p class="api-gateway-lane-label">Start with a campus need</p>
<h3 id="api-gateway-builders-heading">Campus builders</h3>
<ul class="api-gateway-node-list"><li><span class="glyphicon glyphicon-user" aria-hidden="true"></span>Department staff</li><li><span class="glyphicon glyphicon-education" aria-hidden="true"></span>Research labs</li><li><span class="glyphicon glyphicon-stats" aria-hidden="true"></span>Administrative analysts</li><li><span class="glyphicon glyphicon-blackboard" aria-hidden="true"></span>Faculty teams</li></ul>
</section>
<section class="api-gateway-lane api-gateway-workspaces" aria-labelledby="api-gateway-workspaces-heading">
<p class="api-gateway-lane-label">Connect a client or application</p>
<h3 id="api-gateway-workspaces-heading">API clients</h3>
<ul class="api-gateway-node-list"><li class="api-gateway-node-preferred"><span class="glyphicon glyphicon-star" aria-hidden="true"></span><span><strong>TritonAI Harness</strong><small>Primary supported client</small></span></li><li><span class="glyphicon glyphicon-console" aria-hidden="true"></span><span><strong>Supported alternatives</strong><small>Claude Code and Codex</small></span></li><li><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span><span><strong>Compatible harnesses</strong><small>Hermes, OpenCode, and others</small></span></li></ul>
</section>
</div>
<div class="api-gateway-connector api-gateway-connector-in" aria-hidden="true"><i></i></div>
<section class="api-gateway-core" aria-labelledby="api-gateway-core-heading"><div><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span><p>Shared API endpoint</p><h3 id="api-gateway-core-heading">TritonAI<br>LLM Gateway</h3></div></section>
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
<figcaption id="api-gateway-caption">The Gateway key controls model access and limits. The client or application remains responsible for data permissions, testing, accessibility, support, and human review.</figcaption>
</figure>
</div>
</section>

<!-- AGENT_SECTION: model-catalog -->
<section class="hub-section" id="model-catalog" aria-labelledby="model-catalog-heading">
<div class="hub-heading"><p class="home-kicker">Shared AI platform</p><h2 id="model-catalog-heading">Models available through the gateway</h2><p>The gateway lists these models today, spanning approved enterprise cloud models and UC-hosted open models. The code under each name is the request ID to use through the gateway, and context length is the amount of input a request can carry. Rates and full details stay in the <a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/">Model Hub</a>.</p></div>
<div class="table-responsive" role="region" aria-label="Current model catalog" tabindex="0"><table class="table table-striped model-catalog-table">
<caption class="sr-only">Models currently listed by the TritonAI gateway with their hosting, type, and context length</caption>
<thead><tr><th scope="col">Model</th><th scope="col">Hosting</th><th scope="col">Type</th><th scope="col">Context length</th></tr></thead>
<tbody>
<tr><td><strong>Claude Opus 5</strong><br><code class="model-catalog-request-id">claude-opus-5</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Sonnet 5</strong><br><code class="model-catalog-request-id">claude-sonnet-5</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Opus 4.8</strong><br><code class="model-catalog-request-id">claude-opus-4-8</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Opus 4.7</strong><br><code class="model-catalog-request-id">claude-opus-4-7</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Sonnet 4.6</strong><br><code class="model-catalog-request-id">claude-sonnet-4-6</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Opus 4.6</strong><br><code class="model-catalog-request-id">claude-opus-4-6</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Opus 4.6</strong><br><code class="model-catalog-request-id">claude-opus-4-6-v1</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>200K tokens</td></tr>
<tr><td><strong>Gemini 3.6 Flash</strong><br><code class="model-catalog-request-id">gemini-3.6-flash</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1.048576M tokens</td></tr>
<tr><td><strong>Gemini 3.5 Flash</strong><br><code class="model-catalog-request-id">gemini-3.5-flash</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1.048576M tokens</td></tr>
<tr><td><strong>Gemini 3.5 Flash Lite</strong><br><code class="model-catalog-request-id">gemini-3.5-flash-lite</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1.048576M tokens</td></tr>
<tr><td><strong>Gemma 4 31B</strong><br><code class="model-catalog-request-id">api-gemma-4-31b</code></td><td>UC-hosted</td><td>Chat and reasoning</td><td>256K tokens</td></tr>
<tr><td><strong>GPT-5.6 Luna</strong><br><code class="model-catalog-request-id">gpt-5.6-luna</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1.05M tokens</td></tr>
<tr><td><strong>GPT-5.6 Sol</strong><br><code class="model-catalog-request-id">gpt-5.6-sol</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1.05M tokens</td></tr>
<tr><td><strong>GPT-5.6 Terra</strong><br><code class="model-catalog-request-id">gpt-5.6-terra</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1.05M tokens</td></tr>
<tr><td><strong>GPT-5.5</strong><br><code class="model-catalog-request-id">gpt-5.5</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1.05M tokens</td></tr>
<tr><td><strong>GPT-5.4</strong><br><code class="model-catalog-request-id">gpt-5.4</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1.05M tokens</td></tr>
<tr><td><strong>Kimi K2.6</strong><br><code class="model-catalog-request-id">kimi-k2.6</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>See Model Hub</td></tr>
<tr><td><strong>Kimi K2.5</strong><br><code class="model-catalog-request-id">moonshotai.kimi-k2.5</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>262K tokens</td></tr>
<tr><td><strong>MiniMax M2</strong><br><code class="model-catalog-request-id">minimax.minimax-m2</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>128K tokens</td></tr>
<tr><td><strong>Mistral Large 3</strong><br><code class="model-catalog-request-id">mistral.mistral-large-3-675b-instruct</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>128K tokens</td></tr>
<tr><td><strong>Amazon Nova 2 Lite</strong><br><code class="model-catalog-request-id">us.amazon.nova-2-lite-v1:0</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Amazon Nova Premier</strong><br><code class="model-catalog-request-id">us.amazon.nova-premier-v1:0</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>TritonGPT Embeddings</strong><br><code class="model-catalog-request-id">api-tgpt-embeddings</code></td><td>Approved enterprise cloud</td><td>Embeddings</td><td>33K tokens</td></tr>
<tr><td><strong>DeepSeek V4 Flash</strong><br><code class="model-catalog-request-id">api-deepseek-v4-flash</code></td><td>UC-hosted</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>GLM 5.2</strong><br><code class="model-catalog-request-id">api-glm-5.2</code></td><td>UC-hosted</td><td>Chat and reasoning</td><td>320K tokens</td></tr>
<tr><td><strong>LightOn OCR 1B</strong><br><code class="model-catalog-request-id">api-lightonocr-1b</code></td><td>UC-hosted</td><td>Document OCR</td><td>8K tokens</td></tr>
<tr><td><strong>Cohere Transcribe</strong><br><code class="model-catalog-request-id">api-cohere-transcribe</code></td><td>UC-hosted</td><td>Speech to text</td><td>See Model Hub</td></tr>
</tbody>
</table></div>
<p class="model-catalog-refreshed">List refreshed from the public Model Hub on 2026-08-26. Test registrations and TritonGPT-internal serving entries are excluded.</p>
</section>
<!-- END_AGENT_SECTION -->

<section class="hub-section build-harness" id="tritonai-harness" aria-labelledby="harness-heading">
<div class="hub-heading"><p class="home-kicker">Choose an API client</p><h2 id="harness-heading">Use TritonAI Harness or another compatible harness</h2><p>TritonAI Harness is UC San Diego's primary supported client. UC San Diego has approved it for use with UC information classified up to Protection Level 3 (P3) when the work is within an approved setup; P4 data is not approved. <a href="https://security.ucop.edu/policies/institutional-information-and-it-resource-classification.html" rel="noopener noreferrer" target="_blank">Review the UC Protection Levels</a>. Claude Code and Codex are supported alternatives. Hermes, OpenCode, and other compatible clients can connect to the same Gateway, though their features and configuration differ. The access page covers connection requirements and setup.</p></div>
<div class="build-tool-grid">
<article class="build-tool-preferred"><span class="glyphicon glyphicon-star" aria-hidden="true"></span><p class="build-tool-label">Primary supported client</p><h3>TritonAI Harness</h3><p>A managed desktop workspace with campus configuration, skills, and supported connections.</p></article>
<article><span class="glyphicon glyphicon-console" aria-hidden="true"></span><p class="build-tool-label">Supported alternatives</p><h3>Claude Code and Codex</h3><p>Use an established terminal or desktop workflow with the model routes approved for your key.</p></article>
<article><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span><p class="build-tool-label">Compatible clients</p><h3>Hermes, OpenCode, and others</h3><p>Connect another client using the Gateway endpoint and key from your approval.</p></article>
</div>
<div class="row hub-split build-harness-detail"><div class="col-md-7 hub-split-copy"><h3>Why TritonAI Harness is the primary client</h3><ul class="build-harness-benefits">
<li><strong>Campus configuration</strong><span>The Gateway connection and campus defaults are set up for UC San Diego use.</span></li>
<li><strong>Managed installer</strong><span>The installer supplies the supported runtime and application package.</span></li>
<li><strong>Campus skills and context</strong><span>Reviewed skills and approved context sources can live in the same workspace.</span></li>
<li><strong>Supported connections</strong><span>Available productivity and browser connections are configured for supervised work.</span></li>
</ul>
</div><div class="col-md-5 hub-split-media"><div class="build-harness-card"><p class="build-harness-card-label">What the Gateway supplies</p><ol class="build-harness-flow" aria-label="What an API client receives from the TritonAI Gateway"><li><span>01</span><strong>One endpoint</strong><small>A shared API for approved clients and applications</small></li><li class="build-harness-core"><span>02</span><strong>Approved model routes</strong><small>The cloud and UC-hosted models available to your key</small></li><li><span>03</span><strong>Access and limits</strong><small>The funding treatment and usage controls in your approval</small></li></ol></div></div></div>
<aside class="build-harness-access" aria-labelledby="harness-access-heading"><div><p class="home-kicker">API access and client setup</p><h3 id="harness-access-heading">Request access, then choose a client</h3><p>The access page covers eligibility, funding, key protection, client choice, and TritonAI Harness installation.</p></div><a class="btn btn-primary btn-lg" href="/developer-apis/start.html">Get API access</a></aside>
<p class="build-harness-source">TritonAI Harness is the primary supported client. Other compatible clients use the Gateway endpoint and key from their approval, and their features, extensions, and setup may differ.</p>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" id="workflow-automation" aria-labelledby="workflow-automation-heading">
<div class="container"><div class="row hub-split hub-split-align-center"><div class="col-md-7 hub-split-copy">
<p class="home-kicker">Workflow automation</p>
<h2 id="workflow-automation-heading">Build repeatable workflows with n8n</h2>
<p>UC San Diego hosts n8n, a visual workflow-automation platform that connects applications and APIs with little or no code. A workflow can start from a schedule, webhook, email, or file event and then run a defined series of steps. Workflows can also include AI-assisted steps and pause for human review before selected actions.</p>
<h3>Use TritonAI APIs in repeatable workflows</h3>
<p>n8n can send model requests through the Gateway inside a defined workflow. For interactive agent work, connect TritonAI Harness or another compatible client to the same APIs.</p>
<p><a class="btn btn-primary" href="https://support.ucsd.edu/">Request n8n access</a> <a class="btn btn-default" href="https://n8n.tritonai.ucsd.edu/">Open n8n</a></p>
</div><div class="col-md-5 hub-split-media">
<aside class="shared-compute-mini" aria-labelledby="n8n-access-heading">
<p id="n8n-access-heading">Request access</p>
<ol>
<li><span class="glyphicon glyphicon-send" aria-hidden="true"></span><div><strong>Submit a support request</strong><small>Ask the ITS-TritonAI team for access to the n8n platform.</small></div></li>
<li><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span><div><strong>Describe the intended workflow</strong><small>Include your AD username, department, intended use case, and whether you need a testing environment.</small></div></li>
<li><span class="glyphicon glyphicon-log-in" aria-hidden="true"></span><div><strong>Sign in after approval</strong><small>Use your UC San Diego SSO credentials at n8n.tritonai.ucsd.edu.</small></div></li>
</ol>
</aside>
</div></div></div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed shared-compute-bridge" id="shared-compute" aria-labelledby="shared-compute-heading">
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

<nav class="hub-section hub-link-panel" id="builder-resources" aria-labelledby="build-resources-heading"><div class="hub-heading"><p class="home-kicker">Builder resources</p><h2 id="build-resources-heading">Where to go next</h2></div><div class="row hub-link-columns"><div class="col-sm-6 col-md-4"><a href="#tritonai-harness"><strong>API clients</strong><span>TritonAI Harness and compatible alternatives</span></a></div><div class="col-sm-6 col-md-4"><a href="/developer-apis/start.html"><strong>Access and setup</strong><span>Eligibility, API keys, clients, and installation</span></a></div><div class="col-sm-6 col-md-4"><a href="/developer-apis/faq.html"><strong>Developer FAQ</strong><span>Common implementation questions</span></a></div><div class="col-sm-6 col-md-4"><a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/"><strong>Model Hub</strong><span>Capabilities and rates</span></a></div><div class="col-sm-6 col-md-4"><a href="/skills/index.html"><strong>Skills Library</strong><span>Reusable capability packages</span></a></div><div class="col-sm-6 col-md-4"><a href="/about/trust-architecture.html"><strong>Trust and architecture</strong><span>Hosting and oversight</span></a></div></div></nav>

<section class="hub-section hub-subscribe" id="build-start" aria-labelledby="prototype-heading"><div class="row hub-split hub-split-align-center"><div class="col-md-8"><p class="home-kicker">Get API access</p><h2 id="prototype-heading">Request a Gateway key</h2><p>The access page covers eligibility, funding, key protection, client choice, and TritonAI Harness installation.</p></div><div class="col-md-4 hub-subscribe-action"><a class="btn btn-primary btn-lg" href="/developer-apis/start.html">Request API access</a></div></div></section>
