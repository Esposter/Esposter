import type { Item } from "@/models/tableEditor/Item";
import { useTableEditorStore } from "@/store/tableEditor";

export const useItemStore = defineStore("tableEditor/item", () => {
  const tableEditorStore = useTableEditorStore()();
  const { tableEditor } = storeToRefs(tableEditorStore);

  const pushItemList = (items: Item[]) => {
    tableEditor.value.items.push(...items);
  };
  const initialiseItemList = (items: Item[]) => {
    tableEditor.value.items = items;
  };
  const createItem = (newItem: Item) => {
    tableEditor.value.items.push(newItem);
  };
  const updateItem = (updatedItem: Item) => {
    const index = tableEditor.value.items.findIndex((r) => r.id === updatedItem.id);
    if (index > -1)
      tableEditor.value.items[index] = {
        ...tableEditor.value.items[index],
        ...updatedItem,
      };
  };
  const deleteItem = (id: string) => {
    tableEditor.value.items = tableEditor.value.items.filter((r) => r.id !== id);
  };

  return {
    pushItemList,
    initialiseItemList,
    createItem,
    updateItem,
    deleteItem,
  };
});
