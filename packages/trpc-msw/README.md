# trpc-msw

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

tRPC for [Mock Service Worker](https://mswjs.io). Register a resolver per procedure, typed off your router, and every call your client makes is answered at the network by tRPC's own handlers — so batching, your transformer, your error formatter, `FormData` input and subscriptions over server-sent events or WebSockets all behave exactly as they do against the real server.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i -D trpc-msw msw @trpc/server
```

```ts
import type { AppRouter } from "./server/router";

import { initTRPC } from "@trpc/server";
import { setupServer } from "msw/node";
import superjson from "superjson";
import { createTRPCMsw } from "trpc-msw";

const { handlers, reset, trpc } = createTRPCMsw<AppRouter>({
  endpoint: "http://localhost:3000/api/trpc",
  // The same options your server's initTRPC.create takes, so mocked answers are shaped like real ones
  t: initTRPC.create({ transformer: superjson }),
  webSocketUrl: "ws://localhost:3000/api/trpc",
});
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => reset());
afterAll(() => server.close());

test("reads a post", async () => {
  trpc.post.byId.query(({ input }) => ({ id: input.id, title: "" }));
  trpc.post.onAdd.subscription(async function* () {
    yield { id: "", title: "" };
  });
  // ...drive your client
});
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/trpc-msw.html) to level up. How it works and every upstream `msw-trpc` issue it answers are on the [trpc-msw docs page](https://esposter.com/docs/trpc-msw).

### Key exports

| Export                     | Description                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `createTRPCMsw`            | The factory — returns the msw `handlers`, the typed `trpc` registration proxy and `reset`                                       |
| `TRPCMswOptions`           | `t`, `endpoint`, and optionally `webSocketUrl`, `createContext`, `allowMethodOverride` and `onUnhandledProcedure`               |
| `UnhandledProcedureAction` | `Error` (default) answers an unregistered procedure with tRPC's `NOT_FOUND`; `Bypass` passes the request on to the next handler |

A resolver receives what a real one does — `ctx`, `input`, `path`, `signal` — and returns the procedure's output before the transformer, which runs on the way out as it does on the server. A thrown `TRPCError` reaches the client through your error formatter.

### Commands

Run from `packages/trpc-msw/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/trpc-msw/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/trpc-msw/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/trpc-msw/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/trpc-msw.svg
