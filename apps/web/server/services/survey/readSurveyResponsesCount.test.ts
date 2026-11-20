import type { MockDatabase } from "@esposter/db-mock";

import { insertSurveyResponses } from "#server/services/survey/insertSurveyResponses.test";
import { readSurveyResponsesCount } from "#server/services/survey/readSurveyResponsesCount";
import { createMockDb } from "@esposter/db-mock";
import { resourcesInResource, ResourceType, surveyResponsesInResource, usersInAuth } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(readSurveyResponsesCount, () => {
  const email = "email";
  const name = "name";
  const surveyId = v7();
  const userId = v7();
  let mockDatabase: MockDatabase;

  const createSurveyResponses = (count: number) =>
    insertSurveyResponses(
      mockDatabase.db,
      Array.from({ length: count }, () => ({
        isDraft: false,
        model: {},
        modelVersion: 0,
        pageNo: 0,
        participantToken: "",
        resourceId: surveyId,
      })),
    );

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    await mockDatabase.db.insert(usersInAuth).values({ email, emailVerified: false, id: userId, name });
    await mockDatabase.db.insert(resourcesInResource).values({ id: surveyId, name, type: ResourceType.Survey, userId });
  });

  afterEach(async () => {
    await mockDatabase.db.delete(surveyResponsesInResource);
  });

  afterAll(async () => {
    await mockDatabase.db.delete(usersInAuth);
  });

  test("counts survey responses", async () => {
    expect.hasAssertions();

    await createSurveyResponses(1);
    const responseCount = await readSurveyResponsesCount(mockDatabase.db, surveyId);

    expect(responseCount).toStrictEqual({ count: 1, isCapped: false });
  });
});
