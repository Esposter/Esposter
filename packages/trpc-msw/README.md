# trpc-msw

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

This package connects tRPC to [Mock Service Worker](https://mswjs.io), and tRPC's own handlers answer every client call at the network level. You register a resolver for each procedure, typed from your router.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/trpc-msw).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

1. Install the packages.

```bash
pnpm i -D trpc-msw msw @trpc/server
```

2. Create a test file from this code. The client receives each answer from its resolver.

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

Batching, your transformer, your error formatter, `FormData` input and subscriptions over server-sent events or WebSockets behave exactly as they do against the real server.

## <a name="key-exports">🧩 Key Exports</a>

| Export                     | Description                                                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createTRPCMsw`            | The factory. It returns the msw `handlers`, the typed `trpc` registration proxy and `reset`.                                                             |
| `TRPCMswOptions`           | The options object. Required: `t` and `endpoint`. Optional: `allowMethodOverride`, `createContext`, `onUnhandledProcedure`, `router` and `webSocketUrl`. |
| `UnhandledProcedureAction` | `Error` (default) answers an unregistered procedure with tRPC's `NOT_FOUND`. `Bypass` passes the request to the next handler.                            |

Pass your real `router` to check each call against its procedure's input parsers before the resolver runs.

- The parsers are Standard Schema validators or plain functions.
- A call with input that your server would reject gets the same `BAD_REQUEST`, not a mocked answer.
- The resolver receives the values that the parsers return, as it does on the server.
- A resolver receives `ctx`, `input`, `path` and `signal`, as a real resolver does.
- A resolver returns the procedure's output before the transformer. The transformer runs on the way out, as it does on the server.
- A thrown `TRPCError` reaches the client through your error formatter.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/trpc-msw/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/trpc-msw/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/trpc-msw/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/trpc-msw.svg
