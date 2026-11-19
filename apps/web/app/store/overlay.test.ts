import type { Arrival } from "#src/models/shared/overlay/Arrival";
import type { KeyedView } from "#src/models/shared/overlay/KeyedView";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { WriteResponse } from "#src/models/shared/overlay/WriteResponse";

import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";
import { createTable } from "#src/services/shared/overlay/createTable";
import { useOverlayStore } from "#src/store/overlay";
import { flushPromises } from "@vue/test-utils";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

interface TestRow extends Versioned {
  id: string;
  name: string;
}

const neverSettles = <TResult>() => new Promise<TResult>(() => {});

describe(useOverlayStore, () => {
  const rowTable = sqliteTable("row", {
    id: text().primaryKey(),
    name: text().notNull(),
    version: integer().notNull(),
  });
  const table = createTable<TestRow>(rowTable, (row) => [row.id]);
  const name = "";
  const otherName = " ";
  const serverName = "  ";
  const noChange: WriteResponse = { arrivals: [], confirmed: [] };
  const setRowName = (view: KeyedView, value: string) => {
    view.set(table, ["a"], { id: "a", name: value, version: 1 });
  };
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

  test("two Table objects over one table share the rows held for it", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const sameTable = createTable<TestRow>(rowTable, (row) => [row.id]);
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.arrive(sameTable, { id: "b", name, version: 1 });

    expect(overlayStore.view(table).value).toStrictEqual([
      { id: "a", name, version: 1 },
      { id: "b", name, version: 1 },
    ]);
  });

  test("an entry that throws in the view leaves the view equal to held state and reports its error once to its write", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const onError = vi.fn<(error: Error) => void>();
    const thrown = new Error(" ");
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.arrive(table, { id: "b", name, version: 1 });
    overlayStore.writeOptimistic(() => neverSettles(), {
      entry: (view) => {
        setRowName(view, otherName);
        if (view.get(table, ["b"])?.deletedAt) throw thrown;
      },
      onError,
    });
    overlayStore.arrive(table, { deletedAt: new Date(0), id: "b", name, version: 2 });

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name, version: 1 }]);
    await flushPromises();
    expect(onError).toHaveBeenCalledExactlyOnceWith(thrown);

    // The entry stays pending, so each recomputation runs it again, and its error is still reported once
    overlayStore.arrive(table, { id: "c", name, version: 1 });

    expect(overlayStore.view(table).value).toStrictEqual([
      { id: "a", name, version: 1 },
      { id: "c", name, version: 1 },
    ]);
    await flushPromises();
    expect(onError).toHaveBeenCalledExactlyOnceWith(thrown);
  });

  test("an entry that throws as it is issued sends nothing and reports its error to its write", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const onError = vi.fn<(error: Error) => void>();
    const mutate = vi.fn<() => Promise<WriteResponse>>(() => neverSettles());
    const thrown = new Error(" ");
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.writeOptimistic(mutate, {
      entry: (view) => {
        setRowName(view, otherName);
        throw thrown;
      },
      onError,
    });

    expect(mutate).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledExactlyOnceWith(thrown);
    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name, version: 1 }]);
  });

  test("a write to one row waits for the earlier write to that row, whichever caller issues it", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { promise: firstWritten, resolve: resolveFirst } = Promise.withResolvers<WriteResponse>();
    const firstMutate = vi.fn<() => Promise<WriteResponse>>(() => firstWritten);
    const secondMutate = vi.fn<() => Promise<WriteResponse>>(() => Promise.resolve(noChange));
    overlayStore.writeOptimistic(firstMutate, { entry: writeFirstRow });
    overlayStore.writeOptimistic(secondMutate, { entry: writeFirstRow });
    await flushPromises();

    expect(secondMutate).not.toHaveBeenCalled();

    resolveFirst(noChange);
    await flushPromises();

    expect(secondMutate).toHaveBeenCalledExactlyOnceWith();
  });

  test("writes to different rows run at once", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const firstMutate = vi.fn<() => Promise<WriteResponse>>(() => neverSettles());
    const secondMutate = vi.fn<() => Promise<WriteResponse>>(() => neverSettles());
    overlayStore.writeOptimistic(firstMutate, { entry: writeFirstRow });
    overlayStore.writeOptimistic(secondMutate, { entry: writeOtherRow });
    await flushPromises();

    expect(firstMutate).toHaveBeenCalledExactlyOnceWith();
    expect(secondMutate).toHaveBeenCalledExactlyOnceWith();
  });

  test("a read of a row a queued write changes waits behind that write", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const firstMutate = vi.fn<() => Promise<WriteResponse>>(() => neverSettles());
    const readMutate = vi.fn<() => Promise<WriteResponse>>(() => Promise.resolve(noChange));
    overlayStore.writeOptimistic(firstMutate, { entry: writeFirstRow });
    overlayStore.writeOptimistic(readMutate, { entry: readFirstRow });
    await flushPromises();

    expect(readMutate).not.toHaveBeenCalled();
  });

  test("a rejected write releases the writes queued behind it", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const onError = vi.fn<(error: Error) => void>();
    const failingMutate = vi.fn<() => Promise<WriteResponse>>(() => Promise.reject(new Error(name)));
    const nextMutate = vi.fn<() => Promise<WriteResponse>>(() => Promise.resolve(noChange));
    overlayStore.writeOptimistic(failingMutate, { entry: writeFirstRow, onError });
    overlayStore.writeOptimistic(nextMutate, { entry: writeFirstRow });
    await flushPromises();

    expect(nextMutate).toHaveBeenCalledExactlyOnceWith();
  });

  test("pending entries show over held state, the later one over the earlier one", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.writeOptimistic(() => neverSettles(), {
      entry: (view) => {
        setRowName(view, otherName);
      },
    });
    overlayStore.writeOptimistic(() => neverSettles(), {
      entry: (view) => {
        setRowName(view, serverName);
      },
    });

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name: serverName, version: 1 }]);
  });

  test("a failed write drops its entry, leaving the view as held state was", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const onError = vi.fn<(error: Error) => void>();
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.writeOptimistic(() => Promise.reject(new Error(name)), {
      entry: (view) => {
        setRowName(view, otherName);
      },
      onError,
    });

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name: otherName, version: 1 }]);

    await flushPromises();

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name, version: 1 }]);
    expect(onError).toHaveBeenCalledExactlyOnceWith(new Error(name));
  });

  test("a confirmed entry stays until the row arrives at the version the response named", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.writeOptimistic(
      () => Promise.resolve({ arrivals: [], confirmed: [createConfirmation(table, ["a"], 2)] }),
      {
        entry: (view) => {
          setRowName(view, otherName);
        },
      },
    );
    await flushPromises();

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name: otherName, version: 1 }]);

    overlayStore.arrive(table, { id: "a", name: serverName, version: 2 });

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name: serverName, version: 2 }]);
  });

  test("a response that carries its row settles the entry at once", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    overlayStore.arrive(table, { id: "a", name, version: 1 });
    overlayStore.writeOptimistic(
      () =>
        Promise.resolve({
          arrivals: [createArrival(table, { id: "a", name: serverName, version: 2 })],
          confirmed: [createConfirmation(table, ["a"], 2)],
        }),
      {
        entry: (view) => {
          setRowName(view, otherName);
        },
      },
    );
    await flushPromises();

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name: serverName, version: 2 }]);
  });

  test("two awaited responses for one row hold the higher version, whichever arrives first", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const first = Promise.withResolvers<Arrival[]>();
    const second = Promise.withResolvers<Arrival[]>();
    const firstWrite = overlayStore.writeAwaited(() => first.promise, {});
    const secondWrite = overlayStore.writeAwaited(() => second.promise, {});
    second.resolve([createArrival(table, { id: "a", name: serverName, version: 2 })]);
    await secondWrite;
    first.resolve([createArrival(table, { id: "a", name, version: 1 })]);
    await firstWrite;

    expect(overlayStore.view(table).value).toStrictEqual([{ id: "a", name: serverName, version: 2 }]);
  });

  test("an awaited write is issued at once, since it has no entry and so no queue key", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const optimisticMutate = vi.fn<() => Promise<WriteResponse>>(() => neverSettles());
    const awaitedMutate = vi.fn<() => Promise<Arrival[]>>(() => Promise.resolve([]));
    overlayStore.writeOptimistic(optimisticMutate, { entry: writeFirstRow });
    await overlayStore.writeAwaited(awaitedMutate, {});

    expect(awaitedMutate).toHaveBeenCalledExactlyOnceWith();
  });
});
