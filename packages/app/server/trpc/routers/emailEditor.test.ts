import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { emailEditorRouter } from "@@/server/trpc/routers/emailEditor";
import { documents, DocumentType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic document-procedure matrix is covered once in dashboard.test.ts;
// Here only the router wiring: document type, content schema and container.
describe("emailEditor", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["emailEditor"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(emailEditorRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(documents);
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });

    expect(newDocument.type).toBe(DocumentType.Email);

    // The dataset binding is part of the round-trip so the schema provably preserves it
    const emailEditor = new EmailEditor({
      datasetReference: { id: crypto.randomUUID(), type: DatasetProviderType.SurveyResponses },
    });
    await caller.saveDocumentContent({
      content: emailEditor,
      contentVersion: newDocument.contentVersion,
      id: newDocument.id,
    });
    const content = await caller.readDocumentContent({ id: newDocument.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(emailEditor)));
  });
});
