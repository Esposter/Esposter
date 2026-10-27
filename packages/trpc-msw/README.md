# trpc-msw

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

tRPC for [Mock Service Worker](https://mswjs.io): register a resolver per procedure, typed off your router, and every call your client makes is answered at the network by tRPC's own handlers.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/trpc-msw).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
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

The result is that batching, your transformer, your error formatter, `FormData` input and subscriptions over server-sent events or WebSockets all behave exactly as they do against the real server.

## <a name="key-exports">🧩 Key Exports</a>

| Export                     | Description                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `createTRPCMsw`            | The factory — returns the msw `handlers`, the typed `trpc` registration proxy and `reset`                                       |
| `TRPCMswOptions`           | `t`, `endpoint`, and optionally `allowMethodOverride`, `createContext`, `onUnhandledProcedure`, `router` and `webSocketUrl`     |
| `UnhandledProcedureAction` | `Error` (default) answers an unregistered procedure with tRPC's `NOT_FOUND`; `Bypass` passes the request on to the next handler |

Pass your real `router` and every call is first judged by that procedure's own input parsers (Standard Schema validators, or plain functions), so a client sending what your server would reject gets the same `BAD_REQUEST` instead of a mocked answer; the resolver receives what those parsers return, as it does on the server. A resolver receives what a real one does — `ctx`, `input`, `path`, `signal` — and returns the procedure's output before the transformer, which runs on the way out as it does on the server. A thrown `TRPCError` reaches the client through your error formatter.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=0b6ac0
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/trpc-msw/latest?color=1b7a5f
[url-npm]: https://www.npmjs.com/package/trpc-msw/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/trpc-msw/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/trpc-msw.svg
