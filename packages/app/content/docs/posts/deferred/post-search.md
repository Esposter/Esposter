---
title: Post search
description: Full-text search over post titles and descriptions.
---

# Post Search

Searching posts by title/description text.

**Why deferred:** The feed is small enough to scroll, and a good implementation wants either Postgres full-text indexes or the Azure AI Search route the platform already deliberated ([platform deferred](/docs/platform/deferred)) — infrastructure that should be decided once, platform-wide, not per-product.

**Revisit when:** the platform-level search decision lands (whichever backend), at which point posts join it as a source rather than building their own.
