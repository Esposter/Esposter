import type { StreamTableEntityMap } from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";

import { SeedRefusal } from "#src/models/devSeed/SeedRefusal";
import {
  DEVELOPMENT_STORAGE_CONNECTION_STRING,
  SEED_DATABASE_NAME,
  SEED_FRIEND_USER_ID,
} from "#src/services/devSeed/constants";
import { seedDevDataset } from "#src/services/devSeed/seedDevDataset";
import { createMockDb } from "@esposter/db-mock";
import { StreamTable, roomsInMessage, usersInAuth } from "@esposter/db-schema";
import { DRIVEN_USER_ID, ZERO_UUID } from "@esposter/shared";
import { MockTableClient } from "azure-mock";
import { describe, expect, test } from "vitest";

// The two message tables as in-memory clients, so the seed writes entities the suite can read back
const createMessageClients = () => ({
  messageAscendingClient: new MockTableClient("", StreamTable.MessagesAscending) as unknown as StreamTableClient<
    StreamTableEntityMap[StreamTable.MessagesAscending]
  >,
  messageClient: new MockTableClient("", StreamTable.Messages) as unknown as StreamTableClient<
    StreamTableEntityMap[StreamTable.Messages]
  >,
});

describe(seedDevDataset, () => {
  // An emulator's table endpoint on this machine is all the gate reads, so no account key is needed
  const RUN_STORAGE_CONNECTION_STRING = "TableEndpoint=http://localhost";
  const SEED_DATABASE_URL = `postgres://localhost/${SEED_DATABASE_NAME}`;
  const DEV_DATABASE_URL = "postgres://localhost/a";
  const DEV_OWNER_USER_ID = crypto.randomUUID();

  const createDevOwnerUser = () => {
    const createdAt = new Date(0);
    return {
      createdAt,
      email: "email",
      emailVerified: true,
      id: DEV_OWNER_USER_ID,
      name: "name",
      updatedAt: createdAt,
    };
  };

  test("a seed aimed at the dev database leaves the dev database untouched", async () => {
    expect.hasAssertions();

    const devDatabase = await createMockDb();
    await devDatabase.insert(usersInAuth).values(createDevOwnerUser());

    const refusal = await seedDevDataset({
      databaseUrl: DEV_DATABASE_URL,
      db: devDatabase,
      storageConnectionString: RUN_STORAGE_CONNECTION_STRING,
      ...createMessageClients(),
    });

    expect(refusal).toBe(SeedRefusal.DevDatabase);
    const devOwnerRows = await devDatabase.select().from(usersInAuth);
    expect(devOwnerRows.map(({ id }) => id)).toStrictEqual([DEV_OWNER_USER_ID]);
  });

  test("a seed aimed at its own database writes the driven user and the friend", async () => {
    expect.hasAssertions();

    const seedDatabase = await createMockDb();

    const refusal = await seedDevDataset({
      databaseUrl: SEED_DATABASE_URL,
      db: seedDatabase,
      storageConnectionString: RUN_STORAGE_CONNECTION_STRING,
      ...createMessageClients(),
    });

    expect(refusal).toBeUndefined();
    const seedUserRows = await seedDatabase.select().from(usersInAuth);
    expect(seedUserRows.map(({ id }) => id)).toStrictEqual([DRIVEN_USER_ID, SEED_FRIEND_USER_ID]);
  });

  test("a seed aimed at the dev database is refused", async () => {
    expect.hasAssertions();

    const seedDatabase = await createMockDb();

    const refusal = await seedDevDataset({
      databaseUrl: DEV_DATABASE_URL,
      db: seedDatabase,
      storageConnectionString: RUN_STORAGE_CONNECTION_STRING,
      ...createMessageClients(),
    });

    expect(refusal).toBe(SeedRefusal.DevDatabase);
    await expect(seedDatabase.select().from(usersInAuth)).resolves.toStrictEqual([]);
    await expect(seedDatabase.select().from(roomsInMessage)).resolves.toStrictEqual([]);
  });

  test("a seed aimed at the default storage emulator is refused", async () => {
    expect.hasAssertions();

    const seedDatabase = await createMockDb();

    const refusal = await seedDevDataset({
      databaseUrl: SEED_DATABASE_URL,
      db: seedDatabase,
      storageConnectionString: DEVELOPMENT_STORAGE_CONNECTION_STRING,
      ...createMessageClients(),
    });

    expect(refusal).toBe(SeedRefusal.DevelopmentStorage);
    await expect(seedDatabase.select().from(usersInAuth)).resolves.toStrictEqual([]);
  });

  // A second run of a dataset keyed by fixed identifiers adds no row, so a run that failed partway is finished by the next
  test("a second run leaves the same rows", async () => {
    expect.hasAssertions();

    const seedDatabase = await createMockDb();
    const messageClients = createMessageClients();
    const run = () =>
      seedDevDataset({
        databaseUrl: SEED_DATABASE_URL,
        db: seedDatabase,
        storageConnectionString: RUN_STORAGE_CONNECTION_STRING,
        ...messageClients,
      });
    await run();
    const usersAfterFirstRun = await seedDatabase.select().from(usersInAuth);
    const roomsAfterFirstRun = await seedDatabase.select().from(roomsInMessage);
    const messagesAfterFirstRun = [];
    for await (const { rowKey } of messageClients.messageClient.listEntities()) messagesAfterFirstRun.push(rowKey);

    await run();

    const messagesAfterSecondRun = [];
    for await (const { rowKey } of messageClients.messageClient.listEntities()) messagesAfterSecondRun.push(rowKey);
    await expect(seedDatabase.select().from(usersInAuth)).resolves.toStrictEqual(usersAfterFirstRun);
    await expect(seedDatabase.select().from(roomsInMessage)).resolves.toStrictEqual(roomsAfterFirstRun);
    expect(roomsAfterFirstRun.map(({ id }) => id)).toStrictEqual([ZERO_UUID]);
    expect(messagesAfterFirstRun).toHaveLength(1);
    expect(messagesAfterSecondRun).toStrictEqual(messagesAfterFirstRun);
  });
});
