import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { TableEditorConfiguration } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("tableEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["tableEditor"]>;

  beforeAll(async () => {
    const createCaller = createCallerFactory(tableEditorRouter);
    const mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("reads", async () => {
    expect.hasAssertions();

    const tableEditorConfiguration = await caller.readTableEditorConfiguration();
    const { createdAt, id, TodoList, updatedAt, VuetifyComponent } = tableEditorConfiguration;

    expect(tableEditorConfiguration).toStrictEqual(
      new TableEditorConfiguration({
        createdAt,
        id,
        [TableEditorType.TodoList]: Object.assign(TodoList, {
          createdAt: TodoList.createdAt,
          id: TodoList.id,
          updatedAt: TodoList.updatedAt,
        }),
        [TableEditorType.VuetifyComponent]: Object.assign(VuetifyComponent, {
          createdAt: VuetifyComponent.createdAt,
          id: VuetifyComponent.id,
          updatedAt: VuetifyComponent.updatedAt,
        }),
        updatedAt,
      }),
    );
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const tableEditorConfiguration = new TableEditorConfiguration();
    await caller.saveTableEditorConfiguration(tableEditorConfiguration);
    const readTableEditorConfiguration = await caller.readTableEditorConfiguration();

    expect(readTableEditorConfiguration).toStrictEqual(tableEditorConfiguration);
  });
});
