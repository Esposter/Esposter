---
title: Deferred
description: Platform ideas we decided not to build yet — one page per idea, each with a concrete revisit trigger.
---

# Platform deferred ideas

One page per deferred idea (not now — with a revisit trigger). Check here and [rejected](/docs/platform/rejected) before adding a roadmap item or proposal — never re-argue a decided idea.

- [AI resource generation](/docs/platform/deferred/ai-resource-generation) — first-ever LLM dependency is a platform decision, not a create-form tweak
- [API / SQL dataset providers](/docs/platform/deferred/api-sql-dataset-providers) — external data sources need secret storage + SSRF/injection work with no consumer yet
- [Azure AI Search](/docs/platform/deferred/azure-ai-search) — the only paid parity item; `ilike` → `pg_trgm` covers current volumes
- [Blade nav filter + groups](/docs/platform/deferred/blade-nav-filter) — menu furniture over four blades is pure chrome
- [Brand kit resource](/docs/platform/deferred/brand-kit-resource) — no cross-editor theming seam exists to consume it
- [Create wizard tabs](/docs/platform/deferred/create-wizard-tabs) — a wizard over name-only forms is ceremony
- [Cross-resource activity feed](/docs/platform/deferred/cross-resource-activity-feed) — needs a second user-keyed table for a feed of your own actions
- [Dangling dataset references](/docs/platform/deferred/dangling-dataset-references) — delete-time consumer rewrites need real machinery; re-resolve fails soft today
- [Dashboard kiosk mode](/docs/platform/deferred/dashboard-kiosk-mode) — auto-refresh of baked snapshots refreshes nothing; needs live reads first
- [Dataset joins](/docs/platform/deferred/dataset-joins) — a query language's first feature; design only after tracked participants create real demand
- [Dataset row-cap pagination](/docs/platform/deferred/dataset-row-cap-pagination) — no consumer has hit the 1000-row cap
- [Draft version history](/docs/platform/deferred/draft-version-history) — session undo + publish snapshots cover recovery today
- [Resource collaboration](/docs/platform/deferred/document-collaboration) — ACLs + concurrent editing are each their own project; publishing covers read-sharing
- [Email sending](/docs/platform/deferred/email-sending) — needs a delivery service, domain, and compliance subsystem
- [Esbabbler link unfurl](/docs/platform/deferred/esbabbler-link-unfurl) — OG meta tags unfurl for free; embeds touch the message pipeline
- [Create gallery search + categories](/docs/platform/deferred/gallery-marketplace-search) — seven tiles fit on one screen
- [Global calendar](/docs/platform/deferred/global-calendar) — cross-resource content query for one flow; the Calendar blade covers it
- [Public discover feed](/docs/platform/deferred/public-discover-feed) — a browse surface before shared content circulates is a feed of nothing
- [Publish scheduling](/docs/platform/deferred/publish-scheduling) — one-click publish needs no timer until publishes have audiences
- [Realtime dataset refresh](/docs/platform/deferred/realtime-dataset-refresh) — fetch-on-load + manual refresh covers review workflows
- [Comments on published resources](/docs/platform/deferred/resource-comments) — needs identity + moderation; esbabbler is the discussion system
- [Resource groups](/docs/platform/deferred/resource-groups) — type facets + search suffice; a group column would be speculative schema
- [Resource references](/docs/platform/deferred/resource-references) — a maintained lineage index is a second source of truth; design with dangling-references
- [Resource locks](/docs/platform/deferred/resource-locks) — delete guard + recycle bin cover the single-owner threat model
- [Saved views](/docs/platform/deferred/saved-views) — URL-synced state already makes any view a bookmark
- [Survey response push](/docs/platform/deferred/survey-response-push) — anonymous writes need digest-first design or they're a harassment vector
- [Unauthenticated local resources](/docs/platform/deferred/unauth-local-resources) — a second persistence path doubles every save/load
