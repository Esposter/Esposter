import type { MockDatabase } from "@esposter/db-mock";

import { inJsonArray } from "#src/services/shared/inJsonArray";
import { notInJsonArray } from "#src/services/shared/notInJsonArray";
import { createMockDb } from "@esposter/db-mock";
import { usersInAuth } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(inJsonArray, () => {
  // Past D1's 100-parameter statement cap, so a list bound value by value would fail where this one must not
  const listLength = 150;
  const insertChunkLength = 10;
  let mockDatabase: MockDatabase;

  const insertUsers = async (ids: string[]) => {
    const chunks = Array.from({ length: Math.ceil(ids.length / insertChunkLength) }, (_value, index) =>
      ids.slice(index * insertChunkLength, (index + 1) * insertChunkLength),
    );
    await Promise.all(
      chunks.map((chunk) =>
        mockDatabase.db
          .insert(usersInAuth)
          .values(chunk.map((id) => ({ email: `${id}@example.com`, emailVerified: false, id, name: id }))),
      ),
    );
  };

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  test("matches every listed id past the statement's parameter cap", async () => {
    expect.hasAssertions();

    const ids = Array.from({ length: listLength }, () => v7());
    await insertUsers([...ids, v7()]);

    const users = await mockDatabase.db
      .select({ id: usersInAuth.id })
      .from(usersInAuth)
      .where(inJsonArray(usersInAuth.id, ids));

    expect(users.map(({ id }) => id).toSorted()).toStrictEqual(ids.toSorted());
  });

  test("matches nothing for an empty list, and excludes nothing from the negation", async () => {
    expect.hasAssertions();

    const id = v7();
    await insertUsers([id]);

    const included = await mockDatabase.db
      .select({ id: usersInAuth.id })
      .from(usersInAuth)
      .where(inJsonArray(usersInAuth.id, []));
    const excluded = await mockDatabase.db
      .select({ id: usersInAuth.id })
      .from(usersInAuth)
      .where(notInJsonArray(usersInAuth.id, []));

    expect(included).toStrictEqual([]);
    expect(excluded).toStrictEqual([{ id }]);
  });

  test("the negation keeps the rows the listed ids do not name, past the cap", async () => {
    expect.hasAssertions();

    const ids = Array.from({ length: listLength }, () => v7());
    const otherId = v7();
    await insertUsers([...ids, otherId]);

    const users = await mockDatabase.db
      .select({ id: usersInAuth.id })
      .from(usersInAuth)
      .where(notInJsonArray(usersInAuth.id, ids));

    expect(users).toStrictEqual([{ id: otherId }]);
  });
});
