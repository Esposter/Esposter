import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { resources, ResourceType } from "@esposter/db-schema";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The dashboard-specific wiring, and the transformPublishedContent dataset-snapshot baking.
describe("dashboardRouter", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(dashboardRouter)(mockContext);
    surveyCaller = createCallerFactory(surveyRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(resources);
  });

  test("bakes dataset snapshot into published dashboard", async () => {
    expect.hasAssertions();

    const newSurvey = await surveyCaller.createResource({ name });
    await surveyCaller.saveResourceContent({
      content: {
        model: JSON.stringify({ pages: [{ elements: [{ name: "satisfaction", type: "rating" }], name: "page1" }] }),
      },
      contentVersion: newSurvey.contentVersion,
      id: newSurvey.id,
    });
    await surveyCaller.createSurveyResponse({
      model: { satisfaction: 5 },
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Dashboard);

    const dashboard = new Dashboard({
      visuals: [
        new Visual({
          dataset: {
            query: {
              series: [{ aggregation: DatasetAggregationType.Count, column: "satisfaction" }],
              xColumn: "satisfaction",
            },
            reference: { id: newSurvey.id, type: DatasetProviderType.SurveyResponses },
          },
        }),
      ],
    });
    await caller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.content.visuals[0]?.dataset?.snapshot).toStrictEqual({
      columns: [{ name: "satisfaction", type: ColumnType.Number }],
      rows: [{ satisfaction: 5 }],
      totalRows: 1,
    });
  });
});
