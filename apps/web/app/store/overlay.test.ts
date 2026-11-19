import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { useOverlayStore } from "#src/store/overlay";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

interface TestRow extends Versioned {
  id: string;
  name: string;
}

describe(useOverlayStore, () => {
  const table: Table<TestRow> = { keyOf: (row) => [row.id], name: "row" };
  const name = "";
  const otherName = " ";

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("an older arrival after a newer one leaves the newer row held", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(table, { id: "a", name, version: 2 });
    overlayStore.arrive(table, { id: "a", name: otherName, version: 1 });

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name, version: 2 }]);
  });

  test("an equal arrival changes nothing", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.arrive(table, { id: "a", name: otherName, version: 1 });

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name, version: 1 }]);
  });

  test("a newer arrival replaces the row held", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.arrive(table, { id: "a", name: otherName, version: 2 });

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name: otherName, version: 2 }]);
  });

  test("a tombstone removes its row from the view", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.arrive(table, { deletedAt: new Date(0), id: "a", name, version: 2 });

    expect(overlayStore.view(table).value).toStrictEqual([]);
  });

  test("an older live arrival cannot revive a tombstone", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(table, { deletedAt: new Date(0), id: "a", name, version: 2 });
    overlayStore.arrive(table, { id: "a", name, version: 1 });

    expect(overlayStore.view(table).value).toStrictEqual([]);
  });

  test("absence removes nothing: a row a later arrival does not name stays held", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.arrive(table, { id: "b", name, version: 1 });
    overlayStore.arrive(table, { id: "b", name: otherName, version: 2 });

    expect(overlayStore.view(table).value).toStrictEqual([
      { id: "a", name, version: 1 },
      { id: "b", name: otherName, version: 2 },
    ]);
  });

  test("a row nothing holds accepts a version-zero arrival, as a client placeholder's first server row does", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(table, { id: "a", name, version: 0 });

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name, version: 0 }]);
  });
});
