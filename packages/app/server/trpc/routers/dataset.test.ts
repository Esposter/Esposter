import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { TableEditorConfiguration } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { StringColumn } from "#shared/models/resource/file/column/StringColumn";
import { CsvDataSourceItem } from "#shared/models/resource/file/csv/CsvDataSourceItem";
import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { Row } from "#shared/models/resource/file/datasource/Row";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { datasetRouter } from "@@/server/trpc/routers/dataset";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { AZURE_MAX_PAGE_SIZE, resources, surveys } from "@esposter/db-schema";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("dataset", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["dataset"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  let tableEditorCaller: DecorateRouterRecord<TRPCRouter["tableEditor"]>;
  const name = "name";
  const group = "group";
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
    tableEditorCaller = createCallerFactory(tableEditorRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(surveys);
    await mockContext.db.delete(resources);
  });

  test("reads survey responses dataset", async () => {
    expect.hasAssertions();

    const newSurvey = await surveyCaller.createSurvey({ group, model, name });
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
  });

  test("reads survey responses dataset within the azure page size limit", async () => {
    expect.hasAssertions();

    const newSurvey = await surveyCaller.createSurvey({ group, model, name });
    for (let i = 0; i < AZURE_MAX_PAGE_SIZE + 1; i++)
      await surveyCaller.createSurveyResponse({
        model: { satisfaction: 1 },
        partitionKey: newSurvey.id,
        rowKey: crypto.randomUUID(),
      });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toHaveLength(AZURE_MAX_PAGE_SIZE);
  });

  test("reads survey responses dataset with no responses", async () => {
    expect.hasAssertions();

    const newSurvey = await surveyCaller.createSurvey({ group, model, name });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toStrictEqual([]);
  });

  test("fills missing answers with null", async () => {
    expect.hasAssertions();

    const newSurvey = await surveyCaller.createSurvey({ group, model, name });
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

    const newSurvey = await surveyCaller.createSurvey({ group, model, name });
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

    const newSurvey = await surveyCaller.createSurvey({ group, model, name });
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

  test("reads table document dataset", async () => {
    expect.hasAssertions();

    const newResource = await tableEditorCaller.createResource({ name });
    const configuration = new TableEditorConfiguration();
    configuration[TableEditorType.File].items.push(
      new CsvDataSourceItem({
        dataSource: {
          columns: [new StringColumn({ name: columnName, sourceName: columnName })],
          metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(), name, size: 0 },
          rows: [new Row({ data: { [columnName]: value } })],
          statistics: { columnCount: 1, rowCount: 1, size: 0 },
        },
        name,
      }),
    );
    await tableEditorCaller.saveResourceContent({ content: configuration, contentVersion: 0, id: newResource.id });
    const dataset = await caller.readDataset({ id: newResource.id, type: DatasetProviderType.TableDocument });

    expect(dataset.columns).toStrictEqual([{ name: columnName, type: ColumnType.String }]);
    expect(dataset.rows).toStrictEqual([{ [columnName]: value }]);
  });

  test("reads table document dataset within the azure page size limit", async () => {
    expect.hasAssertions();

    const newResource = await tableEditorCaller.createResource({ name });
    const configuration = new TableEditorConfiguration();
    configuration[TableEditorType.File].items.push(
      new CsvDataSourceItem({
        dataSource: {
          columns: [new StringColumn({ name: columnName, sourceName: columnName })],
          metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(), name, size: 0 },
          rows: Array.from({ length: AZURE_MAX_PAGE_SIZE + 1 }, () => new Row({ data: { [columnName]: value } })),
          statistics: { columnCount: 1, rowCount: AZURE_MAX_PAGE_SIZE + 1, size: 0 },
        },
        name,
      }),
    );
    await tableEditorCaller.saveResourceContent({ content: configuration, contentVersion: 0, id: newResource.id });
    const dataset = await caller.readDataset({ id: newResource.id, type: DatasetProviderType.TableDocument });

    expect(dataset.rows).toHaveLength(AZURE_MAX_PAGE_SIZE);
  });

  test("fails read table document without data source", async () => {
    expect.hasAssertions();

    const newResource = await tableEditorCaller.createResource({ name });
    await tableEditorCaller.saveResourceContent({
      content: new TableEditorConfiguration(),
      contentVersion: 0,
      id: newResource.id,
    });

    await expect(
      caller.readDataset({ id: newResource.id, type: DatasetProviderType.TableDocument }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: NOT_FOUND]`);
  });

  test("fails read table document with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await tableEditorCaller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.readDataset({ id: newResource.id, type: DatasetProviderType.TableDocument }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
