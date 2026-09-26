import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createCallerFactory } from "@@/server/trpc";
import { createSurvey } from "@@/server/trpc/routers/createSurvey.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { setupResourceSuite } from "@@/server/trpc/routers/setupResourceSuite.test";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
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

  test("bakes dataset snapshot into published dashboard", async () => {
    expect.hasAssertions();

    const newSurvey = await createSurvey(surveyCaller, name, {
      model: JSON.stringify({ pages: [{ elements: [{ name, type: "rating" }] }] }),
    });
    await surveyCaller.createSurveyResponse({
      model: { [name]: 0 },
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Dashboard);

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
      rows: [{ [name]: 0 }],
      totalRows: 1,
    });
  });
});
