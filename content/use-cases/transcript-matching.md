---
title: Transcript Matching
slug: transcript-matching
summary: A human-supervised workflow for matching transcript records and surfacing uncertain cases for review.
status: Production
owner: TritonAI solutions team and the sponsoring student-services owner
lastReviewed: 2026-07-20
audiences: [staff, leaders]
source: TritonAI strategy presentation
measurementPeriod: Production — live for enrollment management transcript review
dataClassification: Public description; student records require approved protected-data controls
canonicalUrl: /use-cases/transcript-matching.html
relatedSlides: [Transcript Matching]
humanOversight: Staff review uncertain matches and monitor quality before any broader use.
measurableOutcome: Match precision and recall, review volume, processing time, and exception rate.
featured: true
---

## Problem

High-volume transcript processing includes records with inconsistent layouts, identifiers, and scan quality. Manual matching is time-consuming, while an incorrect match can have serious consequences.

## Solution

The workflow extracts candidate identifiers, compares the evidence, and assigns confidence so staff can focus on exceptions. It runs in production with continuous monitoring and human review of uncertain matches.

## Current status

In production for UC San Diego enrollment management. The workflow ingests incoming transcripts, extracts candidate identifiers via OCR, compares evidence against course equivalencies, assigns confidence scores, and routes uncertain matches to staff for review.
