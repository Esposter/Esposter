---
title: Nested comment threads
description: Reddit-style reply trees rendered from the existing parentId/depth model.
---

# Nested Comment Threads

Replying to comments, rendered as an indented tree. The data model is already fully threaded — comments are posts with `parentId` and `depth`, and `readPosts` pages any node's children — only the UI (a reply button per comment card, recursive rendering, per-branch pagination, a depth cap) is missing.

**Why deferred:** Single-level comments serve current comment volumes fine, and threading is real UI complexity (recursive cards, collapse state, load-more per branch). Building it before threads exist optimizes for a scale the product hasn't hit.

**Revisit when:** posts regularly accumulate enough comments that flat lists lose conversations — the moment users start quoting each other manually.
