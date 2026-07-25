---
title: TritonGPT Class Planner
slug: class-planner
summary: A TritonGPT assistant that turns course requirements and time constraints into a conflict-aware draft schedule for student review.
status: Production
owner: TritonGPT service and the sponsoring enrollment-management team
lastReviewed: 2026-07-25
audiences: [students, staff]
source: TritonGPT Class Scheduling Assistant demonstration and current service status
measurementPeriod: Production as of July 2026
dataClassification: Public description; student prompts and course information follow approved TritonGPT controls
canonicalUrl: /use-cases/class-planner.html
videoSrc: https://tritongpt-deck.vercel.app/media/TritonGPT%20Class%20Scheduling%20Agent%20-%20LinkedIn%20Horizontal.mp4
videoPoster: /_images/use-cases/tritongpt-class-planner-demo.webp
videoLabel: TritonGPT Class Scheduling Assistant demo
videoDescription: One-minute screen recording with background music and on-screen callouts showing the assistant interpreting course requirements, building a conflict-aware schedule, adapting to a work schedule, and preparing a plan for review before official booking.
videoCaptionsSrc: /_resources/captions/tritongpt-class-planner.vtt
videoCaptionsLabel: English
relatedSlides: [video-tritongpt-class-scheduling-agent]
humanOversight: Students confirm requirements and constraints, review every proposed course and meeting time, and complete official booking in the student system.
measurableOutcome: Successful draft creation, conflict identification, constraint handling, student corrections, and usefulness before official booking.
featured: false
toolHighlights: ["Course Requirements", "Conflict Checking", "Work-Schedule Constraints"]
resourceLinks:
  - label: Open TritonGPT
    href: https://tritongpt.ucsd.edu/
    description: Sign in and open the Class Scheduling Assistant in TritonGPT.
---

## Problem

Building a workable class schedule requires comparing course requirements, meeting patterns, work commitments, and other unavailable times across many possible combinations.

## Solution

The TritonGPT Class Scheduling Assistant gathers required courses and time constraints conversationally, checks for conflicts, and proposes a draft combination for the student to review. Students can add work or other commitments and ask the assistant to revise the plan.

This assistant is distinct from the standalone Class Planner web app. Planning happens in TritonGPT; official course review and booking remain in the student system.

## Current status

In production in TritonGPT. The assistant prepares a plan, not an enrollment decision. Students remain responsible for verifying course requirements, meeting details, conflicts, availability, and the final booking.
