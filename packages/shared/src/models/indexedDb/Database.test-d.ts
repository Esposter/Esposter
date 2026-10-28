import type { Database } from "#src/models/indexedDb/Database";
import type { DatabaseIndex } from "#src/models/indexedDb/DatabaseIndex";
import type { DatabaseIndexKey } from "#src/models/indexedDb/DatabaseIndexKey";
import type { DatabaseIndexName } from "#src/models/indexedDb/DatabaseIndexName";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";
import type { DatabaseStoreName } from "#src/models/indexedDb/DatabaseStoreName";
import type { DatabaseTransaction } from "#src/models/indexedDb/DatabaseTransaction";
import type { UpgradeDatabase } from "#src/models/indexedDb/UpgradeDatabase";

import { describe, expect, expectTypeOf, test } from "vitest";

interface Schema extends DatabaseSchema {
  messages: { indexes: { roomId: string }; key: number; value: { roomId: string } };
  users: { indexes: { name: string; tag: string }; key: number; value: UserValue };
}
interface UserValue {
  id: number;
  name: string;
}

declare const database: Database<Schema>;
declare const upgradeDatabase: UpgradeDatabase<Schema>;

// A generic read through a store name the caller holds as a variable, the way the cache's reads and writes do it
const readIndex = <
  TStoreName extends DatabaseStoreName<Schema>,
  TIndexName extends DatabaseIndexName<Schema, TStoreName>,
>(
  storeName: TStoreName,
  indexName: TIndexName,
) => database.transaction(storeName).objectStore(storeName).index(indexName);

const readCachedItems = <
  TStoreName extends DatabaseStoreName<Schema>,
  TIndexName extends DatabaseIndexName<Schema, TStoreName>,
>(
  storeName: TStoreName,
  indexName: TIndexName,
  partitionKey: DatabaseIndexKey<Schema, TStoreName, TIndexName>,
) => database.transaction(storeName, "readonly").objectStore(storeName).index(indexName).getAll(partitionKey);

const writeItems = <TStoreName extends DatabaseStoreName<Schema>>(
  storeName: TStoreName,
  items: Schema[TStoreName]["value"][],
) => {
  const transaction = database.transaction(storeName, "readwrite");
  const objectStore = transaction.objectStore(storeName);
  return Promise.all(items.map((item) => objectStore.put(item)));
};

describe("database type", () => {
  test("get resolves to the store's value, or undefined when absent", () => {
    expect.hasAssertions();

    expectTypeOf(database.get("users", 1)).toEqualTypeOf<Promise<undefined | UserValue>>();
  });

  test("getAll and getAllKeys resolve to the store's values and keys", () => {
    expect.hasAssertions();

    expectTypeOf(database.getAll("users", null)).toEqualTypeOf<Promise<UserValue[]>>();
    expectTypeOf(database.getAllKeys("users")).toEqualTypeOf<Promise<number[]>>();
  });

  test("#307 delete takes the store's key type, and a key range", () => {
    expect.hasAssertions();

    expectTypeOf(database.delete("users", 1)).toEqualTypeOf<Promise<void>>();
    expectTypeOf(database.delete("users", IDBKeyRange.only(1))).toEqualTypeOf<Promise<void>>();
  });

  test("put takes the store's value and rejects a value of another store", async () => {
    expect.hasAssertions();

    expectTypeOf(database.put("users", { id: 1, name: "a" })).toEqualTypeOf<Promise<number>>();
    // @ts-expect-error -- a message is not a user
    await database.put("users", { roomId: "a" });
  });

  test("rejects a store name the schema does not declare", () => {
    expect.hasAssertions();

    // @ts-expect-error -- no such store
    database.transaction("rooms");
  });

  test("#200 a readonly transaction's store has no write methods", () => {
    expect.hasAssertions();

    expectTypeOf(database.transaction("users", "readwrite").objectStore("users").put).toBeFunction();
    // @ts-expect-error -- a readonly store cannot write
    database.transaction("users", "readonly").objectStore("users").put({ id: 1, name: "a" });
  });

  test("#345 transaction takes one store name or a readonly array of them", () => {
    expect.hasAssertions();

    const storeNames = ["messages", "users"] as const;

    expectTypeOf(database.transaction(storeNames)).toEqualTypeOf<
      DatabaseTransaction<Schema, DatabaseStoreName<Schema>, "readonly">
    >();
    expectTypeOf(database.transaction("users")).toEqualTypeOf<DatabaseTransaction<Schema, "users", "readonly">>();
  });

  test("#346 an index read through a generic store name keeps its typed index names", () => {
    expect.hasAssertions();

    expectTypeOf(readIndex("users", "name")).toEqualTypeOf<DatabaseIndex<Schema, "users", "name">>();
    // @ts-expect-error -- an index of another store
    readIndex("messages", "name");
  });

  test("#346 a union of store names takes only the index names every store declares", () => {
    expect.hasAssertions();

    const readSharedIndex = <TStoreName extends DatabaseStoreName<Schema>>(
      storeName: TStoreName,
      indexName: DatabaseIndexName<Schema, TStoreName>,
    ) => database.transaction(storeName).objectStore(storeName).index(indexName);

    readSharedIndex("users", "tag");
    // @ts-expect-error -- no index is declared by both stores
    readSharedIndex<DatabaseStoreName<Schema>>("users", "name");
  });

  test("the index read the caller pattern makes returns the store's values", () => {
    expect.hasAssertions();

    expectTypeOf(readCachedItems("users", "name", "a")).resolves.toEqualTypeOf<UserValue[]>();
  });

  test("the write pattern puts the store's values through a readwrite store", () => {
    expect.hasAssertions();

    expectTypeOf(writeItems("users", [{ id: 1, name: "a" }])).resolves.toEqualTypeOf<number[]>();
  });

  test("the upgrade creates a store whose index can be created", () => {
    expect.hasAssertions();

    expectTypeOf(upgradeDatabase.createObjectStore("users").createIndex).toBeFunction();
  });
});
