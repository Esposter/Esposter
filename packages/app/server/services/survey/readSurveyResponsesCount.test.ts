import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { readSurveyResponsesCount } from "@@/server/services/survey/readSurveyResponsesCount";
import { createEntity } from "@esposter/db";
import { AzureTable, SurveyResponseEntity } from "@esposter/db-schema";
import { MockTableDatabase } from "azure-mock";
import { afterEach, describe, expect, test } from "vitest";

// Router-level counting is covered in survey.test.ts; the cap needs more rows than callers can
// Affordably create, so the ceiling is proven directly against the table
describe(readSurveyResponsesCount, () => {
  const surveyId = crypto.randomUUID();
  const createSurveyResponses = async (count: number) => {
    const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
    for (let index = 0; index < count; index++)
      await createEntity(
        surveyResponseClient,
        new SurveyResponseEntity({ partitionKey: surveyId, rowKey: crypto.randomUUID() }),
      );
  };

  afterEach(() => {
    MockTableDatabase.clear();
  });

  test("counts survey responses", async () => {
    expect.hasAssertions();

    await createSurveyResponses(1);
    const responseCount = await readSurveyResponsesCount(surveyId);

    expect(responseCount).toStrictEqual({ count: 1, isCapped: false });
  });

  // The ceiling is the dataset's, not a page's — reading it off a page shows a survey between the two as
  // "1000+" here while the Responses blade shows its real total
  test("counts exactly at the dataset ceiling uncapped", async () => {
    expect.hasAssertions();

    await createSurveyResponses(DATASET_MAX_COUNTED_ROWS);
    const responseCount = await readSurveyResponsesCount(surveyId);

    // Exactly-at-cap is still an exact count — only beyond-cap renders the "10000+" form
    expect(responseCount).toStrictEqual({ count: DATASET_MAX_COUNTED_ROWS, isCapped: false });
  });

  test("caps the count beyond the dataset ceiling", async () => {
    expect.hasAssertions();

    await createSurveyResponses(DATASET_MAX_COUNTED_ROWS + 1);
    const responseCount = await readSurveyResponsesCount(surveyId);

    expect(responseCount).toStrictEqual({ count: DATASET_MAX_COUNTED_ROWS, isCapped: true });
  });
});
