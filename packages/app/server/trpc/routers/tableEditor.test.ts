import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { TableEditorConfiguration } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { documents, DocumentType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic document-procedure matrix is covered once in dashboard.test.ts;
// Here only the router wiring: document type, content schema and container.
describe("tableEditor", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["tableEditor"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(tableEditorRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(documents);
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newDocument = await caller.createDocument({ name });

    expect(newDocument.type).toBe(DocumentType.Table);

    const tableEditorConfiguration = new TableEditorConfiguration();
    await caller.saveDocumentContent({
      content: tableEditorConfiguration,
      contentVersion: newDocument.contentVersion,
      id: newDocument.id,
    });
    const content = await caller.readDocumentContent({ id: newDocument.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(tableEditorConfiguration)));
  });
});
