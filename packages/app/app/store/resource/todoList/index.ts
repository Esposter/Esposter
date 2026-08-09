import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { Resource, ResourceType } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { toRawDeep } from "@esposter/shared";

export const useTodoListStore = defineStore("resource/todoList", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save, setPersistedContent } = useResource<ResourceType.TodoList>(() =>
    getRouteParamString(route.params.id),
  );
  const todoList = ref<TodoListResource>({ items: [] });
  const items = computed({
    get: () => todoList.value.items,
    set: (newItems) => {
      todoList.value.items = newItems;
    },
  });
  const searchQuery = ref("");
  const loadContent = async () => {
    await load();
    const data = await readContent();
    // Content crosses the wire as plain JSON, so the loaded value carries the list's data shape rather than
    // Its class instances — the two differ only by the methods ToData strips. See the sweep ledger
    todoList.value = (data as TodoListResource | undefined) ?? { items: [] };
    // Seed the dirty check so a save that changed nothing compares equal instead of bumping contentVersion
    setPersistedContent(todoList.value);
  };
  const saveTodoList = () => save(todoList.value);
  // Another device saved — adopt its content and contentVersion so this client renders live data
  // And its own next save is not rejected as stale; the adopted content is what is now persisted
  const storeSaveResourceContent = (content: TodoListResource, contentVersion: Resource["contentVersion"]) => {
    todoList.value = content;
    if (resource.value) resource.value.contentVersion = contentVersion;
    setPersistedContent(content);
  };
  const { createItem, deleteItem, updateItem } = createOperationData(items, ["id"], "Item");
  const { editedItem, editFormDialog, originalItem, ...restEditFormData } = createEditFormData(
    computed(() => items.value),
    ["id"],
  );
  // One write path: item edits mutate the content blob, then persist it wholesale (revert on failure).
  // The dialog closes only on success so a failed save/delete keeps the user's draft open for retry.
  const saveItem = async (isDeleteAction?: true) => {
    if (!editedItem.value) return false;

    const { id } = editedItem.value;
    // The unwind is this write's own item rather than a copy of the whole blob: another device's save is
    // Adopted mid-flight through storeSaveResourceContent, and a blob-wide restore would drop that adopted
    // Content along with the rejected edit. Cloned before the write because updateItem assigns onto the live
    // Item, and read before it because originalItem is a computed over items
    const previousItem = originalItem.value ? structuredClone(toRawDeep(originalItem.value)) : undefined;

    // Whether this is an edit or an add is the list's own answer to "is that item already here?", read from
    // The item in hand — a separately tracked index would still hold the previous edit's row when the dialog
    // Opens straight from the add button, routing that add into an update
    if (isDeleteAction) deleteItem({ id });
    else if (previousItem) updateItem(editedItem.value);
    else createItem(editedItem.value);

    const isSuccessful = await saveTodoList();
    if (isSuccessful) editFormDialog.value = false;
    else if (!previousItem) deleteItem({ id });
    // A rejected delete lands its item back at the end of the list, which costs it its place — cheaper than
    // Discarding whatever the adopted content brought with it
    else if (isDeleteAction) createItem(previousItem);
    else updateItem(previousItem);
    return isSuccessful;
  };
  return {
    editedItem,
    editFormDialog,
    items,
    loadContent,
    originalItem,
    ...restEditFormData,
    saveItem,
    saveTodoList,
    searchQuery,
    storeSaveResourceContent,
    todoList,
  };
});
