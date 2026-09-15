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
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { createSurvey } from "@@/server/trpc/routers/createSurvey.test";
import { datasetRouter } from "@@/server/trpc/routers/dataset";
import { setupResourceSuite } from "@@/server/trpc/routers/setupResourceSuite.test";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { DatabaseEntityType } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("datasetRouter", () => {
  const { getCaller, getMockContext } = setupResourceSuite(datasetRouter);
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["dataset"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  const name = "name";
  const columnName = "columnName";
  const value = "value";
  // One element per column type the model derives, named the least a response key may be
  const model = JSON.stringify({
    pages: [
      {
        elements: [
          { name: "a", type: "rating" },
          { name: "b", type: "boolean" },
          { name: "c", type: "text" },
        ],
      },
    ],
  });

  beforeAll(() => {
    mockContext = getMockContext();
    caller = getCaller();
    surveyCaller = createCallerFactory(surveyRouter)(mockContext);
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
  });

  afterEach(() => {
    MockTableDatabase.clear();
  });

  const setupSurvey = () => createSurvey(surveyCaller, name, { model });

  test("reads survey responses dataset", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    await surveyCaller.createSurveyResponse({
      model: { a: 0, b: true, c: "" },
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.columns).toStrictEqual([
      { name: "a", type: ColumnType.Number },
      { name: "b", type: ColumnType.Boolean },
      { name: "c", type: ColumnType.String },
    ]);
    expect(dataset.rows).toStrictEqual([{ a: 0, b: true, c: "" }]);
    expect(dataset.totalRows).toBe(1);
  });

  test("reads survey responses dataset within the azure page size limit", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    for (let i = 0; i < AZURE_MAX_PAGE_SIZE + 1; i++)
      await surveyCaller.createSurveyResponse({
        model: { a: 0 },
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
      model: { a: 0 },
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toStrictEqual([{ a: 0, b: null, c: null }]);
  });

  test("flattens non-primitive answers to json", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    await surveyCaller.createSurveyResponse({
      model: { c: ["", " "] },
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toStrictEqual([{ a: null, b: null, c: JSON.stringify(["", " "]) }]);
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
        metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name, size: 0 },
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
        metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name, size: 0 },
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
