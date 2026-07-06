import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { DatabaseEntityType, documents, DocumentType, surveys } from "@esposter/db-schema";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("dashboard", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  const name = "name";
  const updatedName = "updatedName";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(dashboardRouter)(mockContext);
    surveyCaller = createCallerFactory(surveyRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(documents);
    await mockContext.db.delete(surveys);
  });

  test("creates document", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });

    expect(newDocument.name).toBe(name);
    expect(newDocument.type).toBe(DocumentType.Dashboard);
    expect(newDocument.contentVersion).toBe(0);
    expect(newDocument.publishedAt).toBeNull();
  });

  test("reads documents", async () => {
    expect.hasAssertions();

    const readDocuments = await caller.readDocuments();

    expect(readDocuments.items).toStrictEqual([]);

    const newDocument = await caller.createDocument({ name });
    const newReadDocuments = await caller.readDocuments();

    expect(newReadDocuments.items).toStrictEqual([newDocument]);
  });

  test("updates document", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    const updatedDocument = await caller.updateDocument({ id: newDocument.id, name: updatedName });

    expect(updatedDocument.name).toBe(updatedName);
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.updateDocument({ id: newDocument.id, name: updatedName }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("deletes document", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    const deletedDocument = await caller.deleteDocument({ id: newDocument.id });

    expect(deletedDocument.id).toBe(newDocument.id);

    const readDocuments = await caller.readDocuments();

    expect(readDocuments.items).toStrictEqual([]);
  });

  test("reads undefined content for new document", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    const content = await caller.readDocumentContent({ id: newDocument.id });

    expect(content).toBeUndefined();
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    const updatedDocument = await caller.saveDocumentContent({
      content: dashboard,
      contentVersion: newDocument.contentVersion,
      id: newDocument.id,
    });

    expect(updatedDocument.contentVersion).toBe(1);

    const content = await caller.readDocumentContent({ id: newDocument.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
  });

  test("fails save content with old content version", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    const dashboard = new Dashboard();
    await caller.saveDocumentContent({ content: dashboard, contentVersion: 0, id: newDocument.id });

    await expect(
      caller.saveDocumentContent({ content: dashboard, contentVersion: 0, id: newDocument.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${
        new InvalidOperationError(
          Operation.Update,
          DatabaseEntityType.Document,
          "cannot save document content with old content version",
        ).message
      }]`,
    );
  });

  test("fails save content with wrong user", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.saveDocumentContent({ content: new Dashboard(), contentVersion: 0, id: newDocument.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("publishes and reads published content", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    await caller.saveDocumentContent({ content: dashboard, contentVersion: 0, id: newDocument.id });
    const publishedDocument = await caller.publishDocument({ id: newDocument.id });

    expect(publishedDocument.publishedAt).not.toBeNull();
    expect(publishedDocument.publishVersion).toBe(1);

    const publishedContent = await caller.readPublishedDocumentContent(newDocument.id);

    expect(publishedContent.name).toBe(name);
    expect(publishedContent.content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
  });

  test("fails publish without content", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });

    await expect(caller.publishDocument({ id: newDocument.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${
        new InvalidOperationError(
          Operation.Update,
          DatabaseEntityType.Document,
          "cannot publish document without content",
        ).message
      }]`,
    );
  });

  test("bakes dataset snapshot into published dashboard", async () => {
    expect.hasAssertions();

    const newSurvey = await surveyCaller.createSurvey({
      group: "group",
      model: JSON.stringify({ pages: [{ elements: [{ name: "satisfaction", type: "rating" }], name: "page1" }] }),
      name,
    });
    await surveyCaller.createSurveyResponse({
      model: { satisfaction: 5 },
      partitionKey: newSurvey.id,
      rowKey: crypto.randomUUID(),
    });

    const newDocument = await caller.createDocument({ name });
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
    await caller.saveDocumentContent({ content: dashboard, contentVersion: 0, id: newDocument.id });
    await caller.publishDocument({ id: newDocument.id });
    const publishedContent = await caller.readPublishedDocumentContent(newDocument.id);

    expect(publishedContent.content.visuals[0]?.dataset?.snapshot).toStrictEqual({
      columns: [{ name: "satisfaction", type: ColumnType.Number }],
      rows: [{ satisfaction: 5 }],
    });
  });

  test("unpublishes document", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    await caller.saveDocumentContent({ content: new Dashboard(), contentVersion: 0, id: newDocument.id });
    await caller.publishDocument({ id: newDocument.id });
    const unpublishedDocument = await caller.unpublishDocument({ id: newDocument.id });

    expect(unpublishedDocument.publishedAt).toBeNull();

    await expect(caller.readPublishedDocumentContent(newDocument.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: NOT_FOUND]`,
    );
  });

  test("fails read published content for unpublished document", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });

    await expect(caller.readPublishedDocumentContent(newDocument.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: NOT_FOUND]`,
    );
  });
});
