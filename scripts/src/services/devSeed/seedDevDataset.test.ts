import { SEED_FRIEND_USER_ID } from "#src/services/devSeed/constants";
import { seedDevDataset } from "#src/services/devSeed/seedDevDataset";
import { StreamTableClient } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, StreamTable, usersInAuth } from "@esposter/db-schema";
import { DRIVEN_USER_ID, ZERO_UUID } from "@esposter/shared";
import { drizzle } from "drizzle-orm/d1";
import { describe, expect, test } from "vitest";

describe(seedDevDataset, () => {
  // A second run of a dataset keyed by fixed identifiers adds no row, so a run that failed partway is finished by the next
  test("a second run leaves the same rows", async () => {
    expect.hasAssertions();

    const { db, streamsDb } = await createMockDb();
    const messageClient = new StreamTableClient(drizzle(streamsDb), StreamTable.Messages);
    const run = () => seedDevDataset({ db, messageClient });
    await run();
    const usersAfterFirstRun = await db.select().from(usersInAuth);
    const roomsAfterFirstRun = await db.select().from(roomsInMessage);
    const messageKeysAfterFirstRun = (await messageClient.list()).map(({ rowKey }) => rowKey);

    await run();

    await expect(db.select().from(usersInAuth)).resolves.toStrictEqual(usersAfterFirstRun);
    await expect(db.select().from(roomsInMessage)).resolves.toStrictEqual(roomsAfterFirstRun);
    expect(usersAfterFirstRun.map(({ id }) => id)).toStrictEqual([DRIVEN_USER_ID, SEED_FRIEND_USER_ID]);
    expect(roomsAfterFirstRun.map(({ id }) => id)).toStrictEqual([ZERO_UUID]);
    expect(messageKeysAfterFirstRun).toHaveLength(1);
    expect((await messageClient.list()).map(({ rowKey }) => rowKey)).toStrictEqual(messageKeysAfterFirstRun);
  });
});
