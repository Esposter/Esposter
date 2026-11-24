// @vitest-environment nuxt
import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ResourceInResource } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import { RecurrenceUnit } from "#shared/models/resource/todoList/RecurrenceUnit";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useReadOpenResource } from "#src/composables/resource/useReadOpenResource";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useResourceStore } from "#src/store/resource/index";
import { useTodoListStore } from "#src/store/resource/todoList/index";
import { ResourceType } from "@esposter/db-schema";
import { takeOne, toRawDeep, waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

const setupStore = async () => {
  const todoListStore = useTodoListStore();
  const { loadContent } = todoListStore;
  await loadContent();
  return todoListStore;
};

describe(useTodoListStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  const adoptedItemName = "adoptedItem";
  const itemName = "item";
  const newItemName = "newItem";
  const otherDeviceHash = "other-device-content-hash";
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.TodoList });
  let content: ToData<TodoListResource>;
  let saveResourceContent: ReturnType<typeof vi.fn<() => ResourceInResource>>;

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    content = { items: [new TodoListItem({ name: itemName })] };
    saveResourceContent = vi.fn<() => ResourceInResource>(() => createResource(1));
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), favorite: null, publication: null }));
    trpcMsw.todoList.readResourceContent.query(() => content);
    trpcMsw.todoList.saveResourceContent.mutation(saveResourceContent);
    // The page reads the row before any blade mounts, and a content load reads only the blob
    const { readResource } = useReadOpenResource();
    await readResource();
  });

  // Every other content store seeds the dirty check after hydrating, so an unedited save compares equal
  // Instead of bumping contentVersion over the wire for a list nobody changed
  test("skips a save that changed nothing since the load", async () => {
    expect.hasAssertions();

    const { saveTodoList } = await setupStore();
    saveTodoList();
    await flushPromises();

    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  // Every blade of the list loads on mount, so switching between them must render what the first one read
  test("reads the content once however many blades load it", async () => {
    expect.hasAssertions();

    const readResourceContent = vi.fn<() => ToData<TodoListResource>>(() => content);
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
    saveItem();
    await flushPromises();

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
    saveItem();
    await flushPromises();

    expect(items.value.map(({ name }) => name)).toStrictEqual([newItemName]);
  });

  // A refused save leaves the edit on screen, since the blob write has no entry to take back and the save state reads
  // Failed
  test("keeps a new todo on screen when its save fails", async () => {
    expect.hasAssertions();

    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { saveItem } = todoListStore;
    const { editedItem, items } = storeToRefs(todoListStore);
    editedItem.value = new TodoListItem({ name: newItemName });
    saveItem();
    await flushPromises();

    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName, newItemName]);
  });

  // A refused delete leaves the item off the list, and the other items keep the order they had
  test("keeps a refused delete off the list, with the rest in their order", async () => {
    expect.hasAssertions();

    content = { items: [new TodoListItem({ name: itemName }), new TodoListItem({ name: newItemName })] };
    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { editItem, removeItem } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    await editItem({ id: takeOne(items.value).id });
    removeItem();
    await flushPromises();

    expect(items.value.map(({ name }) => name)).toStrictEqual([newItemName]);
  });

  // Another device's save re-reads the list through the reload every open content store takes, so the list on screen
  // Is the one the blob now holds, and that read re-seeds the dirty check rather than writing the list back
  test("an open todo list re-reads another device's save", async () => {
    expect.hasAssertions();

    const todoListStore = await setupStore();
    const { saveTodoList } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    content = { items: [new TodoListItem({ name: newItemName })] };
    trpcMsw.resource.readResource.query(() => ({
      ...createResource(1),
      contentHash: otherDeviceHash,
      favorite: null,
      publication: null,
    }));
    await useReadOpenResource().readResource();
    await waitForSynchronizedFunctions();
    saveTodoList();
    await flushPromises();

    expect(items.value.map(({ name }) => name)).toStrictEqual([newItemName]);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  // A reload that lands while this client's own save is still in flight. A refused save leaves the reloaded list as it
  // Stands, since restoring the blob it captured would throw the reloaded list away with the failed edit
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
    saveItem();
    await flushPromises();

    expect(items.value.map(({ name }) => name)).toStrictEqual([adoptedItemName]);
  });

  // A row written with no dialog is refused the same way while the list reloads, and the reloaded value is what stands
  // — this write never reached it, so there is nothing of it to put back
  test("keeps a reloaded todo's completion when its row write is refused", async () => {
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
    toggleCompleted(id);
    await flushPromises();

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
    reorderItems(reloadedItems.map(({ id }) => id));
    await flushPromises();

    expect(items.value.map(({ name }) => name)).toStrictEqual([newItemName, itemName]);
  });

  // Keeping mine writes the list on screen over another device's save, as the newest version: the content store that
  // Holds the list is the one that writes it, at the version that save left the resource on
  test("keeps the unsaved list over another device's save, written as the newest version", async () => {
    expect.hasAssertions();

    const todoListStore = await setupStore();
    const { items } = storeToRefs(todoListStore);
    const resourceStore = useResourceStore();
    const { keepUnwrittenContent } = resourceStore;
    const { unwrittenContentResourceId } = storeToRefs(resourceStore);
    const { promise: isKeptSaveReached, resolve: onKeptSaveReached } = Promise.withResolvers<void>();
    const saveKept = vi.fn<(options: { input: { contentVersion: number; id: string } }) => ResourceInResource>(() => {
      onKeptSaveReached();
      return createResource(2);
    });
    trpcMsw.todoList.saveResourceContent.mutation(saveKept);
    items.value = [new TodoListItem({ name: newItemName })];
    unwrittenContentResourceId.value = resourceId;
    trpcMsw.resource.readResource.query(() => ({
      ...createResource(1),
      contentHash: otherDeviceHash,
      favorite: null,
      publication: null,
    }));
    await useReadOpenResource().readResource();
    await keepUnwrittenContent();
    await isKeptSaveReached;
    await flushPromises();

    expect(
      saveKept.mock.calls.map(([{ input }]) => ({ contentVersion: input.contentVersion, id: input.id })),
    ).toStrictEqual([{ contentVersion: 1, id: resourceId }]);
  });

  // The field above the list adds with no dialog to hold a draft, so a refused save has to take the new row back out
  // The field above the list clears as a todo is added, so a name a todo cannot take and a save the server refuses both
  // Hand its text back through `onRefused`, and the refused todo leaves the list
  test("a name the list cannot take hands the field its text back, and a refused add stays in the list", async () => {
    expect.hasAssertions();

    const onRefused = vi.fn<() => void>();
    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { addItem } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    addItem(" ", onRefused);

    expect(onRefused).toHaveBeenCalledExactlyOnceWith();
    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName]);

    addItem(newItemName, onRefused);
    await waitForSynchronizedFunctions();

    expect(onRefused).toHaveBeenCalledExactlyOnceWith();
    expect(items.value.map(({ name }) => name)).toStrictEqual([itemName, newItemName]);
  });

  // A drag writes the content with no dialog, and a refused save leaves the order the drag wrote
  test("keeps the order a refused reorder wrote", async () => {
    expect.hasAssertions();

    content = { items: [new TodoListItem({ name: itemName }), new TodoListItem({ name: newItemName })] };
    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { reorderItems } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    reorderItems(items.value.map(({ id }) => id).toReversed());
    await flushPromises();

    expect(items.value.map(({ name }) => name)).toStrictEqual([newItemName, itemName]);
  });

  // A tick writes the content with no dialog, and a refused save leaves the tick on screen
  test("keeps a todo's tick when its save is refused", async () => {
    expect.hasAssertions();

    trpcMsw.todoList.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const todoListStore = await setupStore();
    const { toggleCompleted } = todoListStore;
    const { items } = storeToRefs(todoListStore);
    toggleCompleted(takeOne(items.value).id);
    await flushPromises();

    expect(takeOne(items.value).completedAt).toBeDefined();
  });

  test("rolls a ticked repeating todo to its next due date, open, with its steps unticked", async () => {
    expect.hasAssertions();

    const dueAt = new Date(0);
    const stepId = v7();
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
    toggleCompleted(takeOne(items.value).id);
    await flushPromises();
    const item = takeOne(items.value);

    expect(item.completedAt).toBeUndefined();
    expect(item.dueAt).toStrictEqual(new Date(Temporal.Duration.from({ days: 7 }).total("milliseconds")));
    expect(item.steps).toStrictEqual([{ id: stepId, name: itemName }]);
  });

  // Deleting every completed todo takes rows from anywhere in the list, and a refused delete leaves them all off it
  test("keeps the rows of a refused multi-delete off the list", async () => {
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
    deleteItems(items.value.filter(({ name }) => name !== newItemName).map(({ id }) => id));
    await flushPromises();

    expect(items.value.map(({ name }) => name)).toStrictEqual([newItemName]);
  });

  // The search is typed against the list on screen, so one carried into another list would hide its todos behind a
  // Query it was never typed for. Coming back to the list it was typed in finds it still there
  test("keeps a search to the list it was typed in", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { applyResource } = resourceStore;
    const firstResource = resource.value;
    assert.exists(firstResource);
    const todoListStore = await setupStore();
    const { searchQuery } = storeToRefs(todoListStore);
    searchQuery.value = itemName;
    applyResource(createResourceListItem({ type: ResourceType.TodoList }), null, null);

    expect(searchQuery.value).toBe("");

    applyResource(firstResource, null, null);

    expect(searchQuery.value).toBe(itemName);
  });
});
