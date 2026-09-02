# Error Assertions

`toThrowErrorMatchingInlineSnapshot(...)` is the only accepted error assertion — that rule is in `SKILL.md`, because reaching for `toThrow()` is the default behaviour it exists to stop. This page is how to fill the snapshot in.

## Reconstruct first, empty-snapshot last

Almost every error we throw is reproducible, so build the argument from the same source of truth, not a pasted literal — ours as `` `[TRPCError: ${new InvalidOperationError(...).message}]` `` (or `[ClassName: …]` when thrown directly), native ones as `[TypeError: ${fn.name}: …]`, reusing the dynamic parts. It survives a message-format change, and covers a platform-gated test skipped on this OS.

**A message carrying a generated id is the case where `-u` actively lies.** Reaching for `pnpm test -u` on a
message that embeds a per-run uuid fills the snapshot with _that run's_ id, so the test passes once and fails on
every run after it — the update flow produces a broken test rather than an unstable-looking one. Interpolate the
value the test already holds (`` `[TRPCError: ${new NotFoundError(Entity, newResource.id).message}]` ``); the id
is only unreconstructable when the test never sees it.

## Opaque third-party messages only

A Zod error string you can't cleanly reconstruct: leave the snapshot empty and populate with `pnpm test -u`. The exception, not the default; still never `toBeInstanceOf`. A message no one can reconstruct portably is not snapshotted at all — `references/platform-and-bundle-tests.md`.

## An inline snapshot belongs to its call site

So a `test.each` row cannot carry its own. Every row of a table runs the same `expect` line, and vitest rejects a second, different snapshot there ("with different snapshots cannot be called at the same location").

A table whose rows share one message is fine — `[TRPCError: UNAUTHORIZED]` across six permission-gated procedures is the usual shape. Twin suites that differ **in the message** (`Must be call creator to admit knockers` / `…to dismiss knockers`) stay written out: the message naming the operation is what each row would be proving, and it is the half a table cannot express.
