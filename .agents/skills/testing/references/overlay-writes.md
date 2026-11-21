# Tests of an optimistic write

Read when a test covers a store's optimistic write, a removal's effect on a held row, or two responses for one row. Each rule `SKILL.md` gives in one line is stated in full here. The reasoning is in the change design's Settling section, `openspec/changes/architecture-optimistic-overlay/design.md`, until that change is archived.

- **A refused write is asserted on the view.** Its entry drops, so the test reads the store's view after the rejection and expects the row as it was held. The registry's suite has the shape: a failed write drops its entry and leaves the view as held state was (`apps/web/app/store/overlay.test.ts`). A test that expects a restored value is pinning a rollback the design deleted.
- **A removal is asserted as a tombstone.** The row comes back at its version with `deletedAt` set, and the view hides it. The test never expects the row to be absent, since an absent row removes nothing from held state (`apps/web/app/store/overlay.test.ts`, "a tombstone removes its row from the view").
- **Two responses for one row are ordered by version.** The test gates the older response on the newer one's settle with `Promise.withResolvers` (`references/awaiting-a-double.md`), and asserts the higher version is the one held, whichever arrives first.
- **An entry's touched keys hold on any state.** The test runs the entry on two states that differ in other rows, and expects the same touched keys, since the registry's queue is built from them.
- **A fixture row carries its version.** The server row a fixture stands for has the version the server would give it, and a client placeholder holds `NO_ROW_VERSION` from `@esposter/db-schema`, below every stored version. The literal is the `test-values` skill's.
