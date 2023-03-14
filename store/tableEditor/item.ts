import { IItem } from "@/models/tableEditor/IItem";
import { useTableEditorStore } from "@/store/tableEditor";

export const useItemStore = defineStore("tableEditor/item", () => {
  const tableEditorStore = useTableEditorStore();

  const pushItemList = (items: IItem[]) => {
    if (!tableEditorStore.tableEditor) return;
    tableEditorStore.tableEditor.items.push(...items);
  };

  const initialiseItemList = (items: IItem[]) => {
    if (!tableEditorStore.tableEditor) return;
    tableEditorStore.tableEditor.items = items;
  };
  const createItem = (newItem: IItem) => {
    if (!tableEditorStore.tableEditor) return;

    tableEditorStore.tableEditor.items.push(newItem);
    tableEditorStore.editFormDialog = false;
  };
  const updateItem = (updatedItem: IItem) => {
    if (!tableEditorStore.tableEditor) return;

    const index = tableEditorStore.tableEditor.items.findIndex((r) => r.id === updatedItem.id);
    if (index > -1)
      tableEditorStore.tableEditor.items[index] = {
        ...tableEditorStore.tableEditor.items[index],
        ...updatedItem,
      };
    tableEditorStore.editFormDialog = false;
  };
  const deleteItem = (id: string) => {
    if (!tableEditorStore.tableEditor) return;

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
