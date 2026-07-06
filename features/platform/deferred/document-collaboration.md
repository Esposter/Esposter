# Document Collaboration

Multi-user access to documents: sharing with specific users, roles/ACLs, concurrent editing.

## Why deferred

Documents are single-owner by design in phase 3; publishing already covers the read-sharing case. Write-sharing needs an ACL model, invitation flow, and (for concurrent editing) CRDT/OT machinery — each a project of its own with no current demand.

## Revisit when

Publishing ships and users ask to co-edit rather than just view, or a teams/org concept lands.

## Cheaper interim

Publish for read access; export/import content for handoff.
