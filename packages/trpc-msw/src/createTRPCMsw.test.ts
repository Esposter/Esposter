import { createTRPCMsw } from "#src/createTRPCMsw";
import { UnhandledProcedureAction } from "#src/models/UnhandledProcedureAction";
import { takeOne } from "@esposter/shared";
import { createTRPCClient, createWSClient, httpBatchLink, httpLink, splitLink, wsLink } from "@trpc/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import superjson from "superjson";
import { afterAll, afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";
import { z } from "zod";

describe(createTRPCMsw, () => {
  const endpoint = "http://localhost/trpc";
  const webSocketUrl = "ws://localhost/trpc";
  const t = initTRPC.context<{ authorization: string }>().create({
    // Visible in every rejection below, which is what proves the real formatter ran rather than a copy of its shape
    errorFormatter: ({ shape }) => ({ ...shape, message: `formatted ${shape.message}` }),
    transformer: superjson,
  });
  const router = t.router({
    // oxlint-disable-next-line require-await -- A subscription is an AsyncIterable, which only an async generator yields
    events: t.procedure.subscription(async function* () {
      yield 0;
    }),
    nested: t.router({
      deep: t.router({ read: t.procedure.input(z.object({ id: z.string() })).query(() => new Date(0)) }),
      // A procedure named after the method the proxy ends in
      query: t.procedure.query(() => ""),
    }),
    readAuthorization: t.procedure.query(() => ""),
    unregistered: t.procedure.query(() => ""),
    upload: t.procedure.input(z.instanceof(FormData)).mutation(() => ""),
    write: t.procedure.mutation(() => undefined),
  });
  const { handlers, reset, trpc } = createTRPCMsw<typeof router, { authorization: string }>({
    allowMethodOverride: true,
    createContext: ({ req }) => ({
      authorization: req instanceof Request ? (req.headers.get("authorization") ?? "") : "",
    }),
    endpoint,
    t,
    webSocketUrl,
  });
  const server = setupServer(...handlers);
  const client = createTRPCClient<typeof router>({
    links: [
      splitLink({
        condition: ({ input }) => input instanceof FormData,
        false: httpBatchLink({ headers: { authorization: "a" }, transformer: superjson, url: endpoint }),
        true: httpLink({ transformer: superjson, url: endpoint }),
      }),
    ],
  });

  beforeAll(() => {
    server.listen({ onUnhandledFrame: "error" });
  });

  afterEach(() => {
    reset();
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test("answers a batch through the transformer in both directions", async () => {
    expect.hasAssertions();

    const read = vi.fn<(options: { input: { id: string } }) => Date>(() => new Date(0));
    trpc.nested.deep.read.query(read);
    trpc.nested.query.query(() => " ");
    const [date, value] = await Promise.all([client.nested.deep.read.query({ id: "" }), client.nested.query.query()]);

    expect(date).toStrictEqual(new Date(0));
    expect(value).toBe(" ");
    expect(takeOne(read.mock.calls)[0].input).toStrictEqual({ id: "" });
  });

  test("#43 reads FormData mutation input", async () => {
    expect.hasAssertions();

    trpc.upload.mutation(({ input }) => {
      const value = input.get("");
      return typeof value === "string" ? value : "";
    });
    const formData = new FormData();
    formData.set("", " ");

    await expect(client.upload.mutate(formData)).resolves.toBe(" ");
  });

  test("#45 #36 answers a mutation with no input and no output", async () => {
    expect.hasAssertions();

    trpc.write.mutation(() => undefined);

    await expect(client.write.mutate()).resolves.toBeUndefined();
  });

  test("#13 rejects with the error the resolver throws, shaped by the real formatter", async () => {
    expect.hasAssertions();

    trpc.write.mutation(() => {
      throw new TRPCError({ code: "CONFLICT", message: "" });
    });

    await expect(client.write.mutate()).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCClientError: formatted ]`);
  });

  test("rejects a procedure with no resolver registered", async () => {
    expect.hasAssertions();

    await expect(client.unregistered.query()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCClientError: formatted No procedure found on path "unregistered"]`,
    );
  });

  test("forgets every resolver on reset", async () => {
    expect.hasAssertions();

    trpc.write.mutation(() => undefined);
    reset();

    await expect(client.write.mutate()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCClientError: formatted No "mutation"-procedure on path "write"]`,
    );
  });

  test("hands the resolver the context built from the request", async () => {
    expect.hasAssertions();

    trpc.readAuthorization.query(({ ctx }) => ctx.authorization);

    await expect(client.readAuthorization.query()).resolves.toBe("a");
  });

  test("#46 answers a query sent as a POST", async () => {
    expect.hasAssertions();

    const postClient = createTRPCClient<typeof router>({
      links: [httpLink({ methodOverride: "POST", transformer: superjson, url: endpoint })],
    });
    trpc.nested.query.query(() => " ");

    await expect(postClient.nested.query.query()).resolves.toBe(" ");
  });

  test("passes a request naming no registered procedure on when told to bypass", async () => {
    expect.hasAssertions();

    const bypassMsw = createTRPCMsw<typeof router>({
      endpoint,
      onUnhandledProcedure: UnhandledProcedureAction.Bypass,
      t: initTRPC.create({ transformer: superjson }),
    });
    server.use(
      ...bypassMsw.handlers,
      http.all(`${endpoint}/*`, () => HttpResponse.json({ result: { data: { json: " " } } })),
    );

    await expect(client.nested.query.query()).resolves.toBe(" ");
  });

  test("#19 streams a subscription over a WebSocket, including one registered after the socket opened", async () => {
    expect.hasAssertions();

    const webSocketClient = createWSClient({ url: webSocketUrl });
    const webSocketTRPCClient = createTRPCClient<typeof router>({
      links: [wsLink({ client: webSocketClient, transformer: superjson })],
    });
    trpc.nested.query.query(() => " ");
    await webSocketTRPCClient.nested.query.query();
    // oxlint-disable-next-line require-await -- A subscription is an AsyncIterable, which only an async generator yields
    trpc.events.subscription(async function* () {
      yield 1;
    });
    const { promise, resolve } = Promise.withResolvers<number>();
    const subscription = webSocketTRPCClient.events.subscribe(undefined, { onData: resolve });

    await expect(promise).resolves.toBe(1);

    subscription.unsubscribe();
    await webSocketClient.close();
  });

  test("streams a subscription as server-sent events", async () => {
    expect.hasAssertions();

    // oxlint-disable-next-line require-await -- A subscription is an AsyncIterable, which only an async generator yields
    trpc.events.subscription(async function* () {
      yield 1;
    });
    const response = await fetch(`${endpoint}/events`, { headers: { accept: "text/event-stream" } });
    assert.exists(response.body);
    let text = "";
    // The stream opens with a connected event and stays open, so it is read until the yielded value has arrived
    for await (const chunk of response.body.pipeThrough(new TextDecoderStream())) {
      text += chunk;
      if (text.includes("json")) break;
    }

    expect(text).toMatchInlineSnapshot(`
      "event: connected
      data: {}


      data: {"json":1}
      "
    `);
  });
});
