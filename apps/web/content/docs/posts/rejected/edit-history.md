---
title: Edit history
description: Public revision history for edited posts and comments.
---

# Edit History

Storing and displaying prior revisions of edited posts/comments.

**Why not:** Revision storage (a versions table or jsonb log) and its UI serve accountability norms of large public forums; a casual platform where you edit your own typos doesn't need an audit trail, and the posts table deliberately stays one row per post. Moderation-grade accountability lives in esbabbler's moderation log where it actually matters.
