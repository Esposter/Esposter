---
title: trpc-nuxt-module
description: Proposal — absorb trpc-nuxt into a package of our own at parity or better, carrying the app's hand-rolled WebSocket bridge, the SSR transport and the #215 body fix, and retiring every workaround it forced on the app.
model: claude-opus-5-5
---

# trpc-nuxt-module

`trpc-nuxt` is an adapter: every dependency it has is already in the catalog, and its own code joins tRPC to Nuxt's fetch, request and composable primitives. It is the second absorption after [trpc-msw](/docs/trpc-msw), run through the flow in [dependency admission](/docs/architecture/dependency-admission) — survey, gate, upstream audit, build behind the call site, swap, residue sweep, verify — into a new publishable package, `trpc-nuxt-module`.

## What it costs today

- **A test-only branch in production code.** `app/plugins/trpc.ts` switches link factories and turns batching off under `IS_TEST`, because the package's links route through Nuxt's `$fetch`, which resolves internally and never reaches an interceptor.
- **A type shim.** `server/models/trpc/H3EventInput.ts` exists because the package inlines its own copy of h3's `H3Event`, which misses Nitro's augmentations (upstream #260).
- **A stale build entry.** `"trpc-nuxt"` in `configuration/build.ts`'s `transpile` (upstream #240).
- **A misattributed security gap.** `configuration/security.ts` turns `xssValidator` off with an `@TODO` citing upstream #215, and `architecture/security-posture.md` blames tRPC's batch format.
- **The half it never shipped.** The WebSocket side is hand-rolled in the app — `server/routes/ws.ts`, `server/models/ws/WsAdapter.ts`, `server/models/ws/WssAdapter.ts` and the `crossws` augmentation in `shared/types/crossws.d.ts` — with casts to the `ws` types tRPC's handler expects.
- **Surface nobody calls.** The client's `useQuery` / `useLazyQuery` / `useMutation` / `useSubscription` decorations have no call site; the app's own `useQuery` and `useMutation` own every read and write ([client data](/docs/architecture/client-data)).

## What was established

- **The SSR transport is `event.fetch`.** Nitro sets it to `fetchWithEvent(event, …, { fetch: localFetch })`: a real `Response`, the request's headers forwarded, in-process. That is everything `$fetch` plus `useRequestHeaders` did, with no `json()` shim and no response-header loss (upstream #72). In the browser the links use the global `fetch` against an absolute url, which is also what msw intercepts, so the `IS_TEST` branch goes and batching runs under test.
- **#215 is two problems.** The hang is the handler's: a middleware that calls `readBody` drains the stream the handler then builds its `Request` from, and a handler that builds it from `readRawBody(event, false)` — cached under h3's raw-body symbol — never depends on who read first. That part is in scope and owes a regression test. The filter is nuxt-security's: measured against its own `FilterXSS`, the default options reject `i <3 you`, `a < b`, a password containing `<` and every tiptap mention, and with `escapeHtml` off they pass `<script>`. `xssValidator` stays off, for that measured reason, pinned by a test, and the posture page says so.
- **The WebSocket bridge is the module's.** It is the same shape trpc-msw uses — a client presented as the `ws.WebSocket` tRPC's `applyWSSHandler` drives, and a server presenting `clients` and `connection` — over a `crossws` peer instead of an msw connection.

## Scope

**Server** — a `createTRPCEventHandler` over `fetchRequestHandler`, typed on h3's own `H3Event`, building its `Request` from the cached raw body; and a `createTRPCWebSocketHandler` returning `crossws` hooks over `applyWSSHandler`, with `onOpen` / `onClose` for the app's connect and disconnect callers and a reconnect broadcast for shutdown.

**Client** — `createTRPCNuxtClient` at parity with the package's surface: the typed client, the `useQuery`, `useLazyQuery`, `useMutation` and `useSubscription` decorations, `getQueryKey` and `getMutationKey`, and `httpLink` / `httpBatchLink` whose `fetch` is `event.fetch` during SSR. Parity is measured against the package's current surface, never its deprecated shapes, and every upstream issue in scope is fixed with a test named for it.

**Swap** — `app/plugins/trpc.ts`, `server/api/trpc/[trpc].ts` and `server/routes/ws.ts` move onto the kit; the shim, the adapters, the `transpile` entry and the `@TODO` are deleted; `trpc-nuxt` leaves the catalog in the same commit.

**Types and speed** — the client's decoration types are walked over the whole app router, so they carry instantiation budgets asserted in the package's own suite; the event handler is the request hot path and carries a bench against the handler it replaces (the `bench` skill).

## Upstream

The tracker is read whole before code is written, and the verdicts go on the module's docs page. What the survey already found, as the starting point rather than the triage:

- **Fixed by the absorption:** #215 (the hang), #260 (h3 types), #240 (transpile), #72 (response headers), #253 (reactive `enabled`), #233 (`undefined` over `null`), #255 (typed returns), #191 (`AbortSignal` on subscriptions), #106 (transform-aware keys), #224 (a rejecting `mutate`), #221 (route transformation).
- **Out of scope:** #215's filter semantics (nuxt-security), #189 and #183 (tRPC's own fetch and load behaviour).
- **Likely false positives:** the import-specifier and build reports (#250, #247, #181, #137, #133) that a normal package build does not reproduce, and the usage questions.

## Key files

| File                                          | What changes                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| `apps/web/app/plugins/trpc.ts`                | the module's client and links; the `IS_TEST` branch goes                   |
| `apps/web/server/api/trpc/[trpc].ts`          | the module's event handler                                                 |
| `apps/web/server/routes/ws.ts`                | the module's WebSocket handler, keeping the connect and disconnect callers |
| `apps/web/server/models/ws/WsAdapter.ts`      | deleted, carried into the module                                           |
| `apps/web/server/models/ws/WssAdapter.ts`     | deleted, carried into the module                                           |
| `apps/web/server/models/trpc/H3EventInput.ts` | deleted                                                                    |
| `apps/web/configuration/build.ts`             | loses the `transpile` entry                                                |
| `apps/web/configuration/security.ts`          | loses the `@TODO`; the reason moves to the posture page                    |

## Sources

- [wobsoriano/trpc-nuxt](https://github.com/wobsoriano/trpc-nuxt) — the package absorbed, and its tracker.
- [trpc-nuxt #215](https://github.com/wobsoriano/trpc-nuxt/issues/215) — the middleware-body thread, including the owner's reading of it.
- [Fetch adapter](https://trpc.io/docs/server/adapters/fetch) and [WebSockets](https://trpc.io/docs/server/websockets) (tRPC) — the two handlers the module wraps.
- [useRequestEvent](https://nuxt.com/docs/api/composables/use-request-event) (Nuxt) — the event whose `fetch` is the SSR transport.
- [nuxt-security XSS validator](https://nuxt-security.vercel.app/middleware/xss-validator) — the filter whose semantics keep it off.
