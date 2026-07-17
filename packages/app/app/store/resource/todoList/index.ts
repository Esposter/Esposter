import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";

import { createOperationData } from "@/services/shared/createOperationData";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { toRawDeep } from "@esposter/shared";

export const useTodoListStore = defineStore("resource/todoList", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, save } = useResource(() => getRouteParamString(route.params.id));
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
    todoList.value = (data as TodoListResource | undefined) ?? { items: [] };
  };
  const saveTodoList = () => save(todoList.value);
  const { createItem, deleteItem, updateItem } = createOperationData(items, ["id"], "Item");
  const { editedIndex, editedItem, editFormDialog, ...restEditFormData } = createEditFormData(
    computed(() => items.value),
    ["id"],
  );
  // One write path: item edits mutate the content blob, then persist it wholesale (revert on failure).
  // The dialog closes only on success so a failed save/delete keeps the user's draft open for retry.
  const saveItem = async (isDeleteAction?: true) => {
    if (!editedItem.value) return false;

    const snapshot = structuredClone(toRawDeep(todoList.value));

    if (isDeleteAction) deleteItem({ id: editedItem.value.id });
    else if (editedIndex.value > -1) updateItem(editedItem.value);
    else createItem(editedItem.value);

    const isSuccessful = await saveTodoList();
    if (isSuccessful) editFormDialog.value = false;
    else todoList.value = snapshot;
    return isSuccessful;
  };
  return {
    editedIndex,
    editedItem,
    editFormDialog,
    items,
    loadContent,
    ...restEditFormData,
    saveItem,
    saveTodoList,
    searchQuery,
    todoList,
  };
});
