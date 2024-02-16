import { type Item } from "@/models/tableEditor/Item";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { createOffsetPaginationData } from "@/services/shared/pagination/offset/createOffsetPaginationData";
import { useTableEditorStore } from "@/store/tableEditor";

export const useItemStore = defineStore("tableEditor/item", () => {
  const tableEditorStore = useTableEditorStore()();
  const { tableEditor } = storeToRefs(tableEditorStore);
  const { itemList, ...restData } = createOffsetPaginationData<Item>(tableEditor.value.items);
  return {
    ...createOperationData(itemList),
    ...restData,
  };
});
