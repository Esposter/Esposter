---
title: Draft version history
description: Deferred — restorable point-in-time versions of the working copy, beyond publish snapshots.
---

# Draft version history

Point-in-time versions of the **working copy** (autosave checkpoints with restore), so an editing mistake older than the in-session undo stack is recoverable — distinct from publish snapshots, which only capture deliberate publishes.

## Why deferred

The content blob is a single working copy by design (one blob, one `contentVersion`); versioning it means either Azure Blob versioning (per-write version blobs — cost and lifecycle policy) or periodic checkpoint copies (when? how many?), plus a browse/restore UI per editor. In-session undo covers the common case; [publish history](/docs/platform/publish-history) covers the deliberate-milestone case.

## Revisit when

A user actually loses meaningful draft work (the signal that session undo + publish snapshots aren't enough), or Blob versioning is adopted for another reason.

## Cheaper interim

Publish as a checkpoint before risky edits — snapshots are cheap and [restorable](/docs/platform/publish-history).
