import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { TableEditorConfiguration } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { beforeEach, describe, expect, test } from "vitest";

describe("tableEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["tableEditor"]>;

  beforeEach(() => {
    const createCaller = createCallerFactory(tableEditorRouter);
    const mockContext = createMockContext();
    caller = createCaller(mockContext);
  });

  test("read", async () => {
    expect.hasAssertions();

    const tableEditorConfiguration = await caller.readTableEditorConfiguration();
    const { createdAt, id } = tableEditorConfiguration;

    expect(tableEditorConfiguration).toStrictEqual(
      new TableEditorConfiguration({ createdAt, id, updatedAt: createdAt }),
    );
  });

  test.todo("save and read", async () => {
    expect.hasAssertions();

    const tableEditorConfiguration = new TableEditorConfiguration();
    await caller.saveTableEditorConfiguration(tableEditorConfiguration);
    const readTableEditorConfiguration = await caller.readTableEditorConfiguration();

    expect(readTableEditorConfiguration).toStrictEqual(tableEditorConfiguration);
  });
});
