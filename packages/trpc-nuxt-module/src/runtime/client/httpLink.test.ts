import type { H3Event } from "h3";
import type { useRequestEvent as baseUseRequestEvent } from "nuxt/app";

import { httpLink } from "#src/runtime/client/httpLink";
import { createTRPCClient } from "@trpc/client";
import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createEvent } from "h3";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { describe, expect, test, vi } from "vitest";

const { useRequestEvent } = vi.hoisted(() => ({ useRequestEvent: vi.fn<typeof baseUseRequestEvent>() }));
vi.mock(import("nuxt/app"), () => ({ useRequestEvent }));

describe(httpLink, () => {
  const t = initTRPC.create();
  const router = t.router({ read: t.procedure.query(() => 0) });
  const endpoint = "/";

  test("#175 sends through the request event during server rendering", async () => {
    expect.hasAssertions();

    const fetch = vi.fn<H3Event["fetch"]>((request, init) =>
      fetchRequestHandler({
        endpoint,
        req: request instanceof Request ? request : new Request(new URL(request, "http://localhost"), init),
        router,
      }),
    );
    const request = new IncomingMessage(new Socket());
    const event = createEvent(request, new ServerResponse(request));
    event.fetch = fetch;
    useRequestEvent.mockReturnValueOnce(event);
    const client = createTRPCClient<typeof router>({ links: [httpLink({ url: endpoint })] });

    await expect(client.read.query()).resolves.toBe(0);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
