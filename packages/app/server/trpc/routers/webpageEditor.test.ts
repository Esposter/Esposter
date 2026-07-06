import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { webpageEditorRouter } from "@@/server/trpc/routers/webpageEditor";
import { documents, DocumentType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic document-procedure matrix is covered once in dashboard.test.ts;
// Here only the router wiring: document type, content schema and container.
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

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });

    expect(newDocument.type).toBe(DocumentType.Webpage);

    const webpageEditor = new WebpageEditor();
    await caller.saveDocumentContent({
      content: webpageEditor,
      contentVersion: newDocument.contentVersion,
      id: newDocument.id,
    });
    const content = await caller.readDocumentContent({ id: newDocument.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(webpageEditor)));
  });
});
