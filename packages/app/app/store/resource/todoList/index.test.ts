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

const setupStore = async () => {
  const todoListStore = useTodoListStore();
  await todoListStore.loadContent();
  return todoListStore;
};

describe(useTodoListStore, () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const adoptedItemName = "adoptedItem";
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

  beforeEach(() => {
    setActivePinia(createPinia());
    useRouter().currentRoute.value.params.id = resourceId;
    content = { items: [new TodoListItem({ name: itemName })] };
    saveResourceContent = vi.fn<() => Resource>(() => createResource(1));
    server.use(
      trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null })),
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

  // The list is ordered by the user, so where an item sits is content of its own — a rejected delete that lands
  // Its item back at the end has still lost something, and on a long list it reappears out of sight
  test("puts a rejected delete back at the index it was removed from", async () => {
    expect.hasAssertions();

    content = { items: [new TodoListItem({ name: itemName }), new TodoListItem({ name: newItemName })] };
    server.use(
      trpcMsw.todoList.saveResourceContent.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const todoListStore = await setupStore();
    const { editItem, saveItem } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    await editItem({ id: takeOne(items.value).id });
    const isSuccessful = await saveItem(true);

    expect(isSuccessful).toBe(false);
    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName, newItemName]);
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

  // That adoption can land while this client's own save is still in flight. The rollback owes back the item it
  // Added and nothing else — restoring the blob it captured throws the adopted list away with the failed edit
  test("keeps content adopted while the save was in flight when that save fails", async () => {
    expect.hasAssertions();

    const todoListStore = await setupStore();
    const { saveItem, storeSaveResourceContent } = todoListStore;
    const { editedItem, items } = storeToRefs(todoListStore);
    server.use(
      trpcMsw.todoList.saveResourceContent.mutation(() => {
        storeSaveResourceContent({ items: [new TodoListItem({ name: adoptedItemName })] }, 1);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    editedItem.value = new TodoListItem({ name: newItemName });
    const isSuccessful = await saveItem();

    expect(isSuccessful).toBe(false);
    expect(items.value.map(({ name }) => name)).toStrictEqual([adoptedItemName]);
  });
});
