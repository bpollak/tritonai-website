---
title: PDF Remediator
slug: pdf-remediation
summary: An assistive workflow that identifies common document-accessibility issues and prepares evidence for a human remediator.
status: Pilot
owner: TritonAI solutions team and campus accessibility partners
lastReviewed: 2026-07-24
audiences: [staff, faculty, developers]
source: TritonAI strategy presentation
measurementPeriod: 2026 pilot
dataClassification: Public description; document handling depends on source data
canonicalUrl: /use-cases/pdf-remediation.html
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

PDF accessibility work combines automatable checks with visual and semantic judgments that software cannot safely make on its own.

## Solution

The workflow checks common structural and metadata problems, proposes selected fixes, and produces a reviewable evidence package for a human remediator. It runs 17+ automated checks across 9 categories—including reading order, tagged content, alternative text, and document structure—so reviewers can see what was checked and what remains. It is designed to assist expert work, not to certify conformance automatically.

## Current status

Pilot. A final document still requires manual accessibility review with the appropriate tools and standards. Built by a staff member — not an engineer — through the Citizen Developer Program, the tool is browser-first with no database and SSO-ready for campus hosting.
