---
title: Decisions
description: Rejected and deferred platform ideas — one page per idea, with rationale and revisit triggers.
---

# Platform decisions

One page per rejected or deferred idea. Check here before adding a roadmap item or proposal — never re-argue a decided idea.

## Deferred (not now — with revisit triggers)

- [API / SQL dataset providers](/docs/platform/decisions/api-sql-dataset-providers) — external data sources need secret storage + SSRF/injection work with no consumer yet
- [Azure AI Search](/docs/platform/decisions/azure-ai-search) — the only paid parity item; `ilike` → `pg_trgm` covers current volumes
- [Blade nav filter + groups](/docs/platform/decisions/blade-nav-filter) — menu furniture over four blades is pure chrome
- [Create wizard tabs](/docs/platform/decisions/create-wizard-tabs) — a wizard over name-only forms is ceremony
- [Dangling dataset references](/docs/platform/decisions/dangling-dataset-references) — delete-time consumer rewrites need real machinery; re-resolve fails soft today
- [Dataset row-cap pagination](/docs/platform/decisions/dataset-row-cap-pagination) — no consumer has hit the 10k cap
- [Resource collaboration](/docs/platform/decisions/document-collaboration) — ACLs + concurrent editing are each their own project; publishing covers read-sharing
- [Email sending](/docs/platform/decisions/email-sending) — needs a delivery service, domain, and compliance subsystem
- [Esbabbler link unfurl](/docs/platform/decisions/esbabbler-link-unfurl) — OG meta tags unfurl for free; embeds touch the message pipeline
- [Create gallery search + categories](/docs/platform/decisions/gallery-marketplace-search) — seven tiles fit on one screen
- [Global calendar](/docs/platform/decisions/global-calendar) — cross-resource content query for one flow; the Calendar blade covers it
- [Realtime dataset refresh](/docs/platform/decisions/realtime-dataset-refresh) — fetch-on-load + manual refresh covers review workflows
- [Resource groups](/docs/platform/decisions/resource-groups) — type facets + search suffice; a group column would be speculative schema
- [Resource locks](/docs/platform/decisions/resource-locks) — delete guard + recycle bin cover the single-owner threat model
- [Saved views](/docs/platform/decisions/saved-views) — URL-synced state already makes any view a bookmark
- [Unauthenticated local resources](/docs/platform/decisions/unauth-local-resources) — a second persistence path doubles every save/load

## Rejected (won't do)

- [Games integration](/docs/platform/decisions/games-integration) — a game save is one blob; achievements are the right touchpoint
- [Generic event bus](/docs/platform/decisions/generic-event-bus) — the tRPC mutation path already is the event taxonomy
- [JSON/config parity](/docs/platform/decisions/json-config-parity) — our resources aren't declarative config
- [Pin to dashboard](/docs/platform/decisions/pin-to-dashboard) — Dashboard is a data product, not a portal homepage
- [Portal chrome extras](/docs/platform/decisions/portal-chrome-extras) — cosmetic fidelity to needs we don't have
- [VuetifyComponent resource type](/docs/platform/decisions/vuetify-component-resource) — a demo, not a user artifact
