import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { setupResourceSuite } from "@@/server/trpc/routers/setupResourceSuite.test";
import { todoListRouter } from "@@/server/trpc/routers/todoList";
import { ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { beforeAll, describe, expect, test } from "vitest";

describe("todoListRouter", () => {
  const { getCaller } = setupResourceSuite(todoListRouter);
  let caller: DecorateRouterRecord<TRPCRouter["todoList"]>;
  const name = "name";

  beforeAll(() => {
    caller = getCaller();
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.TodoList);

    const todoListResource: TodoListResource = { items: [new TodoListItem({ name })] };
    await caller.saveResourceContent({
      content: todoListResource,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(todoListResource)));
  });
});
