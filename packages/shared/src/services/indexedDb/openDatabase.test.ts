import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";

import { getResultAsync } from "#src/services/error/getResultAsync";
import { openDatabase } from "#src/services/indexedDb/openDatabase";
import { noop } from "#src/util/function/noop";
import { IDBVersionChangeEvent } from "fake-indexeddb";
import { afterEach, describe, expect, test, vi } from "vitest";

// oxlint-disable-next-line import/no-unassigned-import -- the import installs the indexedDB global the tests open
import "fake-indexeddb/auto";

interface Schema extends DatabaseSchema {
  users: { indexes: { name: string }; key: number; value: { id: number; name: string } };
}

// Each test opens its own database, since a connection a failed test left open would block the next one's upgrade
const openTestDatabase = (databaseName: string) =>
  openDatabase<Schema>(databaseName, 1, {
    upgrade: (database) => {
      const store = database.createObjectStore("users", { keyPath: "id" });
      store.createIndex("name", "name");
    },
  });

describe(openDatabase, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("runs the upgrade and names the database it opened", async () => {
    expect.hasAssertions();

    const database = await openTestDatabase("opens");

    expect(database.name).toBe("opens");
    database.close();
  });

  test("reads back what was put by key, by store and by index", async () => {
    expect.hasAssertions();

    const database = await openTestDatabase("reads");
    await database.put("users", { id: 1, name: "a" });
    await database.put("users", { id: 2, name: "a" });

    await expect(database.get("users", 1)).resolves.toStrictEqual({ id: 1, name: "a" });
    await expect(database.get("users", 3)).resolves.toBeUndefined();
    await expect(database.getAll("users", null)).resolves.toHaveLength(2);
    await expect(database.getAllKeys("users")).resolves.toStrictEqual([1, 2]);
    const store = database.transaction("users").objectStore("users");
    await expect(store.index("name").getAllKeys("a")).resolves.toStrictEqual([1, 2]);
    await expect(store.index("name").getAll("a")).resolves.toStrictEqual([
      { id: 1, name: "a" },
      { id: 2, name: "a" },
    ]);
    database.close();
  });

  test("#307 deletes a record keyed by a number", async () => {
    expect.hasAssertions();

    const database = await openTestDatabase("deletes");
    await database.put("users", { id: 1, name: "a" });
    await database.delete("users", 1);

    await expect(database.getAllKeys("users")).resolves.toStrictEqual([]);
    database.close();
  });

  test("#326 a failed write rejects done with the error that aborted the transaction", async () => {
    expect.hasAssertions();

    const database = await openDatabase<Schema>("aborts", 1, {
      upgrade: (upgradeDatabase) => {
        const store = upgradeDatabase.createObjectStore("users", { keyPath: "id" });
        store.createIndex("name", "name", { unique: true });
      },
    });
    await database.put("users", { id: 1, name: "a" });
    const transaction = database.transaction("users", "readwrite");
    const write = transaction.objectStore("users").put({ id: 2, name: "a" });

    await expect(write).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ConstraintError: A mutation operation in the transaction failed because a constraint was not satisfied. For example, an object such as an object store or index already exists and a request attempted to create a new one.]`,
    );
    await expect(transaction.done).rejects.toThrowErrorMatchingInlineSnapshot(`[ConstraintError]`);
    database.close();
  });

  test("#294 an upgrade that throws aborts the upgrade and rejects the open", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockReturnValue(undefined);
    const open = openDatabase<Schema>("upgradeThrows", 1, {
      upgrade: () => {
        throw new Error("upgrade failed");
      },
    });

    await expect(open).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AbortError: A request was aborted, for example through a call to IDBTransaction.abort.]`,
    );
  });

  test("a thrown upgrade failure is logged once, with its own message", async () => {
    expect.hasAssertions();

    const upgradeError = new Error("upgrade failed");
    vi.spyOn(console, "error").mockReturnValue(undefined);
    const upgradeTransactions: { done: Promise<void> }[] = [];
    const open = openDatabase<Schema>("thrownLogged", 1, {
      upgrade: (_database, _oldVersion, _newVersion, transaction) => {
        upgradeTransactions.push(transaction);
        throw upgradeError;
      },
    });

    await expect(open).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AbortError: A request was aborted, for example through a call to IDBTransaction.abort.]`,
    );
    await expect(upgradeTransactions[0]?.done).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AbortError: The transaction was aborted]`,
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenLastCalledWith(upgradeError);
  });

  test("an upgrade aborted by a request error is logged", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockReturnValue(undefined);
    const upgradeTransactions: { done: Promise<void> }[] = [];
    const open = openDatabase<Schema>("requestLogged", 1, {
      upgrade: (upgradeDatabase, _oldVersion, _newVersion, transaction) => {
        const store = upgradeDatabase.createObjectStore("users", { keyPath: "id" });
        store.createIndex("name", "name", { unique: true });
        upgradeTransactions.push(transaction);
        store.put({ id: 1, name: "a" });
        // The second name fails its request, which aborts the transaction, so its rejection is handled as it is made
        getResultAsync(() => store.put({ id: 2, name: "a" })).match(noop, console.error);
      },
    });

    await expect(open).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AbortError: A request was aborted, for example through a call to IDBTransaction.abort.]`,
    );
    await expect(upgradeTransactions[0]?.done).rejects.toThrowErrorMatchingInlineSnapshot(`[ConstraintError]`);
    // The rejected request is logged by its own handler, then the aborted upgrade by openDatabase
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  test("#190 a shortcut write rejects with the request's own error", async () => {
    expect.hasAssertions();

    const database = await openDatabase<Schema>("shortcutFails", 1, {
      upgrade: (upgradeDatabase) => {
        const store = upgradeDatabase.createObjectStore("users", { keyPath: "id" });
        store.createIndex("name", "name", { unique: true });
      },
    });
    await database.put("users", { id: 1, name: "a" });

    await expect(database.put("users", { id: 2, name: "a" })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ConstraintError: A mutation operation in the transaction failed because a constraint was not satisfied. For example, an object such as an object store or index already exists and a request attempted to create a new one.]`,
    );
    database.close();
  });

  test("#96 a write to a store with generated keys resolves to the key it generated", async () => {
    expect.hasAssertions();

    const database = await openDatabase<{
      logs: { indexes: Record<never, never>; key: number; value: { text: string } };
    }>("generatedKeys", 1, {
      upgrade: (upgradeDatabase) => {
        upgradeDatabase.createObjectStore("logs", { autoIncrement: true });
      },
    });

    await expect(database.put("logs", { text: "a" })).resolves.toBe(1);
    database.close();
  });

  test("#315 stores a NaN value and reads it back", async () => {
    expect.hasAssertions();

    const database = await openDatabase<{ counters: { indexes: Record<never, never>; key: string; value: number } }>(
      "nanValues",
      1,
      {
        upgrade: (upgradeDatabase) => {
          upgradeDatabase.createObjectStore("counters");
        },
      },
    );
    await database.put("counters", Number.NaN, "a");

    await expect(database.get("counters", "a")).resolves.toBeNaN();
    database.close();
  });

  test("#169 calls terminated when the browser closes the connection", async () => {
    expect.hasAssertions();

    const terminated = vi.fn<() => void>();
    const open = indexedDB.open.bind(indexedDB);
    let nativeDatabase: IDBDatabase | undefined;
    vi.spyOn(indexedDB, "open").mockImplementation((...args) => {
      const request = open(...args);
      request.addEventListener("success", () => {
        nativeDatabase = request.result;
      });
      return request;
    });
    const database = await openDatabase<Schema>("terminates", 1, {
      terminated,
      upgrade: (upgradeDatabase) => {
        upgradeDatabase.createObjectStore("users", { keyPath: "id" });
      },
    });
    nativeDatabase?.dispatchEvent(new IDBVersionChangeEvent("close"));

    expect(terminated).toHaveBeenCalledExactlyOnceWith();
    database.close();
  });

  test("calls blocking, and the connection it names closes so the upgrade can run", async () => {
    expect.hasAssertions();

    const blocking = vi.fn<(currentVersion: number, blockedVersion: null | number) => void>(() => {
      database.close();
    });
    const database = await openDatabase<Schema>("blocks", 1, {
      blocking,
      upgrade: (upgradeDatabase) => {
        upgradeDatabase.createObjectStore("users", { keyPath: "id" });
      },
    });
    const upgradedDatabase = await openDatabase<Schema>("blocks", 2);

    expect(blocking).toHaveBeenCalledExactlyOnceWith(1, 2);
    upgradedDatabase.close();
  });

  test("a transaction completes once the writes it made have committed", async () => {
    expect.hasAssertions();

    const database = await openTestDatabase("commits");
    const transaction = database.transaction(["users"], "readwrite");
    await transaction.objectStore("users").put({ id: 1, name: "a" });
    await transaction.done;

    await expect(database.getAllKeys("users")).resolves.toStrictEqual([1]);
    database.close();
  });

  test("an upgrade's transaction reads done after it has already committed", async () => {
    expect.hasAssertions();

    const upgradeTransactions: { done: Promise<void> }[] = [];
    const database = await openDatabase<Schema>("upgradeDone", 1, {
      upgrade: (upgradeDatabase, _oldVersion, _newVersion, transaction) => {
        upgradeDatabase.createObjectStore("users", { keyPath: "id" });
        upgradeTransactions.push(transaction);
      },
    });

    expect(upgradeTransactions).toHaveLength(1);
    await expect(upgradeTransactions[0]?.done).resolves.toBeUndefined();
    database.close();
  });

  test("loads without an indexedDB global, since nothing reads it at import", async () => {
    expect.hasAssertions();

    vi.resetModules();
    vi.stubGlobal("indexedDB", undefined);
    const { openDatabase: importedOpenDatabase } = await import("#src/services/indexedDb/openDatabase");

    expect(importedOpenDatabase).toBeTypeOf("function");
    vi.unstubAllGlobals();
  });
});
