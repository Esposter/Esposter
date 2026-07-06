import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { TableEditorConfiguration } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic blob-state matrix lives in webpageEditor.test.ts; here only the wiring.
describe("tableEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["tableEditor"]>;

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(tableEditorRouter)(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const tableEditorConfiguration = new TableEditorConfiguration();
    await caller.saveTableEditorConfiguration(tableEditorConfiguration);
    const readTableEditorConfiguration = await caller.readTableEditorConfiguration();

    expect(readTableEditorConfiguration).toStrictEqual(tableEditorConfiguration);
  });
});
