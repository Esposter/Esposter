import type { Arrival } from "#src/models/shared/overlay/Arrival";
import type { KeyedView } from "#src/models/shared/overlay/KeyedView";
import type { WriteResponse } from "#src/models/shared/overlay/WriteResponse";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";
import { createRowTable } from "#src/services/shared/overlay/createRowTable.test";
import { createTable } from "#src/services/shared/overlay/createTable";
import { useOverlayStore } from "#src/store/overlay";
import { TOMBSTONE_RETENTION_MS } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useOverlayStore, () => {
  // Every write a test holds pending answers this one deferred, which the test's teardown answers with nothing, so the
  // Shared setup's drain of every fire-and-forget finds them settled
  let heldWrite = Promise.withResolvers<WriteResponse>();
  const rowTable = createRowTable();
  const table = createTable(rowTable);
  // A membership as the viewer holds it, with a column a member's projection drops, and the projection of it
  const membershipSource = sqliteTable("membership", {
    deletedAt: integer({ mode: "timestamp_ms" }),
    id: text().primaryKey(),
    isHidden: integer({ mode: "boolean" }).notNull(),
    name: text().notNull(),
    version: integer().notNull(),
  });
  const membershipTable = createTable(membershipSource);
  const membershipProjectionTable = createTable<
    typeof membershipSource,
    { deletedAt: Date | null; id: string; name: string; version: number }
  >(membershipSource);
  const name = "";
  const otherName = " ";
  const serverName = "  ";
  const noChange: WriteResponse = { arrivals: [], confirmed: [] };
  const setRowName = (view: KeyedView, value: string) => {
    view.set(table, ["a"], { deletedAt: null, id: "a", name: value, version: 1 });
  };
  const writeFirstRow = (view: KeyedView) => {
    view.set(table, ["a"], { deletedAt: null, id: "a", name, version: 0 });
  };
  const writeOtherRow = (view: KeyedView) => {
    view.set(table, ["b"], { deletedAt: null, id: "b", name, version: 0 });
  };
  const readFirstRow = (view: KeyedView) => {
    view.get(table, ["a"]);
  };
  // The clock starts at the epoch, so a tombstone deleted at the epoch is inside the retention. The retention tests
  // Move the clock two retentions on, where a tombstone deleted at the epoch is past it, and one deleted a retention
  // And a half past the epoch is still inside it
  const clockNow = Temporal.Instant.fromEpochMilliseconds(TOMBSTONE_RETENTION_MS * 2);
  const expiredDeletedAt = new Date(0);
  const freshDeletedAt = new Date(TOMBSTONE_RETENTION_MS * 1.5);

  beforeEach(() => {
    heldWrite = Promise.withResolvers<WriteResponse>();
    setActivePinia(createPinia());
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    heldWrite.resolve({ arrivals: [], confirmed: [] });
    vi.useRealTimers();
  });

  test("an older arrival after a newer one leaves the newer row held", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 2 });
    arrive(table, { deletedAt: null, id: "a", name: otherName, version: 1 });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name, version: 2 }]);
  });

  test("an equal arrival changes no column the held row has", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    arrive(table, { deletedAt: null, id: "a", name: otherName, version: 1 });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name, version: 1 }]);
  });

  test("a newer arrival replaces the row held", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    arrive(table, { deletedAt: null, id: "a", name: otherName, version: 2 });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: otherName, version: 2 }]);
  });

  test("a newer projected arrival keeps the columns it does not carry", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(membershipTable, { deletedAt: null, id: "a", isHidden: true, name, version: 1 });
    arrive(membershipProjectionTable, { deletedAt: null, id: "a", name: otherName, version: 2 });

    expect(readView(membershipTable).value).toStrictEqual([
      { deletedAt: null, id: "a", isHidden: true, name: otherName, version: 2 },
    ]);
  });

  test("a projected arrival before the full row of its version keeps the full row's columns", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(membershipProjectionTable, { deletedAt: null, id: "a", name, version: 1 });
    arrive(membershipTable, { deletedAt: null, id: "a", isHidden: true, name, version: 1 });

    expect(readView(membershipTable).value).toStrictEqual([
      { deletedAt: null, id: "a", isHidden: true, name, version: 1 },
    ]);
  });

  test("a newer full arrival replaces the columns a projection carried", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(membershipProjectionTable, { deletedAt: null, id: "a", name, version: 1 });
    arrive(membershipTable, { deletedAt: null, id: "a", isHidden: true, name: otherName, version: 2 });

    expect(readView(membershipTable).value).toStrictEqual([
      { deletedAt: null, id: "a", isHidden: true, name: otherName, version: 2 },
    ]);
  });

  test("a revival past a forgotten tombstone takes no column of that tombstone", () => {
    expect.hasAssertions();

    vi.setSystemTime(clockNow);
    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(membershipTable, { deletedAt: expiredDeletedAt, id: "a", isHidden: true, name, version: 5 });
    arrive(membershipProjectionTable, { deletedAt: null, id: "a", name: serverName, version: 0 });

    expect(readView(membershipTable).value).toStrictEqual([{ deletedAt: null, id: "a", name: serverName, version: 0 }]);
  });

  test("a tombstone removes its row from the view", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    arrive(table, { deletedAt: new Date(0), id: "a", name, version: 2 });

    expect(readView(table).value).toStrictEqual([]);
  });

  test("an older live arrival cannot revive a tombstone", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(table, { deletedAt: new Date(0), id: "a", name, version: 2 });
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });

    expect(readView(table).value).toStrictEqual([]);
  });

  test("a revived row at version zero arrives as new once the tombstone held for its key is past the retention", () => {
    expect.hasAssertions();

    vi.setSystemTime(clockNow);
    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(table, { deletedAt: expiredDeletedAt, id: "a", name, version: 5 });
    arrive(table, { deletedAt: null, id: "a", name: serverName, version: 0 });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: serverName, version: 0 }]);
  });

  test("a revived row at version zero is still rejected while the tombstone held for its key is inside the retention", () => {
    expect.hasAssertions();

    vi.setSystemTime(clockNow);
    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(table, { deletedAt: freshDeletedAt, id: "a", name, version: 5 });
    arrive(table, { deletedAt: null, id: "a", name: serverName, version: 0 });

    expect(readView(table).value).toStrictEqual([]);
  });

  test("a revived row's write stays pending until the row arrives, though its answer names version zero", async () => {
    expect.hasAssertions();

    vi.setSystemTime(clockNow);
    const overlayStore = useOverlayStore();
    const { arrive, view: readView, writeOptimistic } = overlayStore;
    arrive(table, { deletedAt: expiredDeletedAt, id: "a", name, version: 5 });
    writeOptimistic(() => Promise.resolve({ arrivals: [], confirmed: [createConfirmation(table, ["a"], 0)] }), {
      entry: (view) => {
        setRowName(view, otherName);
      },
      onError: noop,
    });
    await flushPromises();

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: otherName, version: 1 }]);

    arrive(table, { deletedAt: null, id: "a", name: serverName, version: 0 });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: serverName, version: 0 }]);
  });

  test("absence removes nothing: a row a later arrival does not name stays held", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    arrive(table, { deletedAt: null, id: "b", name, version: 1 });
    arrive(table, { deletedAt: null, id: "b", name: otherName, version: 2 });

    expect(readView(table).value).toStrictEqual([
      { deletedAt: null, id: "a", name, version: 1 },
      { deletedAt: null, id: "b", name: otherName, version: 2 },
    ]);
  });

  test("a row nothing holds accepts a version-zero arrival, as a client placeholder's first server row does", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 0 });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name, version: 0 }]);
  });

  test("two Table objects over one table share the rows held for it", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView } = overlayStore;
    const sameTable = createTable(rowTable);
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    arrive(sameTable, { deletedAt: null, id: "b", name, version: 1 });

    expect(readView(table).value).toStrictEqual([
      { deletedAt: null, id: "a", name, version: 1 },
      { deletedAt: null, id: "b", name, version: 1 },
    ]);
  });

  test("a store hydrated from the state a server render serialised answers its view with the rows, with no read run", () => {
    expect.hasAssertions();

    const serverPinia = createPinia();
    setActivePinia(serverPinia);
    const serverOverlayStore = useOverlayStore();
    const { $state, arrive } = serverOverlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    // The payload carries the store's state as plain data, so the server's held tables are cloned out of Pinia's
    // Reactive state
    const payload = structuredClone($state.heldTables);
    const clientPinia = createPinia();
    clientPinia.state.value = { overlay: { heldTables: payload } };
    setActivePinia(clientPinia);
    const clientOverlayStore = useOverlayStore();
    const { view: readView } = clientOverlayStore;

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name, version: 1 }]);
  });

  test("an entry that throws in the view leaves the view equal to held state and reports its error once to its write", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView, writeOptimistic } = overlayStore;
    const onError = vi.fn<(error: Error) => void>();
    const thrown = new Error(" ");
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    arrive(table, { deletedAt: null, id: "b", name, version: 1 });
    writeOptimistic(() => heldWrite.promise, {
      entry: (view) => {
        setRowName(view, otherName);
        if (view.get(table, ["b"])?.deletedAt) throw thrown;
      },
      onError,
    });
    arrive(table, { deletedAt: new Date(0), id: "b", name, version: 2 });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name, version: 1 }]);
    await flushPromises();
    expect(onError).toHaveBeenCalledExactlyOnceWith(thrown);

    // The entry stays pending, so each recomputation runs it again, and its error is still reported once
    arrive(table, { deletedAt: null, id: "c", name, version: 1 });

    expect(readView(table).value).toStrictEqual([
      { deletedAt: null, id: "a", name, version: 1 },
      { deletedAt: null, id: "c", name, version: 1 },
    ]);
    await flushPromises();
    expect(onError).toHaveBeenCalledExactlyOnceWith(thrown);
  });

  test("an entry that throws as it is issued sends nothing and reports its error to its write", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView, writeOptimistic } = overlayStore;
    const onError = vi.fn<(error: Error) => void>();
    const mutate = vi.fn<() => Promise<WriteResponse>>(() => heldWrite.promise);
    const thrown = new Error(" ");
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    writeOptimistic(mutate, {
      entry: (view) => {
        setRowName(view, otherName);
        throw thrown;
      },
      onError,
    });

    expect(mutate).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledExactlyOnceWith(thrown);
    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name, version: 1 }]);
  });

  test("a write to one row waits for the earlier write to that row, whichever caller issues it", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { writeOptimistic } = overlayStore;
    const { promise: firstWritten, resolve: resolveFirst } = Promise.withResolvers<WriteResponse>();
    const firstMutate = vi.fn<() => Promise<WriteResponse>>(() => firstWritten);
    const secondMutate = vi.fn<() => Promise<WriteResponse>>(() => Promise.resolve(noChange));
    writeOptimistic(firstMutate, { entry: writeFirstRow, onError: noop });
    writeOptimistic(secondMutate, { entry: writeFirstRow, onError: noop });
    await flushPromises();

    expect(secondMutate).not.toHaveBeenCalled();

    resolveFirst(noChange);
    await flushPromises();

    expect(secondMutate).toHaveBeenCalledExactlyOnceWith();
  });

  test("writes to different rows run at once", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { writeOptimistic } = overlayStore;
    const firstMutate = vi.fn<() => Promise<WriteResponse>>(() => heldWrite.promise);
    const secondMutate = vi.fn<() => Promise<WriteResponse>>(() => heldWrite.promise);
    writeOptimistic(firstMutate, { entry: writeFirstRow, onError: noop });
    writeOptimistic(secondMutate, { entry: writeOtherRow, onError: noop });
    await flushPromises();

    expect(firstMutate).toHaveBeenCalledExactlyOnceWith();
    expect(secondMutate).toHaveBeenCalledExactlyOnceWith();
  });

  test("a read of a row a queued write changes waits behind that write", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { writeOptimistic } = overlayStore;
    const firstMutate = vi.fn<() => Promise<WriteResponse>>(() => heldWrite.promise);
    const readMutate = vi.fn<() => Promise<WriteResponse>>(() => Promise.resolve(noChange));
    writeOptimistic(firstMutate, { entry: writeFirstRow, onError: noop });
    writeOptimistic(readMutate, { entry: readFirstRow, onError: noop });
    await flushPromises();

    expect(readMutate).not.toHaveBeenCalled();
  });

  test("a rejected write releases the writes queued behind it", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { writeOptimistic } = overlayStore;
    const onError = vi.fn<(error: Error) => void>();
    const failingMutate = vi.fn<() => Promise<WriteResponse>>(() => Promise.reject(new Error(" ")));
    const nextMutate = vi.fn<() => Promise<WriteResponse>>(() => Promise.resolve(noChange));
    writeOptimistic(failingMutate, { entry: writeFirstRow, onError });
    writeOptimistic(nextMutate, { entry: writeFirstRow, onError: noop });
    await flushPromises();

    expect(nextMutate).toHaveBeenCalledExactlyOnceWith();
  });

  test("pending entries show over held state, the later one over the earlier one", () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView, writeOptimistic } = overlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    writeOptimistic(() => heldWrite.promise, {
      entry: (view) => {
        setRowName(view, otherName);
      },
      onError: noop,
    });
    writeOptimistic(() => heldWrite.promise, {
      entry: (view) => {
        setRowName(view, serverName);
      },
      onError: noop,
    });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: serverName, version: 1 }]);
  });

  test("a failed write drops its entry, leaving the view as held state was", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView, writeOptimistic } = overlayStore;
    const onError = vi.fn<(error: Error) => void>();
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    writeOptimistic(() => Promise.reject(new Error(" ")), {
      entry: (view) => {
        setRowName(view, otherName);
      },
      onError,
    });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: otherName, version: 1 }]);

    await flushPromises();

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name, version: 1 }]);
    expect(onError).toHaveBeenCalledExactlyOnceWith(new Error(" "));
  });

  test("a confirmed entry stays until the row arrives at the version the response named", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView, writeOptimistic } = overlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    writeOptimistic(() => Promise.resolve({ arrivals: [], confirmed: [createConfirmation(table, ["a"], 2)] }), {
      entry: (view) => {
        setRowName(view, otherName);
      },
      onError: noop,
    });
    await flushPromises();

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: otherName, version: 1 }]);

    arrive(table, { deletedAt: null, id: "a", name: serverName, version: 2 });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: serverName, version: 2 }]);
  });

  // A write whose header named no row, as one past the header's budget does, confirms nothing: its entry drops with its
  // Answer and the view is held state, which the topic refetch brings up to date, rather than waiting on a version
  // Never named
  test("an answer that names no row drops its entry with the answer, leaving the view as held state", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView, writeOptimistic } = overlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    writeOptimistic(() => Promise.resolve(noChange), {
      entry: (view) => {
        setRowName(view, otherName);
      },
      onError: noop,
    });

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: otherName, version: 1 }]);

    await flushPromises();

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name, version: 1 }]);
  });

  test("a response that carries its row settles the entry at once", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive, view: readView, writeOptimistic } = overlayStore;
    arrive(table, { deletedAt: null, id: "a", name, version: 1 });
    writeOptimistic(
      () =>
        Promise.resolve({
          arrivals: [createArrival(table, { deletedAt: null, id: "a", name: serverName, version: 2 })],
          confirmed: [createConfirmation(table, ["a"], 2)],
        }),
      {
        entry: (view) => {
          setRowName(view, otherName);
        },
        onError: noop,
      },
    );
    await flushPromises();

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: serverName, version: 2 }]);
  });

  test("two awaited responses for one row hold the higher version, whichever arrives first", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { view: readView, writeAwaited } = overlayStore;
    const first = Promise.withResolvers<Arrival[]>();
    const second = Promise.withResolvers<Arrival[]>();
    const firstWrite = writeAwaited(() => first.promise, {
      awaitedBecause: AwaitedReason.ServerDecidedOutcome,
      onError: noop,
    });
    const secondWrite = writeAwaited(() => second.promise, {
      awaitedBecause: AwaitedReason.ServerDecidedOutcome,
      onError: noop,
    });
    second.resolve([createArrival(table, { deletedAt: null, id: "a", name: serverName, version: 2 })]);
    await secondWrite;
    first.resolve([createArrival(table, { deletedAt: null, id: "a", name, version: 1 })]);
    await firstWrite;

    expect(readView(table).value).toStrictEqual([{ deletedAt: null, id: "a", name: serverName, version: 2 }]);
  });

  test("an awaited write is issued at once, since it has no entry and so no queue key", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { writeAwaited, writeOptimistic } = overlayStore;
    const optimisticMutate = vi.fn<() => Promise<WriteResponse>>(() => heldWrite.promise);
    const awaitedMutate = vi.fn<() => Promise<Arrival[]>>(() => Promise.resolve([]));
    writeOptimistic(optimisticMutate, { entry: writeFirstRow, onError: noop });
    await writeAwaited(awaitedMutate, { awaitedBecause: AwaitedReason.ServerDecidedOutcome, onError: noop });

    expect(awaitedMutate).toHaveBeenCalledExactlyOnceWith();
  });
});
