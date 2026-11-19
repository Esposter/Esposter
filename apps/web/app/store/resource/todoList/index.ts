import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ToData } from "@esposter/shared";

import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { checkRollsOnTick } from "#shared/services/resource/todoList/checkRollsOnTick";
import { createEmptyTodoList } from "#shared/services/resource/todoList/createEmptyTodoList";
import { rollRecurringItem } from "#shared/services/resource/todoList/rollRecurringItem";
import { TodoListSort } from "#src/models/resource/todoList/TodoListSort";
import { createContentData } from "#src/services/resource/createContentData";
import { createOperationData } from "#src/services/shared/createOperationData";
import { createEditFormData } from "#src/services/shared/editForm/createEditFormData";
import { getReorderedItems } from "#src/services/shared/getReorderedItems";
import { getRestoredItems } from "#src/services/shared/getRestoredItems";
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";
import { useResourceStore } from "#src/store/resource/index";
import { ResourceType } from "@esposter/db-schema";
import { normalizeString, toRawDeep } from "@esposter/shared";

export const useTodoListStore = defineStore("resource/todoList", () => {
  const resourceStore = useResourceStore();
  const {
    content: todoList,
    loadContent,
    saveContent: saveTodoList,
  } = createContentData<typeof ResourceType.TodoList, ToData<TodoListResource>>(
    ResourceType.TodoList,
    // Content is parsed from the blob with plain JSON.parse, so the store holds the list's data shape, which is what
    // The blob carries
    (data) => data ?? createEmptyTodoList(),
  );
  const items = computed({
    get: () => todoList.value.items,
    set: (newItems) => {
      todoList.value.items = newItems;
    },
  });
  // The search is a view over the open list, so it is keyed by that list as the sort is, and a search typed in one list
  // Does not carry into another
  const { data: searchQuery } = useCurrentResourceDataMap("");
  const { createItem, deleteItem, updateItem } = createOperationData(items, ["id"], "Item");
  const { editedItem, isEditFormDialogOpen, originalItem, ...restEditFormData } = createEditFormData(
    computed(() => items.value),
    ["id"],
  );
  // One write path per action: item edits mutate the content blob, then persist it wholesale, and a refused save reverts
  // The item. The dialog closes as the save is sent, so a refused edit is not held open as a draft for a retry.
  const saveItem = () => {
    if (!editedItem.value) return;

    const { id } = editedItem.value;
    // The unwind is this write's own item rather than a copy of the whole blob: another device's save is
    // Reloaded mid-flight, and a blob-wide restore would drop that reloaded
    // Content along with the rejected edit. Cloned before the write because updateItem assigns onto the live
    // Item, and read before it because originalItem is a computed over items
    const previousItem = originalItem.value ? structuredClone(toRawDeep(originalItem.value)) : undefined;
    const writtenTodoList = todoList.value;
    // Whether this is an edit or an add is the list's own answer to "is that item already here?", read from
    // The item in hand — a separately tracked index would still hold the previous edit's row when the dialog
    // Opens straight from the add button, routing that add into an update
    if (previousItem) updateItem(editedItem.value);
    else createItem(editedItem.value);

    saveTodoList(() => {
      // A refused create takes its row back out, and a refused edit puts the item back as it was
      if (!previousItem) deleteItem({ id });
      // Reloaded content never held this edit, so its copy of the item is left as that device saved it
      else if (todoList.value === writtenTodoList) updateItem(previousItem);
    });
  };
  // A delete from the dialog. Where an item sits is content in a list the user ordered, so a refused delete puts it back
  // At the index it held, read before the removal and restored through an insert rather than createItem, which only
  // Appends. Against the list as it stands, so another device's save reloaded mid-flight is kept
  const removeItem = () => {
    if (!editedItem.value) return;

    const { id } = editedItem.value;
    const previousItem = originalItem.value ? structuredClone(toRawDeep(originalItem.value)) : undefined;
    const previousIndex = items.value.findIndex((item) => item.id === id);
    deleteItem({ id });
    saveTodoList(() => {
      if (previousItem) items.value = getRestoredItems(items.value, previousItem, previousIndex);
    });
  };
  // A todo added by its name alone, from the field above the list, at the foot of the list as the dialog's add is. A
  // Name of only whitespace, or past the limit the dialog's name field holds, adds nothing, and a refused save takes
  // The new todo back out
  // `onRefused` hands the field its text back, whether the name is one a todo cannot take or the save is refused
  const addItem = (name: string, onRefused?: () => void) => {
    const normalizedName = normalizeString(name);
    if (!normalizedName || normalizedName.length > ITEM_NAME_MAX_LENGTH) {
      onRefused?.();
      return;
    }

    const item = new TodoListItem({ name: normalizedName });
    createItem(item);
    saveTodoList(() => {
      deleteItem({ id: item.id });
      onRefused?.();
    });
  };
  // One field of one todo written from its row, with no dialog, and a refused save puts back the value it had — unless
  // Another device's content was reloaded mid-flight, which replaces the rows and never held this write
  const setItemValue = <TKey extends keyof ToData<TodoListItem>>(
    id: TodoListItem["id"],
    key: TKey,
    getValue: (item: ToData<TodoListItem>) => ToData<TodoListItem>[TKey],
  ) => {
    const item = items.value.find((todo) => todo.id === id);
    if (!item) return;

    const previousValue = item[key];
    const writtenTodoList = todoList.value;
    item[key] = getValue(item);
    saveTodoList(() => {
      if (todoList.value === writtenTodoList) item[key] = previousValue;
    });
  };
  const checkIsCompleted = (id: TodoListItem["id"]) => Boolean(items.value.find((item) => item.id === id)?.completedAt);
  // A tick or an untick: completedAt is set to now or cleared — except the tick of a repeating todo, which rolls to its
  // Next due date in the browser's time zone. A refused save puts both back, unless another device's content was
  // Reloaded mid-flight
  const toggleCompleted = (id: TodoListItem["id"]) => {
    const item = items.value.find((todo) => todo.id === id);
    if (!item || !checkRollsOnTick(item)) {
      setItemValue(id, "completedAt", ({ completedAt }) => (completedAt ? undefined : new Date()));
      return;
    }

    const { dueAt, steps } = item;
    const writtenTodoList = todoList.value;
    rollRecurringItem(item, Intl.DateTimeFormat().resolvedOptions().timeZone);
    saveTodoList(() => {
      if (todoList.value === writtenTodoList) {
        item.dueAt = dueAt;
        if (steps) item.steps = steps;
      }
    });
  };
  const toggleImportant = (id: TodoListItem["id"]) => {
    setItemValue(id, "isImportant", ({ isImportant }) => (isImportant ? undefined : true));
  };
  // Some todos put in a new order, by a drag or a key, each taking the next of the places they held; a refused save
  // Puts them back in the order they had, over whatever the list holds by then — unless that is another device's
  // Content, reloaded mid-flight, whose order never held this one
  const reorderItems = (orderedIds: TodoListItem["id"][]) => {
    const previousIds = items.value.filter(({ id }) => orderedIds.includes(id)).map(({ id }) => id);
    const writtenTodoList = todoList.value;
    items.value = getReorderedItems(items.value, orderedIds);
    saveTodoList(() => {
      if (todoList.value === writtenTodoList) items.value = getReorderedItems(items.value, previousIds);
    });
  };
  // How the viewer sorts the open todos, a view over the list that never reorders it
  const sort = useLocalStorage<TodoListSort>(
    () => LocalStorageKey.TodoListSort(resourceStore.currentResourceId),
    TodoListSort.MyOrder,
  );
  // A confirmed delete from outside the dialog — one todo's context menu, or Delete completed — putting each refused
  // Row back where it stood, in the order they stood, so every later index lands where it was
  const deleteItems = (ids: TodoListItem["id"][]) => {
    const removedItems = items.value.flatMap((item, index) => (ids.includes(item.id) ? [{ index, item }] : []));
    items.value = items.value.filter(({ id }) => !ids.includes(id));
    saveTodoList(() => {
      for (const { index, item } of removedItems) items.value = getRestoredItems(items.value, item, index);
    });
  };
  return {
    addItem,
    checkIsCompleted,
    deleteItems,
    editedItem,
    isEditFormDialogOpen,
    items,
    loadContent,
    originalItem,
    reorderItems,
    ...restEditFormData,
    removeItem,
    saveItem,
    saveTodoList,
    searchQuery,
    sort,
    todoList,
    toggleCompleted,
    toggleImportant,
  };
});
