import type { MockDatabase } from "@esposter/db-mock";

import { insertSurveyResponses } from "#server/services/survey/insertSurveyResponses.test";
import { readSurveyResponsesCount } from "#server/services/survey/readSurveyResponsesCount";
import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { createMockDb } from "@esposter/db-mock";
import { ResourceType, resourcesInResource, surveyResponsesInResource, usersInAuth } from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

// Router-level counting is covered in survey.test.ts; the cap needs more rows than callers can afford to create, so the
// Ceiling is proven directly against the table
describe(readSurveyResponsesCount, () => {
  const email = "email";
  const name = "name";
  const surveyId = crypto.randomUUID();
  const userId = crypto.randomUUID();
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

  // The ceiling is the dataset's, not a page's — reading it off a page shows a survey between the two as
  // "1000+" here while the Responses blade shows its real total
  test("counts exactly at the dataset ceiling uncapped", async () => {
    expect.hasAssertions();

    await createSurveyResponses(DATASET_MAX_COUNTED_ROWS);
    const responseCount = await readSurveyResponsesCount(mockDatabase.db, surveyId);

    // Exactly-at-cap is still an exact count — only beyond-cap renders the "10000+" form
    expect(responseCount).toStrictEqual({ count: DATASET_MAX_COUNTED_ROWS, isCapped: false });
  });

  test("caps the count beyond the dataset ceiling", async () => {
    expect.hasAssertions();

    await createSurveyResponses(DATASET_MAX_COUNTED_ROWS + 1);
    const responseCount = await readSurveyResponsesCount(mockDatabase.db, surveyId);

    expect(responseCount).toStrictEqual({ count: DATASET_MAX_COUNTED_ROWS, isCapped: true });
  });
});
