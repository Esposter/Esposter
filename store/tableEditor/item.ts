import { IItem } from "@/models/tableEditor/IItem";

export const useItemStore = defineStore("tableEditor/item", () => {
  const editedItem = ref<IItem | null>(null);

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
  };
  const updateItem = (updatedItem: IItem) => {
    const index = itemList.value.findIndex((r) => r.id === updatedItem.id);
    if (index > -1) itemList.value[index] = { ...itemList.value[index], ...updatedItem };
  };
  const deleteItem = (id: string) => {
    itemList.value = itemList.value.filter((r) => r.id !== id);
  };

  return {
    editedItem,
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
