// @vitest-environment nuxt
import { createRowTable } from "#src/services/shared/overlay/createRowTable.test";
import { createTable } from "#src/services/shared/overlay/createTable";
import { useOverlayStore } from "#src/store/overlay";
import { ZERO_UUID } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useOverlayRead, () => {
  const rowTable = createRowTable();
  const table = createTable(rowTable);
  const rowId = ZERO_UUID;
  const olderRow = { deletedAt: null, id: rowId, name: "", version: 0 };
  const newerRow = { deletedAt: null, id: rowId, name: " ", version: 1 };

  // The two reads take different keys, so the call-id check of a shared key cannot be what orders them: only the arrival
  // Gate can keep the older answer out of the view
  test("a slow read that answers after a newer read leaves the newer row held", async () => {
    expect.hasAssertions();

    const readRows = useOverlayRead(table, (readRow: typeof rowTable.$inferSelect) => readRow);
    const overlayStore = useOverlayStore();
    const { view } = overlayStore;
    const heldRows = view(table);
    const { promise: slowAnswer, resolve: answerSlowRead } = Promise.withResolvers<(typeof rowTable.$inferSelect)[]>();
    const slowRead = readRows(() => slowAnswer, { key: Symbol("slow") });
    await readRows(() => Promise.resolve([newerRow]), { key: Symbol("fast") });
    answerSlowRead([olderRow]);
    await slowRead;

    expect(heldRows.value).toStrictEqual([newerRow]);
  });
});
