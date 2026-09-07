---
title: Offline editing
description: Rejected — PWA-style offline resource editing with sync-on-reconnect.
---

# Offline editing

Editing resources offline (service-worker cache + queued saves that sync on reconnect).

## Why not

The resource model is deliberately one write path with optimistic concurrency on a single `contentVersion` — queued offline saves guarantee stale-version conflicts and demand merge semantics per content type (canvas JSON, SurveyJS models), which is CRDT territory the single-owner design explicitly avoids ([resource collaboration](/docs/platform/deferred/document-collaboration) defers the same machinery for the same reason). An editor that is a web app about your cloud resources being online is an acceptable constraint.
