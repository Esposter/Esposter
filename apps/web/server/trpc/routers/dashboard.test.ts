import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { createPublishedSurvey, createSurveyDocumentWith } from "#server/trpc/routers/createSurvey.test";
import { dashboardRouter } from "#server/trpc/routers/dashboard";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { surveyRouter } from "#server/trpc/routers/survey";
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { SurveyNodeType } from "headless-survey-engine";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The dashboard-specific wiring, and the transformPublishedContent dataset-snapshot baking.
describe("dashboardRouter", () => {
  const { getCaller, getMockContext } = setupResourceSuite(dashboardRouter);
  let caller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  const name = "name";

  beforeAll(() => {
    caller = getCaller();
    surveyCaller = createCallerFactory(surveyRouter)(getMockContext());
  });

  afterEach(() => {
    MockTableDatabase.clear();
  });

  // The snapshot is a public read, so it carries the columns the chart draws and none of the others the source holds —
  // A chart of one survey question must not publish every other answer
  test("bakes only the columns the visual reads", async () => {
    expect.hasAssertions();

    const unreadName = "unreadName";
    const newSurvey = await createPublishedSurvey(surveyCaller, name, {
      document: createSurveyDocumentWith([
        { name, type: SurveyNodeType.Rating },
        { name: unreadName, type: SurveyNodeType.Text },
      ]),
      settings: {},
    });
    await surveyCaller.createSurveyResponse({
      isDraft: false,
      model: { [name]: 1, [unreadName]: unreadName },
      pageNo: 0,
      participantToken: "",
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const newResource = await caller.createResource({ name });
    const dashboard = new Dashboard({
      visuals: [
        new Visual({
          dataset: {
            query: { series: [{ aggregation: DatasetAggregationType.Count, column: name }], xColumn: name },
            reference: { id: newSurvey.id, type: DatasetProviderType.SurveyResponses },
          },
        }),
      ],
    });
    await caller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(takeOne(publishedContent.content.visuals).dataset?.snapshot).toStrictEqual({
      columns: [{ name, type: ColumnType.Number }],
      rows: [{ [name]: 1 }],
      totalRows: 1,
    });
  });

  // A group's visuals are published as the dashboard's own are, so a binding held inside a group is baked too
  test("bakes a snapshot for a bound visual inside a group", async () => {
    expect.hasAssertions();

    const newSurvey = await createPublishedSurvey(surveyCaller, name, {
      document: createSurveyDocumentWith([{ name, type: SurveyNodeType.Rating }]),
      settings: {},
    });
    await surveyCaller.createSurveyResponse({
      isDraft: false,
      model: { [name]: 1 },
      pageNo: 0,
      participantToken: "",
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const newResource = await caller.createResource({ name });
    const dashboard = new Dashboard({
      visuals: [
        new Visual({
          type: VisualType.Group,
          visuals: [
            new Visual({
              dataset: {
                query: { series: [{ aggregation: DatasetAggregationType.Count, column: name }], xColumn: name },
                reference: { id: newSurvey.id, type: DatasetProviderType.SurveyResponses },
              },
            }),
          ],
        }),
      ],
    });
    await caller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(takeOne(takeOne(publishedContent.content.visuals).visuals ?? []).dataset?.snapshot).toStrictEqual({
      columns: [{ name, type: ColumnType.Number }],
      rows: [{ [name]: 1 }],
      totalRows: 1,
    });
  });
});
