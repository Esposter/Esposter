# Client-Side tRPC Calls

Read when a component or store under test calls a tRPC procedure from the client.

Call `setupMswTrpc()` at `describe` scope (`@/services/trpc/mswTrpc.test`) and declare per-test handlers on the server it returns: `server.use(trpcMsw.foo.createFoo.mutation(({ input }) => …))`. Handlers are typed off `TRPCRouter`, so a renamed or re-shaped procedure fails to compile instead of silently answering a call that no longer exists — the thing a hand-written client stub cannot do. The real plugin, links and transformer all run. **Never `vi.mock` `trpc-nuxt/client`.**

- The handler receives `{ input }` and its assertion sees that whole object: `expect(handler).toHaveBeenCalledWith({ input: { … } })`.
- Two transport settings differ under test, both via `IS_TEST` in `app/plugins/trpc.ts`: the client uses `@trpc/client`'s `httpLink` (trpc-nuxt's wraps Nuxt's `$fetch`, which resolves internally and never reaches an interceptor) against an absolute url (node's fetch rejects a bare path), and batching is off (a batched call puts several procedures behind one url that no per-procedure handler can match). Neither changes anything a test asserts on.
- Unhandled requests pass through rather than failing, so a test declares only the calls it is about.
