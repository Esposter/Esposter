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
| [Client data access](/docs/architecture/client-data)                                      | The useQuery + useMutation primitives — non-blocking fetch, optimistic apply, staleness  |
| [Async operations](/docs/architecture/async-operations)                                   | Concurrency by declaration — reads are latest-wins, writes queue, nothing drops silently |
| [Caching](/docs/architecture/caching)                                                     | One cached-read primitive, invalidated by tag when a write says what it changed          |
| [Persisted data — latest shape only](/docs/architecture/persisted-data-latest-shape-only) | No legacy-shape schemas or migration code — parse the latest shape or reset              |
| [Content token rewriting](/docs/architecture/content-token-rewriting)                     | Finding tokens in authored content — self-delimiting matches, one pass, converge on read |
| [Monorepo tooling](/docs/architecture/monorepo-tooling)                                   | pnpm workspace orchestration, virrun routing, publishing, installs, and CI job shape     |
| [Server testing](/docs/architecture/server-testing)                                       | tRPC router test wiring — in-memory DB, mocked Azure services, controlled auth session   |
| [Destructive confirmation](/docs/architecture/destructive-confirmation)                   | One shared delete dialog — StyledDeleteFormDialog + opt-in type-the-name guard           |
| [Singleton dialogs](/docs/architecture/singleton-dialogs)                                 | Store-driven singleton dialogs — one mounted dialog per feature, never one per list item |
| [Navigation](/docs/architecture/navigation)                                               | NuxtLink/navigateTo for every link — never a raw anchor — and instant docs routing       |
| [Persist then notify](/docs/architecture/persist-then-notify)                             | Guard, persist, notify — then best-effort bookkeeping that can never fail the caller     |
| [Conditional writes](/docs/architecture/conditional-writes)                               | A write derived from a read is conditional on that version, and a lost race re-applies   |
| [Blob lifecycle ownership](/docs/architecture/blob-lifecycle)                             | Every blob prefix's naming discipline and single teardown owner per lifecycle event      |
| [No polling](/docs/architecture/no-polling)                                               | Polling banned repo-wide — every wait is event-driven or awaits a completion handle      |
| [No manual recovery](/docs/architecture/no-manual-recovery)                               | Failed async work retries itself on an event, with an attempt cap and a quarantine       |
| [Null vs undefined](/docs/architecture/null-vs-undefined)                                 | One absent-value sentinel in app-owned code — null survives only in boundary shapes      |
| [Search](/docs/architecture/search)                                                       | One search stack — StyledSearchDialog palettes + useAutoSearch/useCursorSearcher         |
| [Rate limiting](/docs/architecture/rate-limiting)                                         | Postgres-backed budgets shared across instances, enforced in the authed middleware       |
| [Security posture](/docs/architecture/security-posture)                                   | The app's nuxt-security configuration — CSP, permissions policy, and what is off and why |
| [Responsive layout](/docs/architecture/responsive)                                        | One breakpoint scale feeding both Vuetify and UnoCSS                                     |

Cross-cutting standards we decided against are recorded in [rejected](/docs/architecture/rejected) — check it before proposing a new one. Ones we chose not to build yet, each with a revisit trigger, are in [deferred](/docs/architecture/deferred).
