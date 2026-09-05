import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { Resource } from "@esposter/db-schema";

import { createContentData } from "@/services/resource/createContentData";
import { createOperationData } from "@/services/shared/createOperationData";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { toRawDeep } from "@esposter/shared";

export const useTodoListStore = defineStore("resource/todoList", () => {
  const resourceStore = useResourceStore();
  const { setPersistedContent, storeContentVersion } = resourceStore;
  const {
    content: todoList,
    loadContent,
    saveContent: saveTodoList,
  } = createContentData<ResourceType.TodoList, TodoListResource>(
    ResourceType.TodoList,
    // Content is parsed from the blob with plain JSON.parse, so the loaded value carries the list's data
    // Shape rather than its class instances. The cast is sound because `toJSON` is the only method these
    // Classes have — pinned by ResourceContent.test-d.ts, which fails the day a second one is added
    (data) => (data as TodoListResource | undefined) ?? { items: [] },
  );
  const items = computed({
    get: () => todoList.value.items,
    set: (newItems) => {
      todoList.value.items = newItems;
    },
  });
  const searchQuery = ref("");
  // Another device saved — adopt its content and contentVersion so this client renders live data
  // And its own next save is not rejected as stale; the adopted content is what is now persisted
  const storeSaveResourceContent = (content: TodoListResource, contentVersion: Resource["contentVersion"]) => {
    todoList.value = content;
    storeContentVersion(contentVersion);
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
    // Where an item sits is content in a list the user ordered, so the unwind owes its index back too. Read
    // Before the removal, and used through a re-created insert rather than createItem, which only appends
    const previousIndex = items.value.findIndex((item) => item.id === id);
    // Whether this is an edit or an add is the list's own answer to "is that item already here?", read from
    // The item in hand — a separately tracked index would still hold the previous edit's row when the dialog
    // Opens straight from the add button, routing that add into an update
    if (isDeleteAction) deleteItem({ id });
    else if (previousItem) updateItem(editedItem.value);
    else createItem(editedItem.value);

    const isSuccessful = await saveTodoList();
    if (isSuccessful) editFormDialog.value = false;
    else if (!previousItem) deleteItem({ id });
    // Clamped to the current length because the list can be shorter by the time the save comes back —
    // `storeSaveResourceContent` adopts another device's content mid-flight, and that content is kept
    else if (isDeleteAction)
      items.value = items.value.toSpliced(Math.min(previousIndex, items.value.length), 0, previousItem);
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
