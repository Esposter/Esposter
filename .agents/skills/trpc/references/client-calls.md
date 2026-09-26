# Calling a Procedure from the Client

Read when client code calls a procedure — a read, a write, an optional or required id.

- **Every user-facing client read/write goes through `useQuery` / `useMutation`** (`composables/shared/`). Before hand-rolling a `getResultAsync(...)` around a `$trpc` call, confirm it matches a documented exception — the raw call sites are deliberate, not omissions. Primitive semantics, "Optimistic by default" and the full exception list: `apps/web/content/docs/architecture/client-data.md`.
- **Never call `.query({})` / `.mutate({})` with a bare empty object** (`trpc-procedure/no-empty-input`) — all-optional inputs chain `.prefault({})`, which makes the input itself optional: `$trpc.foo.readFoos.query()`. Same for test callers: `caller.readFoos()`.
- **Omit optional UUID fields instead of passing `undefined`** — when the value comes from a ref defaulting to `""`, use a conditional spread, not `|| undefined`:

  ```ts
  // key absent when empty — not { barId: currentBarId.value || undefined }
  $trpc.foo.readFoos.query(currentBarId.value ? { barId: currentBarId.value } : {});
  ```

- **Guard required UUID fields with an early return** — `if (!currentBarId.value) return;` before the call, rather than letting an empty string reach the UUID validator.
