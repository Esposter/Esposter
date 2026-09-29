# trpc-nuxt-module

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

tRPC for [Nuxt](https://nuxt.com). A Nuxt module that registers your router's HTTP handler — and, when you ask for it, a WebSocket handler over Nitro's own WebSockets — fetches through the request event during server rendering so a call never leaves the process, and decorates the typed client with `useQuery`, `useLazyQuery`, `useMutation` and `useSubscription`, each a composable over Nuxt's own `useAsyncData`.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i trpc-nuxt-module @trpc/server @trpc/client
```

Register the module with the file and export name of your router and your context factory:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["trpc-nuxt-module"],
  trpc: {
    createContext: { from: "~~/server/trpc/context", name: "createContext" },
    endpoint: "/api/trpc",
    router: { from: "~~/server/trpc/router", name: "appRouter" },
    // Optional: tRPC's WebSocket handler at this route, for subscriptions over `wsLink`
    webSocket: { endpoint: "/api/trpc/ws" },
  },
});
```

```ts
// server/trpc/router.ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({ greeting: t.procedure.input(z.string()).query(({ input }) => `Hello ${input}`) });

export type AppRouter = typeof appRouter;
```

Provide a client from a plugin — `createTRPCNuxtClient` and the links are auto-imported:

```ts
// app/plugins/trpc.ts
import type { AppRouter } from "~~/server/trpc/router";

export default defineNuxtPlugin(() => {
  const trpc = createTRPCNuxtClient<AppRouter>({ links: [httpBatchLink<AppRouter>({ url: "/api/trpc" })] });
  return { provide: { trpc } };
});
```

And call a procedure from a page:

```vue
<script setup lang="ts">
const { $trpc } = useNuxtApp();
const name = ref("world");
const { data } = await $trpc.greeting.useQuery(name);
</script>

<template>
  <p>{{ data }}</p>
</template>
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/trpc-nuxt-module.html) to level up. How it works, and every upstream `trpc-nuxt` issue it answers, are on the [trpc-nuxt-module docs page](https://esposter.com/docs/trpc-nuxt-module).

### Key exports

| Export                                                   | Description                                                                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `trpc-nuxt-module`                                       | The module — `router`, `createContext`, `endpoint` and `webSocket` options                                      |
| `createTRPCNuxtClient`                                   | The typed client, every procedure decorated with `useQuery`, `useLazyQuery`, `useMutation` or `useSubscription` |
| `httpLink`, `httpBatchLink`                              | tRPC's links, sending through the request event during server rendering                                         |
| `getQueryKey`, `getMutationKey`                          | The `useAsyncData` keys a procedure's data is cached under, for `useNuxtData` and `refreshNuxtData`             |
| `trpc-nuxt-module/runtime/server/createTRPCEventHandler` | The HTTP handler over tRPC's fetch adapter, for a Nitro app without Nuxt                                        |

A WebSocket connection's open and close call the `trpc-nuxt-module:webSocket:open` and `trpc-nuxt-module:webSocket:close` Nitro runtime hooks with its context, typed off your router.

### Commands

Run from `packages/trpc-nuxt-module/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm bench        # the event handler against tRPC's own fetch adapter
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/trpc-nuxt-module/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/trpc-nuxt-module/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/trpc-nuxt-module/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/trpc-nuxt-module.svg
