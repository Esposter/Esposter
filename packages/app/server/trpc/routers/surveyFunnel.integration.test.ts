import type { ProgramResource } from "#shared/models/resource/program/ProgramResource";
import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import {
  CLOSED_SURVEY_ERROR_REASON,
  INVALID_PARTICIPANT_TOKEN_ERROR_REASON,
} from "@@/server/services/survey/constants";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { AUDIENCE_KEY_COLUMN, createAudienceSheet } from "@@/server/trpc/routers/createAudienceSheet.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { datasetRouter } from "@@/server/trpc/routers/dataset";
import { emailRouter } from "@@/server/trpc/routers/email";
import { programRouter } from "@@/server/trpc/routers/program";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { AzureEntityType, resources, SurveyResponseMode } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterAll, assert, beforeAll, describe, expect, test } from "vitest";

// The composition test for the whole funnel — the per-router suites own the units. Exactly one
// Scenario lives here on purpose; more scenarios belong in those suites.
// Scenario-named describe: there is no single function to reference (a documented deviation).
describe("surveyFunnel", () => {
  let mockContext: Context;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let datasetCaller: DecorateRouterRecord<TRPCRouter["dataset"]>;
  let emailCaller: DecorateRouterRecord<TRPCRouter["email"]>;
  let programCaller: DecorateRouterRecord<TRPCRouter["program"]>;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  const settings = surveySettingsSchema.parse({});
  const satisfaction = "satisfaction";
  const model = JSON.stringify({ pages: [{ elements: [{ name: satisfaction, type: "rating" }], name: "page1" }] });
  // Three customers is the smallest audience exhibiting responded / not-responded / rejected.
  // Address-shaped so the "never leaks the participant list" assertions have a needle worth searching for
  const customers = ["a@a", "b@b", "c@c"];

  beforeAll(async () => {
    mockContext = await createMockContext();
    dashboardCaller = createCallerFactory(dashboardRouter)(mockContext);
    datasetCaller = createCallerFactory(datasetRouter)(mockContext);
    emailCaller = createCallerFactory(emailRouter)(mockContext);
    programCaller = createCallerFactory(programRouter)(mockContext);
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
    surveyCaller = createCallerFactory(surveyRouter)(mockContext);
  });

  afterAll(async () => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(resources);
  });

  test("the whole chain", async () => {
    expect.hasAssertions();

    // 1. The audience — a Sheet of customers, keyed by email
    const sheet = await createAudienceSheet(sheetCaller, "customers", customers);

    // 2. The survey — Identified mode, published
    const survey = await surveyCaller.createResource({ name: "feedback" });
    await surveyCaller.saveResourceContent({
      content: {
        model,
        settings: { ...settings, responseMode: SurveyResponseMode.Identified },
      } satisfies SurveyResource,
      contentVersion: survey.contentVersion,
      id: survey.id,
    });
    await surveyCaller.publishResource({ id: survey.id });

    // 3 + 4. The email and the program binding audience + email + survey
    const email = await emailCaller.createResource({ name: "participant" });
    const program = await programCaller.createResource({ name: "feedback drive" });
    await programCaller.saveResourceContent({
      content: {
        audience: { id: sheet.id, type: DatasetProviderType.Sheet },
        emailId: email.id,
        keyColumn: AUDIENCE_KEY_COLUMN,
        surveyId: survey.id,
      } satisfies ProgramResource,
      contentVersion: program.contentVersion,
      id: program.id,
    });
    const participants = await programCaller.generateProgramParticipants({ id: program.id });

    expect(participants).toHaveLength(customers.length);
    // Re-running the drive after adding customers must never rotate a token already sent out
    await expect(programCaller.generateProgramParticipants({ id: program.id })).resolves.toStrictEqual(participants);

    const [firstParticipant, secondParticipant, silentParticipant] = participants;
    assert.exists(firstParticipant);
    assert.exists(secondParticipant);
    assert.exists(silentParticipant);

    // 5. The respondents — one answers, one token is reused for a resume, one forgery is rejected
    const firstResponse = await surveyCaller.createSurveyResponse({
      model: { [satisfaction]: 0 },
      participantToken: firstParticipant.token,
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });
    const secondResponse = await surveyCaller.createSurveyResponse({
      model: { [satisfaction]: 1 },
      participantToken: secondParticipant.token,
      partitionKey: survey.id,
      rowKey: crypto.randomUUID(),
    });

    await expect(
      surveyCaller.createSurveyResponse({
        model: { [satisfaction]: 1 },
        participantToken: crypto.randomUUID(),
        partitionKey: survey.id,
        rowKey: crypto.randomUUID(),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${
        new InvalidOperationError(
          Operation.Create,
          AzureEntityType.SurveyResponse,
          INVALID_PARTICIPANT_TOKEN_ERROR_REASON,
        ).message
      }]`,
    );

    // 6. The status — 2 of 3 responded, and the third customer shows as added-not-responded
    const { rows: statusRows } = await programCaller.readProgramStatus({ id: program.id });

    expect(statusRows.map(({ isResponded, keyValue }) => ({ isResponded, keyValue }))).toStrictEqual([
      { isResponded: true, keyValue: firstParticipant.keyValue },
      { isResponded: true, keyValue: secondParticipant.keyValue },
      { isResponded: false, keyValue: silentParticipant.keyValue },
    ]);
    await expect(surveyCaller.readSurveyResponsesCount({ id: survey.id })).resolves.toStrictEqual({
      count: 2,
      isCapped: false,
    });

    // The owner removes one response as a test submission, then closes the survey
    await surveyCaller.deleteSurveyResponse({ id: survey.id, rowKey: secondResponse.rowKey });
    const { rows: moderatedStatusRows } = await programCaller.readProgramStatus({ id: program.id });

    expect(moderatedStatusRows.map(({ isResponded }) => isResponded)).toStrictEqual([true, false, false]);

    await surveyCaller.saveResourceContent({
      content: {
        model,
        settings: { ...settings, isAcceptingResponses: false, responseMode: SurveyResponseMode.Identified },
      } satisfies SurveyResource,
      contentVersion: survey.contentVersion + 1,
      id: survey.id,
    });

    // Closing takes effect without re-publishing, so the participant URL stays alive and says so
    await expect(
      surveyCaller.updateSurveyResponse({
        model: { [satisfaction]: 1 },
        modelVersion: firstResponse.modelVersion,
        participantToken: firstParticipant.token,
        partitionKey: survey.id,
        rowKey: firstResponse.rowKey,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${
        new InvalidOperationError(Operation.Create, AzureEntityType.SurveyResponse, CLOSED_SURVEY_ERROR_REASON).message
      }]`,
    );

    const publishedSurvey = await surveyCaller.readPublishedResourceContent(survey.id);

    expect(publishedSurvey.content.settings.isAcceptingResponses).toBe(false);

    // 7. The dashboard — bound to the ProgramStatus dataset, published, and counted
    const statusDataset = await datasetCaller.readDataset({
      id: program.id,
      type: DatasetProviderType.ProgramStatus,
    });

    expect(statusDataset.rows.map(({ responded }) => responded)).toStrictEqual([true, false, false]);

    const dashboard = await dashboardCaller.createResource({ name: "drive results" });
    await dashboardCaller.saveResourceContent({
      content: new Dashboard({
        visuals: [
          new Visual({
            dataset: {
              query: {
                series: [{ aggregation: DatasetAggregationType.Count, column: "responded" }],
                xColumn: "responded",
              },
              reference: { id: program.id, type: DatasetProviderType.ProgramStatus },
            },
          }),
        ],
      }),
      contentVersion: dashboard.contentVersion,
      id: dashboard.id,
    });
    await dashboardCaller.publishResource({ id: dashboard.id });
    const publishedDashboard = await dashboardCaller.readPublishedResourceContent(dashboard.id);
    const snapshot = publishedDashboard.content.visuals[0]?.dataset?.snapshot;

    // The published funnel chart is baked from the identity-free dataset — publishing it cannot
    // Leak who was added
    expect(snapshot?.columns).toStrictEqual([
      { name: "participant", type: ColumnType.String },
      { name: "addedAt", type: ColumnType.Date },
      { name: "responded", type: ColumnType.Boolean },
    ]);
    expect(snapshot?.rows.map(({ responded }) => responded)).toStrictEqual([true, false, false]);

    for (const customer of customers) expect(JSON.stringify(publishedDashboard)).not.toContain(customer);

    // Views count the public reads: the survey's one published read plus the dashboard's
    await expect(dashboardCaller.readResourceViewCount({ id: dashboard.id })).resolves.toBe(1);
    await expect(surveyCaller.readResourceViewCount({ id: survey.id })).resolves.toBe(1);
  });
});
