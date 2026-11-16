// @vitest-environment nuxt
import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ResourceInResource } from "@esposter/db-schema";

import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceTodoListItems from "#src/components/Resource/TodoList/Items.vue";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useResourceStore } from "#src/store/resource/index";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The completion hold ends at once, so a test reads where the row is when the hold is over without waiting it out
vi.mock(import("@vueuse/core"), async (importOriginal) => ({
  ...(await importOriginal()),
  promiseTimeout: () => Promise.resolve(),
}));

describe("resourceTodoListItems", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  const itemName = "item";
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.TodoList });

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    const content: TodoListResource = { items: [new TodoListItem({ name: itemName })] };
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.todoList.readResourceContent.query(() => content);
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  // The save is held in flight, so the move is shown to come from the tick rather than from the server's answer
  test("a ticked todo moves under Completed while its save is in flight", async () => {
    expect.hasAssertions();

    const { promise, resolve } = Promise.withResolvers<ResourceInResource>();
    trpcMsw.todoList.saveResourceContent.mutation(() => promise);
    const wrapper = await mountSuspended(ResourceTodoListItems);
    await wrapper.get(`[aria-label="${itemName}"]`).trigger("click");
    await flushPromises();
    const completedList = wrapper.find('[aria-label="Completed todos"]');
    const isCompletedListed = completedList.exists() && completedList.text().includes(itemName);
    resolve(createResource(1));
    await flushPromises();

    expect(isCompletedListed).toBe(true);
  });
});
