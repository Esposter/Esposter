import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { Dataset } from "#shared/models/dataset/Dataset";
import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { connectAgentKey } from "#server/services/mcp/connectAgentKey.test";
import { createCallerFactory } from "#server/trpc";
import { mockSessionOnce } from "#server/trpc/context.test";
import {
  createPageDocument,
  createPublishedSurvey,
  createSurveyDocumentWith,
} from "#server/trpc/routers/createSurvey.test";
import { datasetRouter } from "#server/trpc/routers/dataset";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { sheetRouter } from "#server/trpc/routers/sheet";
import { surveyRouter } from "#server/trpc/routers/survey";
import { McpScope } from "#shared/models/auth/McpScope";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { DatabaseEntityType } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { SurveyNodeType } from "vue-survey-engine-headless";

describe("datasetRouter", () => {
  const { getCaller, getMockContext } = setupResourceSuite(datasetRouter);
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["dataset"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  const name = "name";
  const columnName = "columnName";
  const value = "value";
  // One question per column type the document derives, named the least a response key may be
  const document = createSurveyDocumentWith([
    { name: "a", type: SurveyNodeType.Rating },
    { name: "b", type: SurveyNodeType.Boolean },
    { name: "c", type: SurveyNodeType.Text },
  ]);

  beforeAll(() => {
    mockContext = getMockContext();
    caller = getCaller();
    surveyCaller = createCallerFactory(surveyRouter)(mockContext);
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
  });

  afterEach(() => {
    vi.useRealTimers();
    MockTableDatabase.clear();
  });

  const setupSurvey = () => createPublishedSurvey(surveyCaller, name, { document, settings: {} });
  const setupSheet = async (rows: Row[] = [new Row({ data: { [columnName]: value } })]) => {
    const newResource = await sheetCaller.createResource({ name });
    const content: SheetResource = {
      data: {
        columns: [new StringColumn({ name: columnName, sourceName: columnName })],
        metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name, size: 0 },
        rows,
      },
      settings: { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv },
    };
    await sheetCaller.saveResourceContent({ content, contentVersion: 0, id: newResource.id });
    return newResource;
  };
  // A survey response's submission time is its save time, so the clock is pinned to the epoch once the survey is
  // Published — a version published at the epoch is not newer than the epoch its snapshot is read back against
  const submittedAt = new Date(0).toISOString();
  const submittedAtColumn = { name: "submittedAt", title: "Submitted", type: ColumnType.Date };

  test("reads survey responses dataset", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    vi.useFakeTimers({ now: 0 });
    await surveyCaller.createSurveyResponse({
      isDraft: false,
      model: { a: 1, b: true, c: "" },
      pageNo: 0,
      participantToken: "",
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.columns).toStrictEqual([
      submittedAtColumn,
      { name: "a", type: ColumnType.Number },
      { name: "b", type: ColumnType.Boolean },
      { name: "c", type: ColumnType.String },
    ]);
    expect(dataset.rows).toStrictEqual([{ a: 1, b: true, c: "", submittedAt }]);
    expect(dataset.totalRows).toBe(1);
  });

  test("reads survey responses dataset within the azure page size limit", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    await Promise.all(
      Array.from({ length: AZURE_MAX_PAGE_SIZE + 1 }, () =>
        surveyCaller.createSurveyResponse({
          isDraft: false,
          model: { a: 1 },
          pageNo: 0,
          participantToken: "",
          partitionKey: newSurvey.id,
          rowKey: crypto.randomUUID(),
        }),
      ),
    );
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toHaveLength(AZURE_MAX_PAGE_SIZE);
    // The capped read reports the uncapped total so consumers can say what they are not showing
    expect(dataset.totalRows).toBe(AZURE_MAX_PAGE_SIZE + 1);
    // One write per row past the page size, each checked against the published survey: 1.4s alone, but a full-suite
    // Run loads the machine enough to pass the global 30s
  }, 60_000);

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
    vi.useFakeTimers({ now: 0 });
    await surveyCaller.createSurveyResponse({
      isDraft: false,
      model: { a: 1 },
      pageNo: 0,
      participantToken: "",
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toStrictEqual([{ a: 1, b: null, c: null, submittedAt }]);
  });

  test("joins checkbox answers into one cell, with non-string items as json", async () => {
    expect.hasAssertions();

    // A checkbox takes its choices' own values, which are text or a number, so the non-string item is a numeric choice
    const newSurvey = await createPublishedSurvey(surveyCaller, name, {
      document: createPageDocument([
        {
          props: { choices: [{ value: "red" }, { value: 2 }], id: crypto.randomUUID(), name: "c" },
          type: SurveyNodeType.Checkbox,
        },
      ]),
      settings: {},
    });
    vi.useFakeTimers({ now: 0 });
    await surveyCaller.createSurveyResponse({
      isDraft: false,
      model: { c: ["red", 2] },
      pageNo: 0,
      participantToken: "",
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.rows).toStrictEqual([{ c: "red; 2", submittedAt }]);
  });

  test("reserves the submission column name a question takes", async () => {
    expect.hasAssertions();

    const questionDocument = createSurveyDocumentWith([{ name: "submittedAt", type: SurveyNodeType.Text }]);
    const newSurvey = await createPublishedSurvey(surveyCaller, name, { document: questionDocument, settings: {} });
    vi.useFakeTimers({ now: 0 });
    await surveyCaller.createSurveyResponse({
      isDraft: false,
      model: { submittedAt: "answer" },
      pageNo: 0,
      participantToken: "",
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });
    const dataset = await caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses });

    expect(dataset.columns).toStrictEqual([
      { name: "submittedAt_", title: "Submitted", type: ColumnType.Date },
      { name: "submittedAt", type: ColumnType.String },
    ]);
    expect(dataset.rows).toStrictEqual([{ submittedAt: "answer", submittedAt_: submittedAt }]);
  });

  test("fails read survey responses with wrong user", async () => {
    expect.hasAssertions();

    const newSurvey = await setupSurvey();
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.readDataset({ id: newSurvey.id, type: DatasetProviderType.SurveyResponses }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Resource, newSurvey.id).message}]`,
    );
  });

  test("reads file dataset", async () => {
    expect.hasAssertions();

    const newResource = await setupSheet();
    const dataset = await caller.readDataset({ id: newResource.id, type: DatasetProviderType.Sheet });

    expect(dataset.columns).toStrictEqual([{ name: columnName, type: ColumnType.String }]);
    expect(dataset.rows).toStrictEqual([{ [columnName]: value }]);
    expect(dataset.totalRows).toBe(1);
  });

  test("an agent reads a Sheet's rows as one table", async () => {
    expect.hasAssertions();

    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const newResource = await setupSheet();
    const dataset = await callAgentTool<Dataset>("dataset_readDataset", {
      id: newResource.id,
      type: DatasetProviderType.Sheet,
    });

    expect(dataset.columns).toStrictEqual([{ name: columnName, type: ColumnType.String }]);
    expect(dataset.rows).toStrictEqual([{ [columnName]: value }]);
    expect(dataset.totalRows).toBe(1);
  });

  test("reads file dataset within the azure page size limit", async () => {
    expect.hasAssertions();

    const newResource = await setupSheet(
      Array.from({ length: AZURE_MAX_PAGE_SIZE + 1 }, () => new Row({ data: { [columnName]: value } })),
    );
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
});
