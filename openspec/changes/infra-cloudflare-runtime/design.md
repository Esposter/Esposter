# Cloudflare runtime

Part of the [Cloudflare program](../infra-cloudflare-program/design.md). The app builds with Nitro's `cloudflare_module` preset and runs as one Worker, with its stateful half — tRPC, its WebSockets and every module-scope map — in Nitro's own Durable Object.

## How a request is served

```mermaid
flowchart TD
  REQ["request"] --> A{"public asset?"}
  A -->|"yes"| SA["Workers Static Assets, no Worker invocation"]
  A -->|"no"| U{"/ws upgrade or /api/trpc?"}
  U -->|"yes"| FWD["forward to env.$DurableObject, instance 'server'"]
  FWD --> DO["the object's fetch runs nitroApp.fetch:<br/>the tRPC handler, emitters and call maps"]
  U -->|"no"| SSR["the Worker runs nitroApp.fetch:<br/>SSR pages and stateless server routes"]
  SSR -->|"a page's tRPC query"| FWD
```

The preset already sends a WebSocket upgrade to the object when the `$DurableObject` binding is declared, and the object's `fetch` already runs the whole Nitro app for any other request it receives. What the app adds is the forward of `/api/trpc`: a Nitro middleware that, when the request is not already inside the object, returns `stub.fetch(request)`. Inside the object, `event.req.runtime.cloudflare.context` is the object's state, which is how the middleware tells the two apart.

A page rendered on the server calls tRPC through the module's server-side link. That link resolves procedures in the same isolate, so in the Worker it would read the Worker's own empty call maps; the server-side link is pointed at the object's stub instead, so a page and a client read the same state.

## The object stays awake

tRPC keeps each subscription as an async generator in memory, so the object cannot hibernate its sockets: crossws's hibernation hooks are unused, and the object is evicted only when its last socket closes. The program design prices that. When it is evicted, every in-memory map is lost exactly as a Railway restart loses it, and the clients' reconnect path is the one they already have.

## Node APIs

The preset turns on `nodejs_compat`. Every server import of a `node:` module is covered by it except two:

- `node:zlib`'s `zstdDecompress` on the resource read path. Workers' zlib does not document zstd, so the read path decompresses with a WebAssembly zstd decoder when the runtime lacks it, and the write path compresses the same way.
- `node:fs`, `node:os` and `node:path` in the Genshin scene exports, which a module registers only under `nuxt dev`. They stay dev-only.

`web-push` signs with `node:crypto` and sends with `node:https`; both are in `nodejs_compat`. The VAPID setup in the Nitro plugin moves to where a push is sent, since a Worker has no process start.

## The bundle

A Worker's code is capped at 64 MiB uncompressed. The server bundle carries libraries the server never runs — the charts, three.js, pdf.js and the call's track processors — because components that import them are rendered on the server. Each such component becomes a client-only component (`.client.vue` or a lazy `defineAsyncComponent` behind `<ClientOnly>`), so its library leaves the server bundle. Source maps are not uploaded. CI records the server bundle's uncompressed size after the app build and fails past the cap, the one budget the [bundle budgets](../../deferred/architecture/bundle-budgets/design.md) idea did not need a policy for.

## Startup work

A Worker has no process start, so the Nitro plugins that ran once at boot run on first use: environment validation runs on the first request of an isolate, and `getCommitCount`'s cached promise is per isolate, which is the same contract as per process.

## Environment

Each Worker declares every variable it reads in its schema, and [the environment spec](../../specs/architecture/environment/design.md) holds that model. Bindings are not variables: D1, R2, Queues and the Durable Objects come from `cloudflare:workers`'s `env`.

- **Vars** are the values an environment's name fixes, written into wrangler: the web Worker's come from `configuration/wrangler.ts` (`APP_ENV`, `BASE_URL`, `BETTER_AUTH_URL`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ENVIRONMENT`, `PUBLIC_ASSETS_BASE_URL`), the functions Worker's are in its `wrangler.jsonc`.
- **Secrets** are the schema keys marked `.meta({ secret: true })`. Each Worker's list is in `.github/worker-secrets.json`, and the deploy job puts them with `wrangler secret bulk` after the Worker deploys. Each value is read from Pulumi ESC `esposter-infra/prod` as `pulumiConfig.esposter-infra:<environment>_<NAME>`, so `dev_` and `prod_` values sit side by side in one environment.
- **Build-time values.** The web build bakes its public config into its runtime config, so `FACEBOOK_CLIENT_ID` and `VAPID_PUBLIC_KEY` are read from ESC before the build, and the origins come from the workflow's environment for each branch.
- **Local development.** `predev` writes `.wrangler/local/wrangler.jsonc` from the same function and applies the `core` migrations to local D1. Nitro's Miniflare takes its bindings from `configuration/nitro.ts`, and `.env` supplies the variables, as `.env.example` lists them.

## Key files

| File                                                                         | Role after the change                                                   |
| :--------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `apps/web/configuration/nitro.ts`                                            | the `cloudflare_module` preset, its `$DurableObject` binding, no brotli |
| `apps/web/configuration/modules.ts`                                          | the tRPC module's WebSocket endpoint, unchanged path                    |
| `packages/trpc-nuxt-module/src/runtime/server/createTRPCWebSocketHandler.ts` | the WebSocket handler, run inside the object                            |
| `apps/web/server/plugins/webpush.ts`                                         | removed; VAPID details set where a push is sent                         |
| `apps/web/server/plugins/environment.ts`                                     | environment validated per isolate                                       |
| `apps/web/server/services/resource/readResourceContentDelta.ts`              | zstd decoded without `node:zlib`                                        |
| `apps/web/server/services/resource/readStagedResourceContent.ts`             | gunzip through `DecompressionStream`                                    |
| `apps/web/package.json`                                                      | `wrangler` as a dev dependency; `start` is `wrangler dev`               |
