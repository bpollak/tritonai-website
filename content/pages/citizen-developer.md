---
title: Citizen Developer Guide
path: /developer-apis/citizen-developer.html
description: A plain-language guide to improving your own work with software, automation, or AI agents, and choosing the supported TritonAI path that fits.
eyebrow: Build with TritonAI
lastReviewed: 2026-09-01
audiences: [staff, faculty, researchers, developers, leaders]
owner: TritonAI
source: "The AI Daily Brief episode 'How to Start AI Coding If You Haven't Yet' (https://www.aidailybrief.ai/e/2026-08-29) and TritonAI public build, trust, and service ownership guidance"
canonicalUrl: /developer-apis/citizen-developer.html
relatedSlides: [Citizen Developer Ecosystem, Reusable Skills and MCP, platform-architecture]
landingHub: true
bannerImage: /_images/hero-abstract/build.webp
bannerPosition: center
bannerMode: abstract
---

<section class="hub-section hub-section-intro" aria-labelledby="citizen-intro-heading">
<div class="row hub-split hub-split-align-center"><div class="col-md-6 hub-split-copy"><p class="home-kicker">Citizen development</p><h2 id="citizen-intro-heading">Start with a task you already do</h2><p class="hub-lede">A citizen developer is anyone who uses software, automation, or AI agents to improve their own work. You do not need a developer role or a coding background. A good first project starts with a task you repeat, a result you can recognize as correct, and a person who reviews what the system does.</p><p>Use this guide to decide three things before you build: how the work will change, who will rely on the result, and which supported TritonAI path fits.</p></div><div class="col-md-6 hub-split-media">
<figure class="build-architecture" aria-describedby="citizen-decision-caption">
<p class="build-architecture-label">Answer three questions before choosing a tool</p>
<ol class="build-architecture-flow">
<li><span>01</span><div><strong>How the work changes</strong><small>Will software repeat, improve, or replace the current steps?</small></div></li>
<li><span>02</span><div><strong>Who depends on it</strong><small>Who will use it, and what happens if it fails?</small></div></li>
<li><span>03</span><div><strong>Where to build it</strong><small>Choose the TritonAI path that fits the work.</small></div></li>
</ol>
<figcaption id="citizen-decision-caption">Decide these three things before you build: how the work changes, who depends on the result, and which TritonAI path fits.</figcaption>
</figure>
</div></div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" aria-labelledby="patterns-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">Work pattern</p><h2 id="patterns-heading">How the work changes</h2><p>First decide how software should change your work. Any of the three patterns below can use regular code, an AI model, an AI agent, or a mix of these.</p></div>
<div class="row hub-action-grid">
<div class="col-md-4"><article class="panel panel-default hub-action-card"><span class="glyphicon glyphicon-repeat" aria-hidden="true"></span><h3>Automate</h3><p>Software repeats the steps you already do, and the finished result stays the same. Start here if you know exactly what a correct result looks like and can go back to doing the task by hand if something goes wrong.</p><p><strong>Example:</strong> Turn a monthly spreadsheet cleanup into a pipeline that shows you every change before you accept it.</p></article></div>
<div class="col-md-4"><article class="panel panel-default hub-action-card"><span class="glyphicon glyphicon-stats" aria-hidden="true"></span><h3>Upgrade</h3><p>The task keeps its purpose, but people get a better result than before. The result might be interactive, always current, searchable, or available without waiting for the next meeting.</p><p><strong>Example:</strong> Replace a status deck you rebuild every week with a web page that always shows the latest numbers and when they were last refreshed.</p></article></div>
<div class="col-md-4"><article class="panel panel-default hub-action-card"><span class="glyphicon glyphicon-flash" aria-hidden="true"></span><h3>Invent</h3><p>Build something new that was never possible by hand. Because there is no existing process to copy, treat usefulness as a question to test before making the build permanent.</p><p><strong>Example:</strong> Watch approved public websites for changes that matter to your unit and send the relevant ones to a person for review.</p></article></div>
</div></div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" aria-labelledby="delivery-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">Who will use it</p><h2 id="delivery-heading">Add controls as more people rely on the result</h2><p>The more people depend on what you build, the more care it needs: testing, access management, support, and monitoring. Even a small or temporary build must follow UC San Diego requirements for data, security, privacy, and appropriate use.</p></div>
<div class="row hub-number-grid">
<div class="col-sm-6 col-md-3"><article><span>01</span><h3>Prototype</h3><p>Tests an idea with sample data you are approved to use. Keep it to yourself, write down what it showed, and shut it down or revise it when the test ends.</p></article></div>
<div class="col-sm-6 col-md-3"><article><span>02</span><h3>Personal or team workflow</h3><p>Does a recurring job for you or a small, known group. It needs consistent results, an approved place to run, a person who checks the output, and a way back to the manual process if it breaks.</p></article></div>
<div class="col-sm-6 col-md-3"><article><span>03</span><h3>Supported service</h3><p>Serves people outside your own team. Before launch it needs all of the following:<ul><li>a named owner</li><li>accessibility, privacy, and security review</li><li>testing under realistic load</li><li>a support path and monitoring</li><li>a process for making changes</li></ul></p></article></div>
<div class="col-sm-6 col-md-3"><article><span>04</span><h3>Public product</h3><p>Serves a broad public audience. This requires the formal campus product and service process with ongoing ownership, and it is rarely a good first citizen-development project.</p></article></div>
</div>
<aside class="hub-note-card citizen-note-card"><strong>Software for a fixed period needs an exit plan</strong><span>Some builds only need to exist for one event or quarter. When you start, write down when it ends, who owns it, what happens to its data, and how it will be retired.</span></aside>
</div>
</section>

<section class="hub-section" aria-labelledby="opportunities-heading">
<div class="hub-heading"><p class="home-kicker">Opportunity scan</p><h2 id="opportunities-heading">Where to look in your day-to-day work</h2><p>Look for tasks you repeat, explain, check, or review. These examples are starting points for a conversation with your service owner. Each project still needs the appropriate review before work begins.</p></div>
<div class="row hub-action-grid">
<div class="col-sm-6 col-md-4"><article class="panel panel-default hub-action-card"><span class="glyphicon glyphicon-blackboard" aria-hidden="true"></span><h3>Presentation work</h3><p>Turn an explanation you give over and over into a walkthrough, comparison, calculator, status page, or interactive explainer.</p></article></div>
<div class="col-sm-6 col-md-4"><article class="panel panel-default hub-action-card"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span><h3>Content work</h3><p>Turn approved source material into a draft summary, update, or brief that a person reviews before it is used.</p></article></div>
<div class="col-sm-6 col-md-4"><article class="panel panel-default hub-action-card"><span class="glyphicon glyphicon-signal" aria-hidden="true"></span><h3>Data work</h3><p>Reconcile exports, repeat an analysis you run often, flag exceptions, or replace a recurring snapshot with a dashboard that cites its sources.</p></article></div>
<div class="col-sm-6 col-md-4"><article class="panel panel-default hub-action-card"><span class="glyphicon glyphicon-file" aria-hidden="true"></span><h3>Document work</h3><p>Pull approved fields out of documents, fill in a template, convert files between formats, or link each finding to the exact passage a reviewer needs to check.</p></article></div>
<div class="col-sm-6 col-md-4"><article class="panel panel-default hub-action-card"><span class="glyphicon glyphicon-inbox" aria-hidden="true"></span><h3>Inbox and intake work</h3><p>Organize submissions, spot missing information, route a request to the right team, or prepare a draft response for a person to check and send.</p></article></div>
<div class="col-sm-6 col-md-4"><article class="panel panel-default hub-action-card"><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span><h3>Administrative work</h3><p>Assemble a briefing, track a deadline, update a checklist, or coordinate repeatable steps across approved systems.</p></article></div>
</div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" aria-labelledby="campus-path-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">TritonAI ecosystem</p><h2 id="campus-path-heading">Choose a path that fits the work</h2><p>Start with the simplest supported option that meets the need. You can move a workflow to a different path later as its audience, data, or support needs change.</p></div>
<div class="build-tool-grid">
<article class="build-tool-preferred"><span class="glyphicon glyphicon-console" aria-hidden="true"></span><p class="build-tool-label">Interactive agent work</p><h3>TritonAI Harness</h3><p>Work on a small task that can span files, browser work, and approved connections. The Harness asks for your approval before significant actions, so you stay in control while you learn which steps are worth repeating.</p></article>
<article><span class="glyphicon glyphicon-random" aria-hidden="true"></span><p class="build-tool-label">Repeatable workflow</p><h3>n8n</h3><p>Run a process you already understand. n8n starts the steps on a schedule, when a message or file arrives, or when another system sends a request. It fits best once you know the process and how it should handle exceptions.</p></article>
<article><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span><p class="build-tool-label">Application or shared capability</p><h3>APIs and skills</h3><p>Add approved AI models to software you already run, or package instructions and reference material into a skill that others can review and reuse.</p></article>
</div>
<p class="hub-section-action"><a class="btn btn-primary" href="/developer-apis/index.html">Compare TritonAI build paths</a> <a class="btn btn-default" href="/skills/index.html">Browse the Skills Library</a></p>
</div>
</section>

<section class="hub-section" aria-labelledby="first-project-heading">
<div class="hub-heading"><p class="home-kicker">First project</p><h2 id="first-project-heading">Choose a project you can check</h2><p>A good first project has a result you can verify, limited access to people and data, and a clear way back to the current process. Write down the answers to the questions below before you open a builder or ask an agent to act.</p></div>
<div class="row hub-principle-grid">
<div class="col-sm-6 col-md-4"><article><span class="glyphicon glyphicon-repeat" aria-hidden="true"></span><h3>Recurring task</h3><p>Which task do you repeat often enough that improving it would matter?</p></article></div>
<div class="col-sm-6 col-md-4"><article><span class="glyphicon glyphicon-ok-circle" aria-hidden="true"></span><h3>Known result</h3><p>What does a correct result look like, and what source can you check it against?</p></article></div>
<div class="col-sm-6 col-md-4"><article><span class="glyphicon glyphicon-lock" aria-hidden="true"></span><h3>Approved boundary</h3><p>Which people, systems, and data will the project touch, and which must it leave alone?</p></article></div>
<div class="col-sm-6 col-md-4"><article><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span><h3>Human review</h3><p>Who checks the result before it changes a record, reaches another person, or informs a decision?</p></article></div>
<div class="col-sm-6 col-md-4"><article><span class="glyphicon glyphicon-backward" aria-hidden="true"></span><h3>Manual fallback</h3><p>Can you stop the workflow and return to the current process without losing access or data?</p></article></div>
<div class="col-sm-6 col-md-4"><article><span class="glyphicon glyphicon-user" aria-hidden="true"></span><h3>Named owner</h3><p>Who decides whether to keep, change, support, or retire the build?</p></article></div>
</div>
<aside class="hub-note-card"><strong>Check what already exists</strong><span>Before building, check whether an approved campus service already meets the need. Build the missing piece when the benefit is worth owning and maintaining it.</span></aside>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" aria-labelledby="training-heading">
<div class="container"><div class="row hub-split hub-split-align-center"><div class="col-md-7 hub-split-copy"><p class="home-kicker">Training conversation</p><h2 id="training-heading">Describe the task in one page</h2><p>Bring a short problem statement to a citizen-developer session. Cover the following:</p><ul><li>What happens today, and who does it</li><li>What goes in, what comes out, and how often</li><li>Who reviews the result, and what data it touches</li><li>What happens if it fails</li></ul><p>That is enough to choose a pattern and test a first version.</p><p>This page adapts the build framework in <a href="https://www.aidailybrief.ai/e/2026-08-29" rel="noopener noreferrer" target="_blank">The AI Daily Brief episode "How to Start AI Coding If You Haven't Yet"</a> for the TritonAI ecosystem. UC San Diego's campus data and service requirements apply to every path.</p></div><div class="col-md-5"><div class="hub-quote-card citizen-training-card"><span class="glyphicon glyphicon-check" aria-hidden="true"></span><h3>Ready for a first experiment?</h3><p>Start with one small task and data you are approved to use. Keep the current process running while you test.</p><p><a class="btn btn-primary" href="/developer-apis/start.html">Review access and setup</a></p></div></div></div></div>
</section>
