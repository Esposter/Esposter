---
title: Esposter Docs
description: What Esposter is and how this documentation is organized.
---

# Esposter Docs

Esposter is a social platform monorepo — a nice and casual place for posting random things. It spans a Discord-like messaging product (esbabbler), an Azure-portal-like Resource Explorer over documents, dashboards, surveys, emails and more (platform), games, and the supporting packages and infrastructure.

## How these docs are organized

- **[Architecture](/docs/architecture)** — cross-cutting, as-built system explanations: the resource model, datasets, publishing, Azure services, serialization, tooling. Standards live here; product pages only apply them.
- **Product areas** — [posts](/docs/posts), [users](/docs/users), [esbabbler](/docs/esbabbler), [platform](/docs/platform), [sheet editor](/docs/sheet-editor), [clicker](/docs/clicker), [dungeons](/docs/dungeons), [fluid simulator](/docs/fluid-simulator), [anime](/docs/anime), [achievements](/docs/achievements), [virrun](/docs/virrun), [vue-phaserjs](/docs/vue-phaserjs), [infra](/docs/infra). Each area has an overview, one page per implemented feature, `deferred/` (not-yet ideas with revisit triggers) and `rejected/` (won't-do ideas) folders, and a `roadmap` of open work.
- **[Proposals](/docs/proposals)** — designs that are **not implemented yet**. Everything under a product area describes shipped behavior; everything under proposals is future work awaiting implementation.

## API reference

Generated TypeDoc API documentation for the monorepo packages lives at [/docs/api/](/docs/api/){target="_blank"}.
