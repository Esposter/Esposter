import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ToData } from "@esposter/shared";

import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { checkRollsOnTick } from "#shared/services/resource/todoList/checkRollsOnTick";
import { createEmptyTodoList } from "#shared/services/resource/todoList/createEmptyTodoList";
import { rollRecurringItem } from "#shared/services/resource/todoList/rollRecurringItem";
import { TodoListSort } from "#src/models/resource/todoList/TodoListSort";
import { createContentData } from "#src/services/resource/createContentData";
import { createEditFormData } from "#src/services/shared/editForm/createEditFormData";
import { getReorderedItems } from "#src/services/shared/getReorderedItems";
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";
import { useResourceStore } from "#src/store/resource/index";
import { ResourceType } from "@esposter/db-schema";
import { normalizeString, omitUndefined } from "@esposter/shared";

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
  const { editedItem, isEditFormDialogOpen, originalItem, ...restEditFormData } = createEditFormData(
    computed(() => items.value),
    ["id"],
  );
  // A confirmed delete from outside the dialog — one todo's context menu, or Delete completed
  const deleteItems = (ids: TodoListItem["id"][]) => {
    items.value = items.value.filter(({ id }) => !ids.includes(id));
    saveTodoList();
  };
  // One write path per action: item edits mutate the content blob, then persist it wholesale. A refused save leaves the
  // Edit on screen, and the dialog closes as the save is sent
  const saveItem = () => {
    const editedValue = editedItem.value;
    if (!editedValue) return;

    // Whether this is an edit or an add is the list's own answer to "is that item already here?", read from the item in
    // Hand — a separately tracked index would still hold the previous edit's row when the dialog opens straight from
    // The Add button, routing that add into an update. A field the dialog left undefined keeps the stored value
    if (originalItem.value) Object.assign(originalItem.value, omitUndefined(editedValue));
    else items.value.push(editedValue);
    saveTodoList();
  };
  // A delete from the dialog, persisted with the list as it stands
  const removeItem = () => {
    if (!editedItem.value) return;

    deleteItems([editedItem.value.id]);
  };
  // A todo added by its name alone, from the field above the list, at the foot of the list as the dialog's add is. A
  // Name of only whitespace, or past the limit the dialog's name field holds, adds nothing and hands the field its text
  // Back through `onRefused`
  const addItem = (name: string, onRefused?: () => void) => {
    const normalizedName = normalizeString(name);
    if (!normalizedName || normalizedName.length > ITEM_NAME_MAX_LENGTH) {
      onRefused?.();
      return;
    }

    items.value.push(new TodoListItem({ name: normalizedName }));
    saveTodoList();
  };
  // One field of one todo written from its row, with no dialog
  const setItemValue = <TKey extends keyof ToData<TodoListItem>>(
    id: TodoListItem["id"],
    key: TKey,
    getValue: (item: ToData<TodoListItem>) => ToData<TodoListItem>[TKey],
  ) => {
    const item = items.value.find((todo) => todo.id === id);
    if (!item) return;

    item[key] = getValue(item);
    saveTodoList();
  };
  const checkIsCompleted = (id: TodoListItem["id"]) => Boolean(items.value.find((item) => item.id === id)?.completedAt);
  // A tick or an untick: completedAt is set to now or cleared — except the tick of a repeating todo, which rolls to its
  // Next due date in the browser's time zone
  const toggleCompleted = (id: TodoListItem["id"]) => {
    const item = items.value.find((todo) => todo.id === id);
    if (!item || !checkRollsOnTick(item)) {
      setItemValue(id, "completedAt", ({ completedAt }) => (completedAt ? undefined : new Date()));
      return;
    }

    rollRecurringItem(item, Intl.DateTimeFormat().resolvedOptions().timeZone);
    saveTodoList();
  };
  const toggleImportant = (id: TodoListItem["id"]) => {
    setItemValue(id, "isImportant", ({ isImportant }) => (isImportant ? undefined : true));
  };
  // Some todos put in a new order, by a drag or a key, each taking the next of the places they held
  const reorderItems = (orderedIds: TodoListItem["id"][]) => {
    items.value = getReorderedItems(items.value, orderedIds);
    saveTodoList();
  };
  // How the viewer sorts the open todos, a view over the list that never reorders it
  const sort = useLocalStorage<TodoListSort>(
    () => LocalStorageKey.TodoListSort(resourceStore.currentResourceId),
    TodoListSort.MyOrder,
  );
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
