import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { datasetRouter } from "@@/server/trpc/routers/dataset";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { DatabaseEntityType, resources } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("datasetRouter", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["dataset"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  const name = "name";
  const columnName = "columnName";
  const value = "value";
  const model = JSON.stringify({
    pages: [
      {
        elements: [
          { name: "satisfaction", type: "rating" },
          { name: "wouldRecommend", type: "boolean" },
          { name: "comments", type: "text" },
        ],
        name: "page1",
      },
    ],
  });

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(datasetRouter)(mockContext);
    surveyCaller = createCallerFactory(surveyRouter)(mockContext);
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(resources);
  });

  const setupSurvey = async () => {
    const newResource = await surveyCaller.createResource({ name });
    await surveyCaller.saveResourceContent({
      content: { model },
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    return newResource;
  };

  test("reads survey responses dataset", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    await surveyCaller.createSurveyResponse({
      model: { comments: "great", satisfaction: 5, wouldRecommend: true },
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.columns).toStrictEqual([
      { name: "satisfaction", type: ColumnType.Number },
      { name: "wouldRecommend", type: ColumnType.Boolean },
      { name: "comments", type: ColumnType.String },
    ]);
    expect(dataset.rows).toStrictEqual([{ comments: "great", satisfaction: 5, wouldRecommend: true }]);
    expect(dataset.totalRows).toBe(1);
  });

  test("reads survey responses dataset within the azure page size limit", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    for (let i = 0; i < AZURE_MAX_PAGE_SIZE + 1; i++)
      await surveyCaller.createSurveyResponse({
        model: { satisfaction: 1 },
        partitionKey: newSurvey.id,
        rowKey: crypto.randomUUID(),
      });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toHaveLength(AZURE_MAX_PAGE_SIZE);
    // The capped read reports the uncapped total so consumers can say what they are not showing
    expect(dataset.totalRows).toBe(AZURE_MAX_PAGE_SIZE + 1);
  });

  test("reads survey responses dataset with no responses", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toStrictEqual([]);
    expect(dataset.totalRows).toBe(0);
  });

  test("fills missing answers with null", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    await surveyCaller.createSurveyResponse({
      model: { satisfaction: 3 },
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toStrictEqual([{ comments: null, satisfaction: 3, wouldRecommend: null }]);
  });

  test("flattens non-primitive answers to json", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    await surveyCaller.createSurveyResponse({
      model: { comments: ["a", "b"] },
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toStrictEqual([{ comments: '["a","b"]', satisfaction: null, wouldRecommend: null }]);
  });

  test("fails read survey responses with wrong user", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails read survey responses with non-existent id", async () => {
    expect.hasAssertions();

    await expect(
      caller.readDataset({ id: crypto.randomUUID(), type: DatasetProviderType.SurveyResponses }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("reads file dataset", async () => {
    expect.hasAssertions();

    const newResource = await sheetCaller.createResource({ name });
    const content: SheetResource = {
      data: {
        columns: [new StringColumn({ name: columnName, sourceName: columnName })],
        metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(), name, size: 0 },
        rows: [new Row({ data: { [columnName]: value } })],
      },
      settings: { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv },
    };
    await sheetCaller.saveResourceContent({ content, contentVersion: 0, id: newResource.id });
    const dataset = await caller.readDataset({ id: newResource.id, type: DatasetProviderType.Sheet });

    expect(dataset.columns).toStrictEqual([{ name: columnName, type: ColumnType.String }]);
    expect(dataset.rows).toStrictEqual([{ [columnName]: value }]);
    expect(dataset.totalRows).toBe(1);
  });

  test("reads file dataset within the azure page size limit", async () => {
    expect.hasAssertions();

    const newResource = await sheetCaller.createResource({ name });
    const content: SheetResource = {
      data: {
        columns: [new StringColumn({ name: columnName, sourceName: columnName })],
        metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(), name, size: 0 },
        rows: Array.from({ length: AZURE_MAX_PAGE_SIZE + 1 }, () => new Row({ data: { [columnName]: value } })),
      },
      settings: { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv },
    };
    await sheetCaller.saveResourceContent({ content, contentVersion: 0, id: newResource.id });
    const dataset = await caller.readDataset({ id: newResource.id, type: DatasetProviderType.Sheet });

    expect(dataset.rows).toHaveLength(AZURE_MAX_PAGE_SIZE);
    // The whole blob is parsed either way, so the uncapped total is always known here
    expect(dataset.totalRows).toBe(AZURE_MAX_PAGE_SIZE + 1);
  });

  test("fails read file dataset without content", async () => {
    expect.hasAssertions();

    const newResource = await sheetCaller.createResource({ name });

    await expect(
      caller.readDataset({ id: newResource.id, type: DatasetProviderType.Sheet }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Resource, newResource.id).message}]`,
    );
  });

  test("fails read file dataset with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await sheetCaller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.readDataset({ id: newResource.id, type: DatasetProviderType.Sheet }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
