---
title: Softban preview
description: Deferred — show which messages a softban will delete before confirming.
---

# Softban Preview

Before executing a softban, show the moderator the target's recent messages that will be marked deleted, with a confirm step.

**Why deferred:** softban already works and is reversible in effect (messages are marked deleted, not purged); the preview is a nice-to-have confirmation UX with a non-trivial fetch (the target's recent messages across the partition).

**Revisit when:** a softban deletes something it shouldn't have and the lack of preview is the actual cause.
