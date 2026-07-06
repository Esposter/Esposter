import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { webpageEditorRouter } from "@@/server/trpc/routers/webpageEditor";
import { DatabaseEntityType, documents, DocumentType } from "@esposter/db-schema";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic document-procedure matrix lives in dashboard.test.ts; here only the wiring.
describe("webpageEditor", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["webpageEditor"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(webpageEditorRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(documents);
  });

  test("creates document", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });

    expect(newDocument.name).toBe(name);
    expect(newDocument.type).toBe(DocumentType.Webpage);
    expect(newDocument.contentVersion).toBe(0);
  });

  test("reads documents", async () => {
    expect.hasAssertions();

    const readDocuments = await caller.readDocuments();

    expect(readDocuments.items).toStrictEqual([]);

    const newDocument = await caller.createDocument({ name });
    const newReadDocuments = await caller.readDocuments();

    expect(newReadDocuments.items).toStrictEqual([newDocument]);
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    const webpageEditor = new WebpageEditor();
    const updatedDocument = await caller.saveDocumentContent({
      content: webpageEditor,
      contentVersion: newDocument.contentVersion,
      id: newDocument.id,
    });

    expect(updatedDocument.contentVersion).toBe(1);

    const content = await caller.readDocumentContent({ id: newDocument.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(webpageEditor)));
  });

  test("fails save content with old content version", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    const webpageEditor = new WebpageEditor();
    await caller.saveDocumentContent({ content: webpageEditor, contentVersion: 0, id: newDocument.id });

    await expect(
      caller.saveDocumentContent({ content: webpageEditor, contentVersion: 0, id: newDocument.id }),
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

  test("fails read content with wrong user", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    await mockSessionOnce(mockContext.db);

    await expect(caller.readDocumentContent({ id: newDocument.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails save content with wrong user", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.saveDocumentContent({ content: new WebpageEditor(), contentVersion: 0, id: newDocument.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
