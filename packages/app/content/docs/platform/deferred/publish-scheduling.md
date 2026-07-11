---
title: Publish scheduling
description: Deferred — schedule publishResource / unpublishResource at a future time.
---

# Publish scheduling

Schedule a publish or unpublish at a future time ("go live Monday 9:00"), via the same Service Bus scheduled-message pattern the scheduled message jobs use.

## Why deferred

Publishing is a one-click action on a single-owner resource — the owner can simply click at the right time. Scheduling earns its complexity (pending-state UI, cancellation, fire-time verification) when publishes are coordinated events with an audience, which needs distribution ([email sending](/docs/platform/deferred/email-sending), share flows) to exist first.

## Revisit when

Distribution features ship and a publish is something users coordinate for a moment in time rather than flip when ready.

## Cheaper interim

Publish manually; the snapshot mechanism makes re-publishing cheap.
