---
title: Architecture
description: Cross-cutting standards and system explanations shared by every Esposter area.
---

# Architecture

These pages explain the durable, cross-cutting mechanisms that span multiple packages or feature areas — the repo-wide answer to "whenever we need X, we do it this way". Area-specific features live under their own sections (for example [/docs/platform](/docs/platform) or [/docs/esbabbler](/docs/esbabbler)).

| Page                                                                                      | What it covers                                                                           |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [Platform](/docs/architecture/platform)                                                   | The cross-product layer model — identity, resources, datasets, publishing, events        |
| [Resources](/docs/architecture/resources)                                                 | The standard for product persistence and surface — resource model, capabilities, factory |
| [Datasets](/docs/architecture/datasets)                                                   | The standard for serving tabular data — contract, DatasetProvider capability, row cap    |
| [Publishing](/docs/architecture/publishing)                                               | The Publishable capability — versioned publish copy + rate-limited public read           |
| [Auth](/docs/architecture/auth)                                                           | better-auth OAuth setup, session middleware, and the authed procedure chain              |
| [Azure services](/docs/architecture/azure-services)                                       | Azure service ownership, the storage split, event flows, and the real-time layer model   |
| [Environment](/docs/architecture/environment)                                             | Environment detection across the three Nuxt runtime contexts                             |
| [File uploads](/docs/architecture/file-uploads)                                           | The two-step Azure Blob SAS upload pattern and upload procedure inventory                |
| [Serialization](/docs/architecture/serialization)                                         | How class instances survive the three transport paths (Azure Table, Nuxt payload, tRPC)  |
| [Persisted data — latest shape only](/docs/architecture/persisted-data-latest-shape-only) | No legacy-shape schemas or migration code — parse the latest shape or reset              |
| [Monorepo tooling](/docs/architecture/monorepo-tooling)                                   | pnpm workspace orchestration, virrun routing, publishing, installs, and CI job shape     |
| [Server testing](/docs/architecture/server-testing)                                       | tRPC router test wiring — in-memory DB, mocked Azure services, controlled auth session   |
