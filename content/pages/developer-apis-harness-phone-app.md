---
title: TritonAI Harness Chat for iPhone
path: /developer-apis/harness-phone-app.html
description: Set up and get help with TritonAI Harness Chat, the iPhone companion for TritonAI Harness on your Mac or PC.
eyebrow: Build with TritonAI
lastReviewed: 2026-11-22
audiences: [staff, faculty, researchers, developers]
owner: TritonAI
source: "TritonAI Harness Chat 1.0 in-app setup guide and TritonAI Harness Sharing and access settings"
canonicalUrl: /developer-apis/harness-phone-app.html
relatedSlides: [platform-architecture, Citizen Developer Ecosystem]
landingHub: true
bannerImage: /_images/hero-abstract/build.webp
bannerPosition: center
bannerMode: abstract
---

<section class="hub-section hub-section-intro" aria-labelledby="phone-intro-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-8 hub-split-copy">
<p class="home-kicker">Pilot</p>
<h2 id="phone-intro-heading">Ask your work computer from your phone</h2>
<p class="hub-lede">TritonAI Harness Chat is an iPhone companion for <a href="/developer-apis/harness.html">TritonAI Harness</a>. You ask in your own words on your phone. The assistant on your Mac or PC does the work, and the answer appears in one conversation.</p>
<p>The app is in pilot. The TritonAI team shares the install link with pilot participants.</p>
</div>
<div class="col-md-4">
<aside class="hub-note-card">
<strong>What you need</strong>
<span>TritonAI Harness installed and open on your Mac or PC, and an iPhone on iOS 18 or later. On the same Wi-Fi it works as is. Anywhere else, both devices also need Tailscale.</span>
</aside>
</div>
</div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" aria-labelledby="phone-setup-heading">
<div class="container">
<div class="hub-heading">
<p class="home-kicker">Setup</p>
<h2 id="phone-setup-heading">Connect your phone to your computer</h2>
<p>Setup takes about two minutes with your computer in front of you. The app shows the same steps with pictures the first time it opens.</p>
</div>
<div class="row hub-number-grid">
<div class="col-sm-6 col-md-3">
<article>
<span>01</span>
<h3>Open Sharing &amp; access</h3>
<p>On your computer, open TritonAI Harness. Select Settings at the bottom left, then Sharing &amp; access.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>02</span>
<h3>Turn on Network access</h3>
<p>Turn on the first switch, Network access. Leave the other settings as they are. Only a phone you connect with a link can reach your computer.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>03</span>
<h3>Create a link</h3>
<p>Select Create link, then Create link again in the window that opens. On the new line, select Share to show a square code. The code works once, for about five minutes.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>04</span>
<h3>Scan the code</h3>
<p>In the app, choose Set it up and continue to Connect. Scan the square code, or select Copy link on your computer and tap Paste in the app.</p>
</article>
</div>
</div>
</div>
</section>

<section class="hub-section" aria-labelledby="phone-away-heading">
<div class="hub-heading">
<p class="home-kicker">Away from your Wi-Fi</p>
<h2 id="phone-away-heading">Use the app from anywhere</h2>
<p>Your phone reaches your computer directly while both are on the same Wi-Fi. To use the app from another network or on cellular, add Tailscale, a private-network app, to both devices.</p>
</div>
<div class="row hub-action-grid">
<div class="col-md-6">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-globe" aria-hidden="true"></span>
<h3>Set up Tailscale</h3>
<ol>
<li>Install Tailscale on your computer and sign in. On a university-managed computer, check with your IT group first.</li>
<li>Install Tailscale on your iPhone, sign in with the same account, and turn it on.</li>
<li>In TritonAI Harness on your computer, open Settings, then Sharing &amp; access. With Network access on, turn on Tailscale HTTPS.</li>
<li>Create a new link. In the phone app, open Settings and choose Reconnect.</li>
</ol>
</article>
</div>
<div class="col-md-6">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-ok-circle" aria-hidden="true"></span>
<h3>Check that it worked</h3>
<p>In the phone app, open Settings, then Connection details. The connection type reads Tailscale. Keep Tailscale turned on for both devices.</p>
<p>The app shows these steps under Settings, in Use it away from your Wi-Fi.</p>
</article>
</div>
</div>
</section>

<section class="hub-section" aria-labelledby="phone-help-heading">
<div class="hub-heading">
<p class="home-kicker">Help</p>
<h2 id="phone-help-heading">If the app does not connect</h2>
</div>
<div class="row hub-action-grid">
<div class="col-md-6">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-time" aria-hidden="true"></span>
<h3>Check the link</h3>
<ul>
<li>A code or link works once and expires after about five minutes. Create a new one and try again.</li>
<li>A link created while Network access was off only works on the computer itself. Turn on Network access, then create a new link.</li>
</ul>
</article>
</div>
<div class="col-md-6">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-signal" aria-hidden="true"></span>
<h3>Check the connection</h3>
<ul>
<li>Your phone and your computer need to be on the same Wi-Fi, or both on Tailscale.</li>
<li>Your computer has to be on and awake, with TritonAI Harness open. If it is asleep, your message waits on the phone and sends when it reconnects.</li>
</ul>
</article>
</div>
</div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" aria-labelledby="phone-use-heading">
<div class="container">
<div class="hub-heading">
<p class="home-kicker">Using the app</p>
<h2 id="phone-use-heading">What to expect</h2>
</div>
<div class="row hub-action-grid">
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-comment" aria-hidden="true"></span>
<h3>One conversation</h3>
<p>Type or dictate what you need. There are no projects, threads, or models to choose. History lists everything you asked before.</p>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-hand-up" aria-hidden="true"></span>
<h3>Approvals</h3>
<p>The assistant asks before opening a web page. In Settings you can have it ask before every step. Email drafts are written for you to review and send yourself.</p>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-play-circle" aria-hidden="true"></span>
<h3>Demo</h3>
<p>Choose Try a demo first on the opening screen to explore the app with sample answers before you connect a computer.</p>
</article>
</div>
</div>
</div>
</section>

<section class="hub-section hub-subscribe" aria-labelledby="phone-contact-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-8">
<p class="home-kicker">Support</p>
<h2 id="phone-contact-heading">Contact the TritonAI team</h2>
<p>For help with setup, to report a problem, or to ask about the pilot, email the service team. See the <a href="/developer-apis/harness-phone-app-privacy.html">privacy statement for the phone app</a> for how it handles your information.</p>
</div>
<div class="col-md-4 hub-subscribe-action">
<a class="btn btn-primary btn-lg" href="mailto:tritonai@ucsd.edu?subject=TritonAI%20Harness%20Chat%20for%20iPhone">Email TritonAI team</a>
</div>
</div>
</section>
