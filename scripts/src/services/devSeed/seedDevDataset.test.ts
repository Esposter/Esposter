import { SEED_FRIEND_USER_ID } from "#src/services/devSeed/constants";
import { seedDevDataset } from "#src/services/devSeed/seedDevDataset";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, usersInAuth } from "@esposter/db-schema";
import { DRIVEN_USER_ID, ZERO_UUID } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(seedDevDataset, () => {
  // A second run of a dataset keyed by fixed identifiers adds no row, so a run that failed partway is finished by the next
  test("a second run leaves the same rows", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const run = () => seedDevDataset({ db });
    await run();
    const usersAfterFirstRun = await db.select().from(usersInAuth);
    const roomsAfterFirstRun = await db.select().from(roomsInMessage);

    await run();

    await expect(db.select().from(usersInAuth)).resolves.toStrictEqual(usersAfterFirstRun);
    await expect(db.select().from(roomsInMessage)).resolves.toStrictEqual(roomsAfterFirstRun);
    expect(usersAfterFirstRun.map(({ id }) => id)).toStrictEqual([DRIVEN_USER_ID, SEED_FRIEND_USER_ID]);
    expect(roomsAfterFirstRun.map(({ id }) => id)).toStrictEqual([ZERO_UUID]);
  });
});
