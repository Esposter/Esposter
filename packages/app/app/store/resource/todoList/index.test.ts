// @vitest-environment nuxt
import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { Resource } from "@esposter/db-schema";

import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useTodoListStore } from "@/store/resource/todoList";
import { ResourceType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

describe(useTodoListStore, () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const itemName = "item";
  const newItemName = "newItem";
  const createResource = (contentVersion = 0) =>
    ({
      contentVersion,
      id: resourceId,
      name: "name",
      type: ResourceType.TodoList,
      updatedAt: new Date(0),
    }) as Resource;
  let content: TodoListResource;
  let saveResourceContent: ReturnType<typeof vi.fn<() => Resource>>;
  const setupStore = async () => {
    const todoListStore = useTodoListStore();
    await todoListStore.loadContent();
    return todoListStore;
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    useRouter().currentRoute.value.params.id = resourceId;
    content = { items: [new TodoListItem({ name: itemName })] };
    saveResourceContent = vi.fn<() => Resource>(() => createResource(1));
    server.use(
      trpcMsw.resource.readResource.query(() => createResource()),
      trpcMsw.todoList.readResourceContent.query(() => content),
      trpcMsw.todoList.saveResourceContent.mutation(saveResourceContent),
    );
  });

  // Every other content store seeds the dirty check after hydrating, so an unedited save compares equal
  // Instead of bumping contentVersion over the wire for a list nobody changed
  test("skips a save that changed nothing since the load", async () => {
    expect.hasAssertions();

    const { saveTodoList } = await setupStore();
    const isSuccessful = await saveTodoList();

    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  // "Add a todo" seeds the edited item straight from the button rather than through editItem, so an index
  // Left over from the previous edit would route the add into an update of a row that is not in the list
  test("adds a brand new item after an earlier item was edited", async () => {
    expect.hasAssertions();

    const todoListStore = await setupStore();
    const { editItem, saveItem } = todoListStore;
    const { editedItem, items } = storeToRefs(todoListStore);
    await editItem({ id: takeOne(items.value).id });
    editedItem.value = new TodoListItem({ name: newItemName });
    const isSuccessful = await saveItem();

    expect(isSuccessful).toBe(true);
    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName, newItemName]);
  });

  test("edits the item the dialog was opened on", async () => {
    expect.hasAssertions();

    const todoListStore = await setupStore();
    const { editItem, saveItem } = todoListStore;
    const { editedItem, items } = storeToRefs(todoListStore);
    await editItem({ id: takeOne(items.value).id });

    assert.exists(editedItem.value);

    editedItem.value.name = newItemName;
    await saveItem();

    expect(items.value.map(({ name }) => name)).toStrictEqual([newItemName]);
  });

  // The blob is persisted wholesale, so a rejected write has to leave the list showing what the server still
  // Has — and the dialog open, or the user's draft is gone with no way to retry it
  test("reverts the list and keeps the dialog open when the save fails", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.todoList.saveResourceContent.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const todoListStore = await setupStore();
    const { saveItem } = todoListStore;
    const { editedItem, editFormDialog, items } = storeToRefs(todoListStore);
    editedItem.value = new TodoListItem({ name: newItemName });
    editFormDialog.value = true;
    const isSuccessful = await saveItem();

    expect(isSuccessful).toBe(false);
    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName]);
    expect(editFormDialog.value).toBe(true);
  });

  // Another device's save arrives with the content it wrote, so adopting it has to re-seed the dirty check
  // Too — otherwise this client's next save writes that same content straight back
  test("adopts another device's content without writing it back", async () => {
    expect.hasAssertions();

    const todoListStore = await setupStore();
    const { saveTodoList, storeSaveResourceContent } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    storeSaveResourceContent({ items: [new TodoListItem({ name: newItemName })] }, 1);
    const isSuccessful = await saveTodoList();

    expect(items.value.map(({ name }) => name)).toStrictEqual([newItemName]);
    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });
});
