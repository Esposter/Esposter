import type { KeyedView } from "#src/models/shared/overlay/KeyedView";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { useOverlayStore } from "#src/store/overlay";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

interface TestRow extends Versioned {
  id: string;
  name: string;
}

describe(useOverlayStore, () => {
  const table: Table<TestRow> = { keyOf: (row) => [row.id], name: "row" };
  const name = "";
  const otherName = " ";
  const writeFirstRow = (view: KeyedView) => {
    view.set(table, ["a"], { id: "a", name, version: 0 });
  };
  const writeOtherRow = (view: KeyedView) => {
    view.set(table, ["b"], { id: "b", name, version: 0 });
  };
  const readFirstRow = (view: KeyedView) => {
    view.get(table, ["a"]);
  };

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

  test("a write to one row waits for the earlier write to that row, whichever caller issues it", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { promise: firstWritten, resolve: resolveFirst } = Promise.withResolvers<void>();
    const firstMutate = vi.fn<() => Promise<void>>(() => firstWritten);
    const secondMutate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    overlayStore.writeOptimistic(firstMutate, { entry: writeFirstRow });
    overlayStore.writeOptimistic(secondMutate, { entry: writeFirstRow });
    await flushPromises();

    expect(secondMutate).not.toHaveBeenCalled();

    resolveFirst();
    await flushPromises();

    expect(secondMutate).toHaveBeenCalledExactlyOnceWith();
  });

  test("writes to different rows run at once", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const firstMutate = vi.fn<() => Promise<void>>(() => new Promise<void>(() => {}));
    const secondMutate = vi.fn<() => Promise<void>>(() => new Promise<void>(() => {}));
    overlayStore.writeOptimistic(firstMutate, { entry: writeFirstRow });
    overlayStore.writeOptimistic(secondMutate, { entry: writeOtherRow });
    await flushPromises();

    expect(firstMutate).toHaveBeenCalledExactlyOnceWith();
    expect(secondMutate).toHaveBeenCalledExactlyOnceWith();
  });

  test("a read of a row a queued write changes waits behind that write", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const firstMutate = vi.fn<() => Promise<void>>(() => new Promise<void>(() => {}));
    const readMutate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    overlayStore.writeOptimistic(firstMutate, { entry: writeFirstRow });
    overlayStore.writeOptimistic(readMutate, { entry: readFirstRow });
    await flushPromises();

    expect(readMutate).not.toHaveBeenCalled();
  });

  test("a rejected write releases the writes queued behind it", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const onError = vi.fn<(error: Error) => void>();
    const failingMutate = vi.fn<() => Promise<void>>(() => Promise.reject(new Error(name)));
    const nextMutate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    overlayStore.writeOptimistic(failingMutate, { entry: writeFirstRow, onError });
    overlayStore.writeOptimistic(nextMutate, { entry: writeFirstRow });
    await flushPromises();

    expect(nextMutate).toHaveBeenCalledExactlyOnceWith();
  });
});
