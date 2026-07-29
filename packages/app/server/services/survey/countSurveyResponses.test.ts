import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { countSurveyResponses } from "@@/server/services/survey/countSurveyResponses";
import { createEntity } from "@esposter/db";
import { AZURE_MAX_PAGE_SIZE, AzureTable, SurveyResponseEntity } from "@esposter/db-schema";
import { MockTableDatabase } from "azure-mock";
import { afterEach, describe, expect, test } from "vitest";

// Router-level counting is covered in survey.test.ts; the cap needs more rows than callers can
// Affordably create, so the ceiling is proven directly against the table
describe(countSurveyResponses, () => {
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
    const responseCount = await countSurveyResponses(surveyId);

    expect(responseCount).toStrictEqual({ count: 1, isCapped: false });
  });

  test("counts exactly at the page size ceiling uncapped", async () => {
    expect.hasAssertions();

    await createSurveyResponses(AZURE_MAX_PAGE_SIZE);
    const responseCount = await countSurveyResponses(surveyId);

    // Exactly-at-cap is still an exact count — only beyond-cap renders the "1000+" form
    expect(responseCount).toStrictEqual({ count: AZURE_MAX_PAGE_SIZE, isCapped: false });
  });

  test("caps the count beyond the page size ceiling", async () => {
    expect.hasAssertions();

    await createSurveyResponses(AZURE_MAX_PAGE_SIZE + 1);
    const responseCount = await countSurveyResponses(surveyId);

    expect(responseCount).toStrictEqual({ count: AZURE_MAX_PAGE_SIZE, isCapped: true });
  });
});
