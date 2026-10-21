import type { TrpcServerFetch } from "#src/models/TrpcServerFetch";
import type { useRequestEvent as baseUseRequestEvent } from "nuxt/app";

import { httpLink } from "#src/runtime/client/httpLink";
import { createTRPCClient } from "@trpc/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { H3, H3Event } from "nitro/h3";
import { describe, expect, test, vi } from "vitest";

const { useRequestEvent, useTrpcServerFetch } = vi.hoisted(() => ({
  useRequestEvent: vi.fn<typeof baseUseRequestEvent>(),
  useTrpcServerFetch: vi.fn<() => TrpcServerFetch>(),
}));
vi.mock(import("nuxt/app"), () => ({ useRequestEvent }));
vi.mock(import("#src/runtime/client/services/useTrpcServerFetch"), () => ({ useTrpcServerFetch }));

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

  test("#143 rejects with the message a procedure threw", async () => {
    expect.hasAssertions();

    const failingRouter = t.router({
      fail: t.procedure.query(() => {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Rejected" });
      }),
    });
    const app = new H3().all("/**", (event) =>
      fetchRequestHandler({ endpoint, req: event.req, router: failingRouter }),
    );
    useRequestEvent.mockReturnValueOnce(new H3Event(new Request("http://localhost/"), undefined, app));
    const client = createTRPCClient<typeof failingRouter>({ links: [httpLink({ url: endpoint })] });

    await expect(client.fail.query()).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCClientError: Rejected]`);
  });

  test("sends through the Nitro app in-process, cookies included, when the request event has no app", async () => {
    expect.hasAssertions();

    const trpcServerFetch = vi.fn<TrpcServerFetch>().mockResolvedValueOnce(Response.json({ result: { data: 0 } }));
    useTrpcServerFetch.mockReturnValueOnce(trpcServerFetch);
    useRequestEvent.mockReturnValueOnce(
      new H3Event(new Request("http://localhost/", { headers: { cookie: "session=1" } })),
    );
    const client = createTRPCClient<typeof router>({ links: [httpLink({ url: endpoint })] });

    await expect(client.read.query()).resolves.toBe(0);
    const [resource, init] = trpcServerFetch.mock.calls[0] ?? [];
    expect(resource).toStrictEqual(new URL("http://localhost/read"));
    expect(new Headers(init?.headers).get("cookie")).toBe("session=1");
  });
});
