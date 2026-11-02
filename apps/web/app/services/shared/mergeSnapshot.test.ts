import type { SnapshotPush } from "@/models/shared/SnapshotPush";

import { mergeSnapshot } from "@/services/shared/mergeSnapshot";
import { describe, expect, test } from "vitest";

interface Item {
  flag: boolean;
  id: string;
}

describe(mergeSnapshot, () => {
  const id = crypto.randomUUID();
  const otherId = crypto.randomUUID();
  const item: Item = { flag: false, id };
  const otherItem: Item = { flag: false, id: otherId };
  const removal: SnapshotPush<Item> = { checkIsRemoved: (snapshotItem) => snapshotItem.id === id, type: "remove" };

  test("returns the snapshot as it is when nothing was pushed", () => {
    expect.hasAssertions();

    expect(mergeSnapshot([item, otherItem], [])).toStrictEqual([item, otherItem]);
  });

  test("keeps a removal the snapshot still lists out of the result", () => {
    expect.hasAssertions();

    expect(mergeSnapshot([item, otherItem], [removal])).toStrictEqual([otherItem]);
  });

  test("adds a create the snapshot predates", () => {
    expect.hasAssertions();

    expect(mergeSnapshot([otherItem], [{ item, type: "set" }])).toStrictEqual([otherItem, item]);
  });

  test("applies a patch to the snapshot's item and ignores one for an item it does not hold", () => {
    expect.hasAssertions();

    const patch: SnapshotPush<Item> = { id, patch: { flag: true }, type: "patch" };
    const unknownPatch: SnapshotPush<Item> = { id: crypto.randomUUID(), patch: { flag: true }, type: "patch" };

    expect(mergeSnapshot([item], [patch, unknownPatch])).toStrictEqual([{ flag: true, id }]);
  });

  test("replays the pushes in the order they landed, so the last one for an item decides it", () => {
    expect.hasAssertions();

    expect(mergeSnapshot([item], [removal, { item, type: "set" }])).toStrictEqual([item]);
    expect(mergeSnapshot([item], [{ item, type: "set" }, removal])).toStrictEqual([]);
  });
});
