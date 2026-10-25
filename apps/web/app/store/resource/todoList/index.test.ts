// @vitest-environment nuxt
import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ResourceInResource } from "@esposter/db-schema";

import { RecurrenceUnit } from "#shared/models/resource/todoList/RecurrenceUnit";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { useTodoListStore } from "@/store/resource/todoList";
import { ResourceType } from "@esposter/db-schema";
import { takeOne, toRawDeep } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

const setupStore = async () => {
  const todoListStore = useTodoListStore();
  const { loadContent } = todoListStore;
  await loadContent();
  return todoListStore;
};

describe(useTodoListStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const device = { sessionId: crypto.randomUUID(), userId: crypto.randomUUID() };
  const adoptedItemName = "adoptedItem";
  const itemName = "item";
  const newItemName = "newItem";
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.TodoList });
  let content: TodoListResource;
  let saveResourceContent: ReturnType<typeof vi.fn<() => ResourceInResource>>;

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    content = { items: [new TodoListItem({ name: itemName })] };
    saveResourceContent = vi.fn<() => ResourceInResource>(() => createResource(1));
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.todoList.readResourceContent.query(() => content);
    trpcMsw.todoList.saveResourceContent.mutation(saveResourceContent);
    // The page reads the row before any blade mounts, and a content load reads only the blob
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
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

  // Every blade of the list loads on mount, so switching between them must render what the first one read
  test("reads the content once however many blades load it", async () => {
    expect.hasAssertions();

    const readResourceContent = vi.fn<() => TodoListResource>(() => content);
    trpcMsw.todoList.readResourceContent.query(readResourceContent);
    const { loadContent } = await setupStore();
    await loadContent();

    expect(readResourceContent).toHaveBeenCalledTimes(1);
  });

  // The calendar's double click seeds the edited item straight from the day rather than through editItem, so an index
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

    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { saveItem } = todoListStore;
    const { editedItem, isEditFormDialogOpen, items } = storeToRefs(todoListStore);
    editedItem.value = new TodoListItem({ name: newItemName });
    isEditFormDialogOpen.value = true;
    const isSuccessful = await saveItem();

    expect(isSuccessful).toBe(false);
    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName]);
    expect(isEditFormDialogOpen.value).toBe(true);
  });

  // The list is ordered by the user, so where an item sits is content of its own — a rejected delete that lands
  // Its item back at the end has still lost something, and on a long list it reappears out of sight
  test("puts a rejected delete back at the index it was removed from", async () => {
    expect.hasAssertions();

    content = { items: [new TodoListItem({ name: itemName }), new TodoListItem({ name: newItemName })] };
    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { editItem, saveItem } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    await editItem({ id: takeOne(items.value).id });
    const isSuccessful = await saveItem(true);

    expect(isSuccessful).toBe(false);
    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName, newItemName]);
  });

  // Another device's save re-reads the list through the reload every open content store takes, so the list on screen
  // Is the one the blob now holds, and that read re-seeds the dirty check rather than writing the list back
  test("an open todo list re-reads another device's save", async () => {
    expect.hasAssertions();

    const todoListStore = await setupStore();
    const { saveTodoList } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    content = { items: [new TodoListItem({ name: newItemName })] };
    const resourceStore = useResourceStore();
    const { storeSaveResourceContent } = resourceStore;
    await storeSaveResourceContent({ apiKeyName: "", contentVersion: 1, device });
    const isSuccessful = await saveTodoList();

    expect(items.value.map(({ name }) => name)).toStrictEqual([newItemName]);
    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  // A reload that lands while this client's own save is still in flight. The rollback owes back the item it added and
  // Nothing else — restoring the blob it captured throws the reloaded list away with the failed edit
  test("keeps content reloaded while the save was in flight when that save fails", async () => {
    expect.hasAssertions();

    const todoListStore = await setupStore();
    const { saveItem } = todoListStore;
    const { editedItem, items } = storeToRefs(todoListStore);
    trpcMsw.todoList.saveResourceContent.mutation(async () => {
      content = { items: [new TodoListItem({ name: adoptedItemName })] };
      const resourceStore = useResourceStore();
      const { reloadResourceContent } = resourceStore;
      await reloadResourceContent();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    editedItem.value = new TodoListItem({ name: newItemName });
    const isSuccessful = await saveItem();

    expect(isSuccessful).toBe(false);
    expect(items.value.map(({ name }) => name)).toStrictEqual([adoptedItemName]);
  });

  // A row written with no dialog is refused the same way while the list reloads, and the reloaded value is what stands —
  // This write never reached it, so there is nothing of it to put back
  test("keeps a reloaded todo's value when its row write is refused", async () => {
    expect.hasAssertions();

    const todoListStore = await setupStore();
    const { toggleCompleted } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    const { id } = takeOne(items.value);
    const reloadedItem = new TodoListItem({ completedAt: new Date(0), id, name: itemName });
    trpcMsw.todoList.saveResourceContent.mutation(async () => {
      content = { items: [structuredClone(reloadedItem)] };
      const resourceStore = useResourceStore();
      const { reloadResourceContent } = resourceStore;
      await reloadResourceContent();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const isSuccessful = await toggleCompleted(id);

    expect(isSuccessful).toBe(false);
    expect(takeOne(items.value).completedAt).toStrictEqual(reloadedItem.completedAt);
  });

  test("keeps a reloaded order when a reorder is refused", async () => {
    expect.hasAssertions();

    content = { items: [new TodoListItem({ name: itemName }), new TodoListItem({ name: newItemName })] };
    const todoListStore = await setupStore();
    const { reorderItems } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    const reloadedItems = structuredClone(toRawDeep(items.value)).toReversed();
    trpcMsw.todoList.saveResourceContent.mutation(async () => {
      content = { items: structuredClone(reloadedItems) };
      const resourceStore = useResourceStore();
      const { reloadResourceContent } = resourceStore;
      await reloadResourceContent();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const isSuccessful = await reorderItems(reloadedItems.map(({ id }) => id));

    expect(isSuccessful).toBe(false);
    expect(items.value.map(({ name }) => name)).toStrictEqual([newItemName, itemName]);
  });

  // Keeping mine writes the list on screen over another device's save, as the newest version: the content store that
  // Holds the list is the one that writes it, at the version that save left the resource on
  test("keeps the unsaved list over another device's save, written as the newest version", async () => {
    expect.hasAssertions();

    const todoListStore = await setupStore();
    const { items } = storeToRefs(todoListStore);
    const resourceStore = useResourceStore();
    const { unwrittenContentResourceId } = storeToRefs(resourceStore);
    const saveKept = vi.fn<(options: { input: { contentVersion: number; id: string } }) => ResourceInResource>(() =>
      createResource(2),
    );
    trpcMsw.todoList.saveResourceContent.mutation(saveKept);
    items.value = [new TodoListItem({ name: newItemName })];
    unwrittenContentResourceId.value = resourceId;
    await resourceStore.storeSaveResourceContent({ apiKeyName: "", contentVersion: 1, device });
    await resourceStore.keepUnwrittenContent();

    expect(
      saveKept.mock.calls.map(([{ input }]) => ({ contentVersion: input.contentVersion, id: input.id })),
    ).toStrictEqual([{ contentVersion: 1, id: resourceId }]);
  });

  // The field above the list adds with no dialog to hold a draft, so a refused save has to take the new row back out
  test("takes out a todo added by name when the server refuses it", async () => {
    expect.hasAssertions();

    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { addItem } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    const isSuccessful = await addItem(newItemName);

    expect(isSuccessful).toBe(false);
    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName]);
  });

  // A drag writes the content with no dialog, so a refused save has to put the rows back in the order they had
  test("puts back the order the server refused", async () => {
    expect.hasAssertions();

    content = { items: [new TodoListItem({ name: itemName }), new TodoListItem({ name: newItemName })] };
    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { reorderItems } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    const isSuccessful = await reorderItems(items.value.map(({ id }) => id).toReversed());

    expect(isSuccessful).toBe(false);
    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName, newItemName]);
  });

  // A tick writes the content with no dialog to hold a draft, so a refused save has to leave the row open again
  test("reopens a todo whose completion the server refused", async () => {
    expect.hasAssertions();

    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { toggleCompleted } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    const isSuccessful = await toggleCompleted(takeOne(items.value).id);

    expect(isSuccessful).toBe(false);
    expect(takeOne(items.value).completedAt).toBeUndefined();
  });

  test("rolls a ticked repeating todo to its next due date, open, with its steps unticked", async () => {
    expect.hasAssertions();

    const dueAt = new Date(0);
    const stepId = crypto.randomUUID();
    content = {
      items: [
        new TodoListItem({
          dueAt,
          name: itemName,
          recurrence: { interval: 1, startsAt: dueAt, unit: RecurrenceUnit.Week },
          steps: [{ completedAt: dueAt, id: stepId, name: itemName }],
        }),
      ],
    };
    const todoListStore = await setupStore();
    const { toggleCompleted } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    const isSuccessful = await toggleCompleted(takeOne(items.value).id);
    const item = takeOne(items.value);

    expect(isSuccessful).toBe(true);
    expect(item.completedAt).toBeUndefined();
    expect(item.dueAt).toStrictEqual(new Date(Temporal.Duration.from({ days: 7 }).total("milliseconds")));
    expect(item.steps).toStrictEqual([{ id: stepId, name: itemName }]);
  });

  // Deleting every completed todo takes rows from anywhere in the list, and each refused one goes back where it stood
  test("puts every row of a rejected multi-delete back where it stood", async () => {
    expect.hasAssertions();

    content = {
      items: [
        new TodoListItem({ name: itemName }),
        new TodoListItem({ name: newItemName }),
        new TodoListItem({ name: adoptedItemName }),
      ],
    };
    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { deleteItems } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    const isSuccessful = await deleteItems(items.value.filter(({ name }) => name !== newItemName).map(({ id }) => id));

    expect(isSuccessful).toBe(false);
    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName, newItemName, adoptedItemName]);
  });
});
