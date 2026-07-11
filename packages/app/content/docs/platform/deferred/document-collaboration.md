---
title: Resource collaboration
description: Deferred — multi-user access to resources: sharing, roles/ACLs, concurrent editing.
---

# Resource collaboration

Multi-user access to resources: sharing with specific users, roles/ACLs, concurrent editing.

## Why deferred

Resources are single-owner by design; publishing already covers the read-sharing case. Write-sharing needs an ACL model, invitation flow, and (for concurrent editing) CRDT/OT machinery — each a project of its own with no current demand.

## Revisit when

Users ask to co-edit rather than just view, or a teams/org concept lands.

## Cheaper interim

Publish for read access; export/import content for handoff.
