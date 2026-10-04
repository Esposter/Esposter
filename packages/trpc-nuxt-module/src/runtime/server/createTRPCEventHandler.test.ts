import type { H3Event } from "nitro/h3";

import { DEFAULT_ENDPOINT } from "#src/runtime/constants";
import { createTRPCEventHandler } from "#src/runtime/server/createTRPCEventHandler";
import { createTRPCClient, httpBatchLink, httpLink } from "@trpc/client";
import { initTRPC } from "@trpc/server";
import { H3 } from "nitro/h3";
import superjson from "superjson";
import { describe, expect, test } from "vitest";
import { z } from "zod";

const createContext = (event: H3Event) => ({ event });

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
    unmodified: t.procedure.query(({ ctx: { event } }) => {
      event.res.status = 304;
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
  // The app answers in-process, so a client's abort reaches the handler as the request's own signal
  const fetchInProcess = (input: Request | string | URL, init?: RequestInit) =>
    Promise.resolve(app.request(input, init));

  test("answers a batch through the transformer in both directions", async () => {
    expect.hasAssertions();

    const client = createTRPCClient<typeof router>({
      links: [httpBatchLink({ fetch: fetchInProcess, transformer: superjson, url: DEFAULT_ENDPOINT })],
    });

    await expect(Promise.all([client.read.query(new Date(0)), client.write.mutate("")])).resolves.toStrictEqual([
      new Date(0),
      "",
    ]);
  });

  test("#221 answers under an app base url", async () => {
    expect.hasAssertions();

    const client = createTRPCClient<typeof router>({
      links: [httpLink({ fetch: fetchInProcess, transformer: superjson, url: `${baseUrl}${DEFAULT_ENDPOINT}` })],
    });

    await expect(client.write.mutate("")).resolves.toBe("");
  });

  test("#191 aborts a procedure's signal when the client goes away", async () => {
    expect.hasAssertions();

    startedWait = Promise.withResolvers<void>();
    abortedWait = Promise.withResolvers<void>();
    const abortController = new AbortController();
    const client = createTRPCClient<typeof router>({
      links: [httpLink({ fetch: fetchInProcess, transformer: superjson, url: DEFAULT_ENDPOINT })],
    });
    const request = client.wait.query(undefined, { signal: abortController.signal });
    await startedWait.promise;
    abortController.abort();

    await expect(abortedWait.promise).resolves.toBeUndefined();
    // In-process there is no socket to drop, so the client reads the answer the procedure gave once it stopped
    await expect(request).resolves.toBeUndefined();
  });

  test("#227 answers with the status a procedure staged on the event", async () => {
    expect.hasAssertions();

    const response = await app.request(`${DEFAULT_ENDPOINT}/redirect`, {
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(baseUrl);
  });

  test("answers a staged status that forbids a body without one", async () => {
    expect.hasAssertions();

    const response = await fetch(`${origin}${DEFAULT_ENDPOINT}/unmodified`);

    expect(response.status).toBe(304);
    await expect(response.text()).resolves.toBe("");
  });
});
