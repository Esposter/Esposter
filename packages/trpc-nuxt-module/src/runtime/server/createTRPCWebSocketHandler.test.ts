import type { TRPCWebSocketConnection } from "#src/runtime/server/models/TRPCWebSocketConnection";
import type { AddressInfo } from "node:net";

import { createTRPCWebSocketHandler } from "#src/runtime/server/createTRPCWebSocketHandler";
import { getSynchronizedFunction, waitForSynchronizedFunctions } from "@esposter/shared";
import { createTRPCClient, createWSClient, wsLink } from "@trpc/client";
import { initTRPC } from "@trpc/server";
import crossws from "crossws/adapters/node";
import { createServer } from "node:http";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(createTRPCWebSocketHandler, () => {
  const t = initTRPC.context<{ url?: string }>().create();
  const router = t.router({
    // oxlint-disable-next-line require-await -- A subscription is an AsyncIterable, which only an async generator yields
    count: t.procedure.subscription(async function* () {
      yield 0;
    }),
  });
  let openedConnection = Promise.withResolvers<TRPCWebSocketConnection<{ url?: string }>>();
  let closedConnection = Promise.withResolvers<TRPCWebSocketConnection<{ url?: string }>>();
  const { hooks } = createTRPCWebSocketHandler({
    createContext: ({ req }) => ({ url: req.url }),
    onClose: (connection) => {
      closedConnection.resolve(connection);
    },
    onOpen: (connection) => {
      openedConnection.resolve(connection);
    },
    router,
  });
  const webSocketAdapter = crossws({ hooks });
  const server = createServer();
  server.on(
    "upgrade",
    getSynchronizedFunction(async (request, socket, head) => {
      await webSocketAdapter.handleUpgrade(request, socket, head);
    }),
  );
  let url = "";

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, resolve);
    });
    url = `ws://localhost:${(server.address() as AddressInfo).port}/`;
  });

  afterAll(async () => {
    server.close();
    await waitForSynchronizedFunctions();
  });

  test("#156 streams a subscription over a WebSocket and hands each end of the connection its context", async () => {
    expect.hasAssertions();

    openedConnection = Promise.withResolvers();
    closedConnection = Promise.withResolvers();
    const data = Promise.withResolvers<number>();
    const webSocketClient = createWSClient({ url });
    const client = createTRPCClient<typeof router>({ links: [wsLink({ client: webSocketClient })] });
    client.count.subscribe(undefined, {
      onData: (value) => {
        data.resolve(value);
      },
    });

    await expect(data.promise).resolves.toBe(0);
    expect((await openedConnection.promise).context).toStrictEqual({ url: "/" });

    await webSocketClient.close();

    expect((await closedConnection.promise).context).toStrictEqual({ url: "/" });
  });
});
