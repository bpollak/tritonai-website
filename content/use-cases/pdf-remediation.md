---
title: PDF Remediator
slug: pdf-remediation
summary: Finds the document-accessibility problems software can catch reliably, and hands a qualified remediator the evidence for the rest.
status: Pilot
owner: TritonAI solutions team and campus accessibility partners
lastReviewed: 2026-07-24
audiences: [staff, faculty, developers]
source: TritonAI strategy presentation
measurementPeriod: 2026 pilot
dataClassification: Public description; document handling depends on source data
canonicalUrl: /use-cases/pdf-remediation.html
videoSrc: https://tritongpt-deck.vercel.app/media/pdf-remediator-1.6x.mov
videoPoster: https://tritongpt-deck.vercel.app/media/pdf-remediator-poster.png
videoLabel: PDF Remediator accessibility review demo
videoDescription: Silent screen recording showing a PDF upload, automated accessibility findings, remediation progress, and the reviewable results.
stats:
  - { value: "17+", label: "Automated checks", sub: "9 categories" }
  - { value: "Human", label: "Final review", sub: "Required for every document" }
  - { value: "Reviewable", label: "Evidence package", sub: "Findings and remaining work" }
toolHighlights: ["veraPDF Validation", "PDF/UA Standard", "Evidence Packs"]

relatedSlides: [the-flywheel-in-action-pdf-remediator]
humanOversight: A qualified human validates reading order, semantics, alternatives, and the final accessible document.
measurableOutcome: Issues detected, remediation time, residual accessibility findings, and reviewer agreement.
featured: false
---

## Problem

Some of PDF accessibility work is mechanical and checkable. The rest depends on visual and semantic judgments software cannot safely make on its own.

## Solution

The workflow looks for common structural and metadata problems, proposes fixes for some of them, and assembles an evidence package a human remediator can work from. It runs 17+ automated checks across 9 categories, covering reading order, tagged content, alternative text, and document structure, so a reviewer can see what was checked and what is still open. It assists expert work. It does not certify conformance.

## Current status

Pilot. A finished document still needs a manual accessibility review against the appropriate standards. A staff member with no engineering background built this through the Citizen Developer Program. It runs in the browser, uses no database, and is ready for campus SSO.
