import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { documentRouter } from "@@/server/trpc/routers/document";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { documents, DocumentType } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("document", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["document"]>;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let tableEditorCaller: DecorateRouterRecord<TRPCRouter["tableEditor"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(documentRouter)(mockContext);
    dashboardCaller = createCallerFactory(dashboardRouter)(mockContext);
    tableEditorCaller = createCallerFactory(tableEditorRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(documents);
  });

  test("reads empty documents", async () => {
    expect.hasAssertions();

    const { items } = await caller.readDocuments();

    expect(items).toStrictEqual([]);
  });

  test("reads documents across every type", async () => {
    expect.hasAssertions();

    const dashboardDocument = await dashboardCaller.createDocument({ name });
    const tableDocument = await tableEditorCaller.createDocument({ name });
    const { items } = await caller.readDocuments();

    expect(items.map(({ id }) => id).sort()).toStrictEqual([dashboardDocument.id, tableDocument.id].sort());
    expect(items.map(({ type }) => type).sort()).toStrictEqual([DocumentType.Dashboard, DocumentType.Table].sort());
  });
});
