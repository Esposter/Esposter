import { RESET_DATABASE_TIMEOUT_MS } from "@/services/cache/constants";
import {
  DATABASE_NAME,
  DATABASE_VERSION,
  openIndexedDb,
  resetIndexedDb,
} from "@/services/cache/indexedDb/openIndexedDb";
import { getRequestError, openDatabase, Operation } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(openIndexedDb, () => {
  // A tab that deletes the database is held back by this page's connection until the connection closes, so the
  // Connection gives way to the delete rather than leaving the delete pending for as long as the page stays open
  test("releases its connection when another tab deletes the database, so the delete completes", async () => {
    expect.hasAssertions();

    const database = await openIndexedDb();
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(DATABASE_NAME);
      deleteRequest.onsuccess = () => {
        resolve();
      };
      deleteRequest.onerror = () => {
        reject(getRequestError(deleteRequest));
      };
    });

    await expect(openIndexedDb()).resolves.not.toBe(database);
  });
});

describe(resetIndexedDb, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // A tab from older code never releases the database, so the delete it blocks must not hold the sign-out forever
  test("stops waiting at the bound for a delete that another connection never lets finish", async () => {
    expect.hasAssertions();

    await openIndexedDb();
    const otherTabDatabase = await openDatabase(DATABASE_NAME, DATABASE_VERSION);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    const reset = resetIndexedDb();
    await Promise.all([
      expect(reset).rejects.toThrowErrorMatchingInlineSnapshot(
        `[InvalidOperationError: Invalid operation: ${Operation.Delete}, name: ${DATABASE_NAME}, still blocked by another open connection]`,
      ),
      vi.advanceTimersByTimeAsync(RESET_DATABASE_TIMEOUT_MS),
    ]);
    otherTabDatabase.close();
  });
});
