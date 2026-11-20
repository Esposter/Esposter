import { collectRowVersions, readActiveRowVersions } from "#src/services/realtime/collectRowVersions";
import { usersInAuth } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(collectRowVersions, () => {
  const table = getTableName(usersInAuth);

  test("returns the rows a synchronous push makes", async () => {
    expect.hasAssertions();

    const rowVersion = { key: { id: v7() }, table, version: 0 };
    const { result, rowVersions } = await collectRowVersions(() => {
      readActiveRowVersions()?.push(rowVersion);
      return Promise.resolve(true);
    });

    expect(result).toBe(true);
    expect(rowVersions).toStrictEqual([rowVersion]);
  });

  test("restores the collector once the call has run", async () => {
    expect.hasAssertions();

    await collectRowVersions(() => Promise.resolve(true));

    expect(readActiveRowVersions()).toBeUndefined();
  });

  test("a nested call restores the outer collector", async () => {
    expect.hasAssertions();

    const outerRowVersion = { key: { id: v7() }, table, version: 0 };
    const innerRowVersion = { key: { id: v7() }, table, version: 1 };
    const { result: innerCollection, rowVersions: outerRowVersions } = await collectRowVersions(() => {
      const innerCall = collectRowVersions(() => {
        readActiveRowVersions()?.push(innerRowVersion);
        return Promise.resolve(true);
      });
      readActiveRowVersions()?.push(outerRowVersion);
      return innerCall;
    });

    expect(innerCollection.rowVersions).toStrictEqual([innerRowVersion]);
    expect(outerRowVersions).toStrictEqual([outerRowVersion]);
  });
});
