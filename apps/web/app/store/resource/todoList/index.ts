import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { Resource } from "@esposter/db-schema";

import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { TodoListSort } from "@/models/resource/todoList/TodoListSort";
import { createContentData } from "@/services/resource/createContentData";
import { getNextDueAt } from "@/services/resource/todoList/getNextDueAt";
import { createOperationData } from "@/services/shared/createOperationData";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { getReorderedItems } from "@/services/shared/getReorderedItems";
import { getRestoredItems } from "@/services/shared/getRestoredItems";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { normalizeString, toRawDeep } from "@esposter/shared";

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
  const { editedItem, isEditFormDialogOpen, originalItem, ...restEditFormData } = createEditFormData(
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
    const writtenTodoList = todoList.value;
    // Whether this is an edit or an add is the list's own answer to "is that item already here?", read from
    // The item in hand — a separately tracked index would still hold the previous edit's row when the dialog
    // Opens straight from the add button, routing that add into an update
    if (isDeleteAction) deleteItem({ id });
    else if (previousItem) updateItem(editedItem.value);
    else createItem(editedItem.value);

    const isSuccessful = await saveTodoList();
    if (isSuccessful) isEditFormDialogOpen.value = false;
    else if (!previousItem) deleteItem({ id });
    // Against the list as it stands — `storeSaveResourceContent` adopts another device's content mid-flight, and
    // That content is kept
    else if (isDeleteAction) items.value = getRestoredItems(items.value, previousItem, previousIndex);
    // Adopted content never held this edit, so its copy of the item is left as that device saved it
    else if (todoList.value === writtenTodoList) updateItem(previousItem);
    return isSuccessful;
  };
  // A todo added by its name alone, from the field above the list, at the foot of the list as the dialog's add is. A name
  // Of only whitespace, or past the limit the dialog's name field holds, adds nothing, and a refused save takes the new todo back out
  const addItem = async (name: string) => {
    const normalizedName = normalizeString(name);
    if (!normalizedName || normalizedName.length > ITEM_NAME_MAX_LENGTH) return false;

    const item = new TodoListItem({ name: normalizedName });
    createItem(item);
    const isSuccessful = await saveTodoList();
    if (!isSuccessful) deleteItem({ id: item.id });
    return isSuccessful;
  };
  // One field of one todo written from its row, with no dialog, and a refused save puts back the value it had — unless
  // Another device's content was adopted mid-flight, which replaces the rows and never held this write
  const setItemValue = async <TKey extends keyof TodoListItem>(
    id: TodoListItem["id"],
    key: TKey,
    getValue: (item: TodoListItem) => TodoListItem[TKey],
  ) => {
    const item = items.value.find((todo) => todo.id === id);
    if (!item) return false;

    const previousValue = item[key];
    const writtenTodoList = todoList.value;
    item[key] = getValue(item);
    const isSuccessful = await saveTodoList();
    if (!isSuccessful && todoList.value === writtenTodoList) item[key] = previousValue;
    return isSuccessful;
  };
  // A tick or an untick: completedAt is set to now or cleared — except the tick of a repeating todo, which stays open and
  // Rolls to its next due date in the browser's time zone with its steps unticked, as Microsoft To Do and Todoist do. A
  // Refused save puts both back, unless another device's content was adopted mid-flight
  const toggleCompleted = async (id: TodoListItem["id"]) => {
    const item = items.value.find((todo) => todo.id === id);
    if (!item?.recurrence || !item.dueAt || item.completedAt)
      return setItemValue(id, "completedAt", ({ completedAt }) => (completedAt ? undefined : new Date()));

    const { dueAt, recurrence, steps } = item;
    const writtenTodoList = todoList.value;
    item.dueAt = getNextDueAt(dueAt, recurrence, Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (steps) item.steps = steps.map(({ id: stepId, name }) => ({ id: stepId, name }));
    const isSuccessful = await saveTodoList();
    if (!isSuccessful && todoList.value === writtenTodoList) {
      item.dueAt = dueAt;
      if (steps) item.steps = steps;
    }
    return isSuccessful;
  };
  const toggleImportant = (id: TodoListItem["id"]) =>
    setItemValue(id, "isImportant", ({ isImportant }) => (isImportant ? undefined : true));
  // Some todos put in a new order, by a drag or a key, each taking the next of the places they held; a refused save puts
  // Them back in the order they had, over whatever the list holds by then — unless that is another device's content,
  // Adopted mid-flight, whose order never held this one
  const reorderItems = async (orderedIds: TodoListItem["id"][]) => {
    const previousIds = items.value.filter(({ id }) => orderedIds.includes(id)).map(({ id }) => id);
    const writtenTodoList = todoList.value;
    items.value = getReorderedItems(items.value, orderedIds);
    const isSuccessful = await saveTodoList();
    if (!isSuccessful && todoList.value === writtenTodoList) items.value = getReorderedItems(items.value, previousIds);
    return isSuccessful;
  };
  // How the viewer sorts the open todos, a view over the list that never reorders it
  const sort = useLocalStorage<TodoListSort>(
    () => LocalStorageKey.TodoListSort(resourceStore.currentResourceId),
    TodoListSort.MyOrder,
  );
  // A confirmed delete from outside the dialog — one todo's context menu, or Delete completed — putting each refused
  // Row back where it stood, in the order they stood, so every later index lands where it was
  const deleteItems = async (ids: TodoListItem["id"][]) => {
    const removedItems = items.value.flatMap((item, index) => (ids.includes(item.id) ? [{ index, item }] : []));
    items.value = items.value.filter(({ id }) => !ids.includes(id));
    const isSuccessful = await saveTodoList();
    if (!isSuccessful)
      for (const { index, item } of removedItems) items.value = getRestoredItems(items.value, item, index);
    return isSuccessful;
  };
  return {
    addItem,
    deleteItems,
    editedItem,
    isEditFormDialogOpen,
    items,
    loadContent,
    originalItem,
    reorderItems,
    ...restEditFormData,
    saveItem,
    saveTodoList,
    searchQuery,
    sort,
    storeSaveResourceContent,
    todoList,
    toggleCompleted,
    toggleImportant,
  };
});
