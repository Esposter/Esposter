import type { Item } from "@/models/tableEditor/Item";
import { useTableEditorStore } from "@/store/tableEditor";

export const useItemStore = defineStore("tableEditor/item", () => {
  const tableEditorStore = useTableEditorStore()();

  const pushItemList = (items: Item[]) => {
    tableEditorStore.tableEditor.items.push(...items);
  };

  const initialiseItemList = (items: Item[]) => {
    tableEditorStore.tableEditor.items = items;
  };
  const createItem = (newItem: Item) => {
    tableEditorStore.tableEditor.items.push(newItem);
    tableEditorStore.editFormDialog = false;
  };
  const updateItem = (updatedItem: Item) => {
    const index = tableEditorStore.tableEditor.items.findIndex((r) => r.id === updatedItem.id);
    if (index > -1)
      tableEditorStore.tableEditor.items[index] = {
        ...tableEditorStore.tableEditor.items[index],
        ...updatedItem,
      };
    tableEditorStore.editFormDialog = false;
  };
  const deleteItem = (id: string) => {
    tableEditorStore.tableEditor.items = tableEditorStore.tableEditor.items.filter((r) => r.id !== id);
    tableEditorStore.editFormDialog = false;
  };

  return {
    pushItemList,
    initialiseItemList,
    createItem,
    updateItem,
    deleteItem,
  };
});
