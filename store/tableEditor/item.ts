import { IItem } from "@/models/tableEditor/IItem";
import { useTableEditorStore } from "@/store/tableEditor";

export const useItemStore = defineStore("tableEditor/item", () => {
  const tableEditorStore = useTableEditorStore();

  const itemList = ref<IItem[]>([]);
  const pushItemList = (items: IItem[]) => itemList.value.push(...items);

  const itemListNextCursor = ref<string | null>(null);
  const updateItemListNextCursor = (nextCursor: string | null) => {
    itemListNextCursor.value = nextCursor;
  };

  const initialiseItemList = (items: IItem[]) => {
    itemList.value = items;
  };
  const createItem = (newItem: IItem) => {
    itemList.value.push(newItem);
    tableEditorStore.editFormDialog = false;
  };
  const updateItem = (updatedItem: IItem) => {
    const index = itemList.value.findIndex((r) => r.id === updatedItem.id);
    if (index > -1) itemList.value[index] = { ...itemList.value[index], ...updatedItem };
    tableEditorStore.editFormDialog = false;
  };
  const deleteItem = (id: string) => {
    itemList.value = itemList.value.filter((r) => r.id !== id);
    tableEditorStore.editFormDialog = false;
  };

  return {
    itemList,
    pushItemList,
    itemListNextCursor,
    updateItemListNextCursor,
    initialiseItemList,
    createItem,
    updateItem,
    deleteItem,
  };
});
