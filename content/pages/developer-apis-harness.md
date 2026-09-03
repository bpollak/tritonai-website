---
title: TritonAI Harness
path: /developer-apis/harness.html
description: A local-first agent control surface for desktop and web that connects campus builders to approved models, local files, and UC San Diego systems under human supervision.
eyebrow: Build with TritonAI
lastReviewed: 2026-09-03
audiences: [staff, faculty, researchers, developers]
owner: TritonAI
source: "TritonAI Harness product documentation and UC San Diego AI service guidance"
canonicalUrl: /developer-apis/harness.html
relatedSlides: [Citizen Developer Ecosystem, Reusable Skills and MCP, platform-architecture]
landingHub: true
bannerImage: /_images/hero-abstract/build.webp
bannerPosition: center
bannerMode: abstract
---

<section class="hub-section hub-section-intro" aria-labelledby="harness-intro-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-7 hub-split-copy">
<p class="home-kicker">Agent control surface</p>
<h2 id="harness-intro-heading">Work directly with your code, files, and systems</h2>
<p class="hub-lede">TritonAI Harness is UC San Diego's primary supported agent workspace. It runs on your computer. It connects to campus models, local files, and approved campus tools under your supervision.</p>
<p>Unlike browser chat tools that only answer questions, the Harness works alongside you. It reads project files, drafts code changes, and runs terminal commands. You approve each action before it takes effect.</p>
<p class="hub-section-action">
<a class="btn btn-primary" href="/developer-apis/start.html#harness">Download installer</a>
<a class="btn btn-default" href="https://ucsd.kualibuild.com/app/6979392e4f46f40289d22645/run">Request Gateway access</a>
<a class="btn btn-default" href="/skills/index.html">Browse Skills Library</a>
</p>
</div>
<div class="col-md-5 hub-split-media">
<figure class="build-architecture" aria-describedby="harness-architecture-caption">
<p class="build-architecture-label">Governed agent execution</p>
<ol class="build-architecture-flow">
<li><span>01</span><div><strong>Local workspace</strong><small>Files, transcripts, and code remain on your workstation.</small></div></li>
<li><span>02</span><div><strong>Campus gateway</strong><small>Zero-retention on-premises models on UC San Diego infrastructure.</small></div></li>
<li><span>03</span><div><strong>Supervised execution</strong><small>You approve file edits, commands, and external actions.</small></div></li>
</ol>
<figcaption id="harness-architecture-caption">TritonAI Harness isolates credentials and runs within your local workspace under your supervision.</figcaption>
</figure>
</div>
</div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" aria-labelledby="comparison-heading">
<div class="container">
<div class="hub-heading">
<p class="home-kicker">Choose by task</p>
<h2 id="comparison-heading">Comparing TritonGPT and TritonAI Harness</h2>
<p>Both services use UC San Diego AI infrastructure, but they serve different tasks and handle data differently.</p>
</div>
<div class="table-responsive comparison-table-wrapper">
<table class="table comparison-table">
<thead>
<tr>
<th class="col-feature" scope="col">Capabilities</th>
<th class="col-tritongpt" scope="col">
<div class="comparison-table-product">
<strong>TritonGPT</strong>
<span class="comparison-table-badge">Web Platform</span>
</div>
</th>
<th class="col-harness" scope="col">
<div class="comparison-table-product">
<strong>TritonAI Harness</strong>
<span class="comparison-table-badge comparison-table-badge-gold">Agent Workspace</span>
</div>
</th>
</tr>
</thead>
<tbody>
<tr>
<th scope="row"><span class="glyphicon glyphicon-hdd" aria-hidden="true"></span> Where it runs</th>
<td>
<div class="comparison-table-val">
<strong>Campus web servers</strong>
<small>Access directly in any browser. No local installation or setup required.</small>
</div>
</td>
<td>
<div class="comparison-table-val">
<strong>Local workstation</strong>
<small>Native desktop app installed on your Mac (M1+) or Windows x64 computer.</small>
</div>
</td>
</tr>
<tr>
<th scope="row"><span class="glyphicon glyphicon-folder-open" aria-hidden="true"></span> System access</th>
<td>
<div class="comparison-table-val">
<strong>Session uploads</strong>
<small>Reads documents and spreadsheets uploaded into active chat conversations.</small>
</div>
</td>
<td>
<div class="comparison-table-val">
<strong>Local folders, terminal, &amp; git</strong>
<small>Reads project directories, edits local code, and runs shell commands with your approval.</small>
</div>
</td>
</tr>
<tr>
<th scope="row"><span class="glyphicon glyphicon-lock" aria-hidden="true"></span> Data storage</th>
<td>
<div class="comparison-table-val">
<strong>Campus server retention (90 days)</strong>
<small>Chat conversations reside on campus servers and purge automatically after 90 days.</small>
</div>
</td>
<td>
<div class="comparison-table-val">
<strong>100% local residency (~/.tritonai-harness)</strong>
<small>Transcripts, code, and memory vaults remain on your device with instant user deletion.</small>
</div>
</td>
</tr>
<tr>
<th scope="row"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></span> Host plugins</th>
<td>
<div class="comparison-table-val">
<strong>Web widgets &amp; directory</strong>
<small>Connects to university websites, departmental knowledge bases, and directory lookups.</small>
</div>
</td>
<td>
<div class="comparison-table-val">
<strong>GitHub, Google Workspace, &amp; Microsoft 365</strong>
<small>Host-managed OAuth plugins with draft-first safeguards for email and calendar.</small>
</div>
</td>
</tr>
<tr>
<th scope="row"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span> Human oversight</th>
<td>
<div class="comparison-table-val">
<strong>Chat window interaction</strong>
<small>You evaluate text responses directly in the browser interface.</small>
</div>
</td>
<td>
<div class="comparison-table-val">
<strong>Human-in-the-loop review</strong>
<small>Explicit human approval required for every file modification, shell command, or write action.</small>
</div>
</td>
</tr>
<tr>
<th scope="row">
<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:8px;fill:none;stroke:var(--triton-blue,#006A96);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;">
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
<path d="M9 12l2 2 4-4"/>
</svg>
Data classification
</th>
<td>
<div class="comparison-table-val">
<strong><span class="glyphicon glyphicon-ok-circle" style="color:#00853E;margin-right:4px;" aria-hidden="true"></span> P1 through P3 Approved</strong>
<small>Approved for institutional campus records. Protection Level 4 (P4) is prohibited.</small>
</div>
</td>
<td>
<div class="comparison-table-val">
<strong><span class="glyphicon glyphicon-ok-circle" style="color:#00853E;margin-right:4px;" aria-hidden="true"></span> P1 through P3 Approved</strong>
<small>Approved for administrative and research work in approved setups. P4 prohibited.</small>
</div>
</td>
</tr>
<tr class="comparison-table-action-row">
<td></td>
<td>
<a class="btn btn-default btn-block" href="/tritongpt/index.html">Open TritonGPT Web</a>
</td>
<td>
<a class="btn btn-primary btn-block" href="/developer-apis/start.html#harness">Get TritonAI Harness</a>
</td>
</tr>
</tbody>
</table>
</div>
<aside class="hub-note-card">
<strong>Need conversational web chat without installing software?</strong>
<span>Use <a href="/tritongpt/index.html">TritonGPT</a> for direct questions, document review, and campus administrative assistants. Use the Harness when you need an agent to work in a local project folder or run code.</span>
</aside>
</div>
</section>

<section class="hub-section" aria-labelledby="audiences-heading">
<div class="hub-heading">
<p class="home-kicker">Campus roles</p>
<h2 id="audiences-heading">Who uses TritonAI Harness</h2>
<p>The Harness provides structured workspaces tailored to different roles across UC San Diego.</p>
</div>
<div class="row hub-action-grid">
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-user" aria-hidden="true"></span>
<h3>Staff and citizen developers</h3>
<p>Automate recurring spreadsheets, generate draft reports, and organize intake data without sending records to external clouds.</p>
<p><a href="/developer-apis/citizen-developer.html">Citizen Developer Guide <span aria-hidden="true">→</span></a></p>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span>
<h3>Software developers</h3>
<p>Orchestrate multi-file edits, automate test suites, and review pull requests across local git repositories.</p>
<p><a href="/developer-apis/index.html">Developer APIs <span aria-hidden="true">→</span></a></p>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-education" aria-hidden="true"></span>
<h3>Faculty and researchers</h3>
<p>Query local datasets and run prompt pipelines against zero-retention on-premises models under strict grant privacy controls.</p>
<p><a href="/developer-apis/dsmlp-datahub.html">DSMLP and DataHub <span aria-hidden="true">→</span></a></p>
</article>
</div>
</div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" aria-labelledby="capabilities-heading">
<div class="container">
<div class="hub-heading">
<p class="home-kicker">Core capabilities</p>
<h2 id="capabilities-heading">Execution and safety architecture</h2>
<p>TritonAI Harness balances agent capabilities with rigorous institutional guardrails.</p>
</div>
<div class="row hub-number-grid">
<div class="col-sm-6 col-md-3">
<article>
<span>01</span>
<h3>Local-first execution</h3>
<p>Your project files, conversation transcripts, and memory vaults remain on your workstation in <code>~/.tritonai-harness</code>. No external model training occurs on your code or text.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>02</span>
<h3>On-premises models</h3>
<p>Connect to campus-hosted open-weight models on UC San Diego infrastructure, including GLM 5.2 with 320K context, with zero data retention and zero recharge costs for administrative work.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>03</span>
<h3>Supervised execution</h3>
<p>Review and approve proposed file modifications, terminal commands, and external requests before any action takes place on your system.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>04</span>
<h3>Credential isolation</h3>
<p>API keys and OAuth tokens reside in your operating system secret store. They remain isolated from model prompts and cannot leak into transcripts or logs.</p>
</article>
</div>
</div>
</div>
</section>

<section class="hub-section" aria-labelledby="integrations-heading">
<div class="hub-heading">
<p class="home-kicker">Host integrations</p>
<h2 id="integrations-heading">Included plugins</h2>
<p>Turn plugins on or off in Settings, then choose the abilities they can use. Connected-service credentials remain on your workstation and are never passed to the model.</p>
</div>
<div class="row hub-action-grid">
<div class="col-sm-6 col-md-4">
<article class="panel panel-default hub-action-card">
<svg class="plugin-logo" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true" fill="#182B49">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
</svg>
<h3>GitHub</h3>
<p>Connect a GitHub account with OAuth to read repositories, draft pull requests, and automate development workflows. Access follows your signed-in permissions.</p>
</article>
</div>
<div class="col-sm-6 col-md-4">
<article class="panel panel-default hub-action-card">
<svg class="plugin-logo" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
<path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
</svg>
<h3>Google Workspace</h3>
<p>Connect UC San Diego Google Drive, Gmail, and Calendar through fixed, bounded tools connected to the verified ucsd.edu hosted domain.</p>
</article>
</div>
<div class="col-sm-6 col-md-4">
<article class="panel panel-default hub-action-card">
<svg class="plugin-logo" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
<path fill="#F25022" d="M1 1h10v10H1z"/>
<path fill="#7FBA00" d="M13 1h10v10H13z"/>
<path fill="#00A4EF" d="M1 13h10v10H1z"/>
<path fill="#FFB900" d="M13 13h10v10H13z"/>
</svg>
<h3>Microsoft 365</h3>
<p>Read mail, calendars, and Teams chats with delegated access. Write operations default to draft mode for your review before sending.</p>
</article>
</div>
</div>
<aside class="hub-note-card">
<strong>Immediate revocation</strong>
<span>Disabling a plugin in Settings revokes its tools immediately. Changes reconcile before the next agent turn.</span>
</aside>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" aria-labelledby="skills-heading">
<div class="container">
<div class="hub-heading">
<p class="home-kicker">Reusable capabilities</p>
<h2 id="skills-heading">UCSD Skills Library</h2>
<p>Skills package instructions, references, and scripts that agents load on demand. Maintained in the <a href="https://github.com/UCSD/UCSD-Skills-Library" target="_blank" rel="noopener noreferrer">UCSD Skills Library</a> and installed locally in <code>~/.agents/ucsd/skills/</code>.</p>
</div>
<div class="row hub-action-grid">
<div class="col-sm-6 col-md-3">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>
<h3>Accessibility compliance</h3>
<p>Audit and remediate web pages, templates, and documents against WCAG 2.1 AA and UCSD Digital Accessibility standards.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article class="panel panel-default hub-action-card">
<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" style="display:block;margin-bottom:12px;fill:none;stroke:var(--triton-blue,#006A96);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;">
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
<path d="M9 12l2 2 4-4"/>
</svg>
<h3>Data classification</h3>
<p>Classify application schemas, storage repositories, and API endpoints under UC IS-3 Protection Levels (P1 through P4).</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-th-large" aria-hidden="true"></span>
<h3>Decorator branding</h3>
<p>Build web interfaces matching UC San Diego Decorator 5 standards without altering protected campus chrome.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span>
<h3>Automated code review</h3>
<p>Run defect-first automated reviews before commits or pull requests merge into campus repositories.</p>
</article>
</div>
</div>
<p class="hub-section-action">
<a class="btn btn-primary" href="/skills/index.html">Browse the full Skills Library</a>
<a class="btn btn-default" href="https://github.com/UCSD/UCSD-Skills-Library" target="_blank" rel="noopener noreferrer">View repository on GitHub</a>
</p>
</div>
</section>

<section class="hub-section" id="download-installer" aria-labelledby="install-heading">
<div class="hub-heading">
<p class="home-kicker">Onboarding</p>
<h2 id="install-heading">Get started with TritonAI Harness</h2>
<p>Follow three steps to verify eligibility, request your key, and install the desktop application.</p>
</div>
<div class="row hub-action-grid">
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-check" aria-hidden="true"></span>
<h3>1. Verify requirements</h3>
<p>Mac requires Apple Silicon (M1 or newer). Windows requires an x64 processor. Workstations must maintain active disk encryption (FileVault or BitLocker) for P2 and P3 data.</p>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-lock" aria-hidden="true"></span>
<h3>2. Request Gateway key</h3>
<p>Submit an access request through Kuali Build. Campus administrative work using on-premises models is non-recharged.</p>
<p><a class="btn btn-default" href="https://ucsd.kualibuild.com/app/6979392e4f46f40289d22645/run">Submit access request</a></p>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span>
<h3>3. Download and set up</h3>
<p>Visit the Get Started page for current macOS (Apple Silicon DMG) and Windows (x64 Setup EXE) installers, release notes, and configuration steps.</p>
<p><a class="btn btn-primary" href="/developer-apis/start.html#harness">Go to Download &amp; Setup <span aria-hidden="true">→</span></a></p>
</article>
</div>
</div>
<aside class="hub-note-card">
<strong>Need help choosing a setup path?</strong>
<span>Review our guided onboarding on the <a href="/developer-apis/start.html">Get Started page</a> or email <a href="mailto:tritonai@ucsd.edu">tritonai@ucsd.edu</a>.</span>
</aside>
</section>

<section class="hub-section hub-subscribe" aria-labelledby="privacy-callout-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-8">
<p class="home-kicker">Data governance</p>
<h2 id="privacy-callout-heading">Privacy and data protection</h2>
<p>TritonAI Harness is approved for UC Protection Levels 1 through 3 (P1 through P3) within approved campus setups. Protection Level 4 (P4) data is prohibited. Because your workspace files and transcripts reside on your local workstation, endpoint encryption and device security standards apply.</p>
</div>
<div class="col-md-4 hub-subscribe-action">
<a class="btn btn-primary btn-lg" href="/developer-apis/harness-privacy.html">Read Privacy Statement</a>
</div>
</div>
</section>
