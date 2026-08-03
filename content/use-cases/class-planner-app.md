---
title: Class Planner App
slug: class-planner-app
summary: Undergraduates build conflict-free schedule options from live section data, compare them side by side, and hand the finished plan to TSS for booking.
status: Production
owner: Class Planner service and the sponsoring enrollment-management team
lastReviewed: 2026-08-02
audiences: [students]
source: Production application at classplanner.apps.ucsd.edu and the Class Planner guide
measurementPeriod: Production service reviewed in August 2026
dataClassification: Public description; course selections and personal commitments follow the production service's approved controls
canonicalUrl: /use-cases/class-planner-app.html
relatedSlides: []
humanOversight: Students choose the courses, review every proposed schedule, and complete official enrollment in TSS; the planner never books a seat.
measurableOutcome: Schedule drafts created, alternatives compared, preference constraints honored, and handoffs to TSS completed.
featured: false
stats:
  - { value: "Live", label: "Section data", sub: "Seats, waitlists, and meeting times" }
  - { value: "Multiple", label: "Schedule options", sub: "Compared before enrolling" }
  - { value: "TSS", label: "Booking handoff", sub: "Enrollment stays in the student system" }
toolHighlights: ["Preference-aware schedules", "Side-by-side comparison", "Campus map with walk times"]
resourceLinks:
  - label: Open Class Planner
    href: https://classplanner.apps.ucsd.edu/
    description: Read the guide, then build and compare schedules for the current term.
---

## Problem

Course search, seat counts, meeting patterns, personal commitments, and campus geography all live in different places. Assembling them into a workable schedule by hand means re-checking every combination each time one section fills.

## Solution

Class Planner pulls live section data for the chosen term. Students add courses, set preferences such as blocked hours and preferred start times, and the planner generates schedule options that avoid conflicts. Each option shows a weekly calendar, full section details with open seats and waitlist counts, and a campus map with walking times between classes. When a plan looks right, the planner hands the student to TSS to complete official enrollment.

## Current status

In production for undergraduate schedule planning. The planner drafts and compares options; students verify section details and finish booking in TSS. The <a href="/use-cases/class-planner.html">TritonGPT Class Scheduling Assistant</a> remains available for conversational planning.
