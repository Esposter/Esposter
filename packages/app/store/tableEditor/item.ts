import type { Item } from "@/models/tableEditor/Item";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { createOffsetPaginationData } from "@/services/shared/pagination/offset/createOffsetPaginationData";
import { useTableEditorStore } from "@/store/tableEditor";

export const useItemStore = defineStore("tableEditor/item", () => {
  const tableEditorStore = useTableEditorStore()();
  const { tableEditor } = storeToRefs(tableEditorStore);
  // We want to pass in the initial value from our tableEditor
  // but also keep the reactivity of our operations so we need to
  // pass in a computed state which will notify our tableEditor
  // whenever any operations has been performed on our items
  const { itemList, ...restData } = createOffsetPaginationData<Item>(
    computed({
      get: () => tableEditor.value.items,
      set: (newItems) => {
        tableEditor.value.items = newItems;
      },
    }),
  );
  return {
    ...createOperationData(itemList),
    ...restData,
  };
});
