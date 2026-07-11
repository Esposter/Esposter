---
title: Edit history
description: Rejected — append-only store of previous message versions.
---

# Edit History

Append-only store of previous message versions, with a "view edits" link on edited messages.

**Why not**

- Storage grows unboundedly with every edit across all users.
- Marginal value on a casual platform; almost nobody audits edits.
- The shipped `(edited)` label already signals that a message changed.
