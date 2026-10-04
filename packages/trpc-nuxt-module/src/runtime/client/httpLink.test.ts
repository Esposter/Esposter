import type { useRequestEvent as baseUseRequestEvent } from "nuxt/app";

import { httpLink } from "#src/runtime/client/httpLink";
import { createTRPCClient } from "@trpc/client";
import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { H3, H3Event } from "nitro/h3";
import { describe, expect, test, vi } from "vitest";

const { useRequestEvent } = vi.hoisted(() => ({ useRequestEvent: vi.fn<typeof baseUseRequestEvent>() }));
vi.mock(import("nuxt/app"), () => ({ useRequestEvent }));

describe(httpLink, () => {
  const t = initTRPC.create();
  const router = t.router({ read: t.procedure.query(() => 0) });
  const endpoint = "/";

  test("#175 sends through the request event during server rendering", async () => {
    expect.hasAssertions();

    const handler = vi.fn<(event: H3Event) => Promise<Response>>((event) =>
      fetchRequestHandler({ endpoint, req: event.req, router }),
    );
    const app = new H3().all("/**", handler);
    useRequestEvent.mockReturnValueOnce(new H3Event(new Request("http://localhost/"), undefined, app));
    const client = createTRPCClient<typeof router>({ links: [httpLink({ url: endpoint })] });

    await expect(client.read.query()).resolves.toBe(0);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
