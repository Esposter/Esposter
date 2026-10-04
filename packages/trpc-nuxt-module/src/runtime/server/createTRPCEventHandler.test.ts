import type { H3Event } from "nitro/h3";
import type { AddressInfo } from "node:net";

import { DEFAULT_ENDPOINT } from "#src/runtime/constants";
import { createTRPCEventHandler } from "#src/runtime/server/createTRPCEventHandler";
import { createTRPCClient, httpBatchLink, httpLink } from "@trpc/client";
import { initTRPC } from "@trpc/server";
import { H3, toNodeHandler } from "nitro/h3";
import { createServer } from "node:http";
import superjson from "superjson";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { z } from "zod";

describe(createTRPCEventHandler, () => {
  const t = initTRPC.context<{ event: H3Event }>().create({ transformer: superjson });
  const baseUrl = "/a";
  let startedWait = Promise.withResolvers<void>();
  let abortedWait = Promise.withResolvers<void>();
  const router = t.router({
    read: t.procedure.input(z.date()).query(({ input }) => input),
    redirect: t.procedure.mutation(({ ctx: { event } }) => {
      event.res.status = 302;
      event.res.headers.set("location", baseUrl);
    }),
    wait: t.procedure.query(
      ({ signal }) =>
        new Promise<void>((resolve) => {
          signal?.addEventListener("abort", () => {
            abortedWait.resolve();
            resolve();
          });
          startedWait.resolve();
        }),
    ),
    write: t.procedure.input(z.string()).mutation(({ input }) => input),
  });
  const createContext = (event: H3Event) => ({ event });
  // A sub-app keeps the whole path, as Nitro does under an app base url, so the endpoint there carries the base
  const app = new H3()
    .all(`${DEFAULT_ENDPOINT}/**`, createTRPCEventHandler({ createContext, router }))
    .mount(
      baseUrl,
      new H3().all(
        `${DEFAULT_ENDPOINT}/**`,
        createTRPCEventHandler({ createContext, endpoint: `${baseUrl}${DEFAULT_ENDPOINT}`, router }),
      ),
    );
  const server = createServer(toNodeHandler(app));
  let origin = "";

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, resolve);
    });
    origin = `http://localhost:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => {
    server.close();
  });

  test("answers a batch through the transformer in both directions", async () => {
    expect.hasAssertions();

    const client = createTRPCClient<typeof router>({
      links: [httpBatchLink({ transformer: superjson, url: `${origin}${DEFAULT_ENDPOINT}` })],
    });

    await expect(Promise.all([client.read.query(new Date(0)), client.write.mutate("")])).resolves.toStrictEqual([
      new Date(0),
      "",
    ]);
  });

  test("#221 answers under an app base url", async () => {
    expect.hasAssertions();

    const client = createTRPCClient<typeof router>({
      links: [httpLink({ transformer: superjson, url: `${origin}${baseUrl}${DEFAULT_ENDPOINT}` })],
    });

    await expect(client.write.mutate("")).resolves.toBe("");
  });

  test("#191 aborts a procedure's signal when the client goes away", async () => {
    expect.hasAssertions();

    startedWait = Promise.withResolvers<void>();
    abortedWait = Promise.withResolvers<void>();
    const abortController = new AbortController();
    const client = createTRPCClient<typeof router>({
      links: [httpLink({ transformer: superjson, url: `${origin}${DEFAULT_ENDPOINT}` })],
    });
    const request = client.wait.query(undefined, { signal: abortController.signal });
    await startedWait.promise;
    abortController.abort();

    await expect(request).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCClientError: This operation was aborted]`);
    await expect(abortedWait.promise).resolves.toBeUndefined();
  });

  test("#227 answers with the status a procedure staged on the event", async () => {
    expect.hasAssertions();

    const response = await fetch(`${origin}${DEFAULT_ENDPOINT}/redirect`, {
      headers: { "content-type": "application/json" },
      method: "POST",
      redirect: "manual",
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(baseUrl);
  });
});
