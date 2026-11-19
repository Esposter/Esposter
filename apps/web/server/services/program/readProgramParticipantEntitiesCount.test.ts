import type { MockDatabase } from "@esposter/db-mock";

import { insertRows } from "#server/services/db/insertRows.test";
import { readProgramParticipantEntitiesCount } from "#server/services/program/readProgramParticipantEntitiesCount";
import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { createMockDb } from "@esposter/db-mock";
import { programParticipantsInResource, resourcesInResource, ResourceType, usersInAuth } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

// The ceiling is proven directly against the table, as the survey count's is: a participant audience past the cap needs
// More rows than a router test can afford to create
describe(readProgramParticipantEntitiesCount, () => {
  const email = "email";
  const name = "name";
  const programId = v7();
  const userId = v7();
  let mockDatabase: MockDatabase;

  const insertParticipants = (count: number) =>
    insertRows(
      mockDatabase.db,
      programParticipantsInResource,
      Array.from({ length: count }, () => ({ keyValue: v7(), publicId: v7(), resourceId: programId, tokenHash: v7() })),
    );

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    await mockDatabase.db.insert(usersInAuth).values({ email, emailVerified: false, id: userId, name });
    await mockDatabase.db
      .insert(resourcesInResource)
      .values({ id: programId, name, type: ResourceType.Program, userId });
  });

  afterEach(async () => {
    await mockDatabase.db.delete(programParticipantsInResource);
  });

  afterAll(async () => {
    await mockDatabase.db.delete(usersInAuth);
  });

  test("counts exactly at the dataset ceiling uncapped", async () => {
    expect.hasAssertions();

    await insertParticipants(DATASET_MAX_COUNTED_ROWS);
    const participantCount = await readProgramParticipantEntitiesCount(mockDatabase.db, programId);

    expect(participantCount).toStrictEqual({ count: DATASET_MAX_COUNTED_ROWS, isCapped: false });
  });

  test("caps the count beyond the dataset ceiling", async () => {
    expect.hasAssertions();

    await insertParticipants(DATASET_MAX_COUNTED_ROWS + 1);
    const participantCount = await readProgramParticipantEntitiesCount(mockDatabase.db, programId);

    expect(participantCount).toStrictEqual({ count: DATASET_MAX_COUNTED_ROWS, isCapped: true });
  });
});
