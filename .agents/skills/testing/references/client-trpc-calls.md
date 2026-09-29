# Client-Side tRPC Calls

Read when a component or store under test calls a tRPC procedure from the client.

Call `setupMswTrpc()` at `describe` scope (`@/services/trpc/mswTrpc.test`) and register per-test resolvers on `trpcMsw`: `trpcMsw.foo.createFoo.mutation(({ input }) => …)`. Resolvers are typed off `TRPCRouter`, so a renamed or re-shaped procedure fails to compile instead of silently answering a call that no longer exists — the thing a hand-written client stub cannot do. The real plugin, links and transformer all run, and the mock router answers with the server's own `rootConfig`, so a thrown `TRPCError` reaches the store exactly as a real rejection does. **Never `vi.mock` the tRPC client.** How the package answers a call is `apps/web/content/docs/trpc-msw/index.md`.

- A resolver receives tRPC's own resolver options — `ctx`, `input`, `path`, `signal` — so a spy's recorded call is read as `takeOne(resolver.mock.calls)[0].input`.
- A procedure with no resolver registered rejects with `NOT_FOUND` rather than reaching the network, so a test that forgets one fails on the call it forgot. Plain `http.*` handlers still go on the returned server with `server.use`, and a non-tRPC request with no handler passes through.
- Under test the client uses `@trpc/client`'s `httpLink` against an absolute url, via `IS_TEST` in `app/plugins/trpc.ts` (the app's links wrap Nuxt's `$fetch`, which resolves internally and never reaches an interceptor, and node's fetch rejects a bare path).
