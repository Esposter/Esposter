import { createOperationData } from "@/services/shared/createOperationData";
import { createOffsetPaginationData } from "@/services/shared/pagination/offset/createOffsetPaginationData";
import { useTableEditorStore } from "@/store/tableEditor";

export const useItemStore = defineStore("tableEditor/item", () => {
  const tableEditorStore = useTableEditorStore();
  // We want to pass in the initial value from our tableEditor
  // but also keep the reactivity of our operations so we need to
  // pass in a computed state which will notify our tableEditor
  // whenever any operations has been performed on our items
  const { items, ...restData } = createOffsetPaginationData(
    computed({
      get: () => tableEditorStore.tableEditor.items,
      set: (newItems) => {
        tableEditorStore.tableEditor.items = newItems;
      },
    }),
  );
  return {
    ...createOperationData(items, ["id"], "Item"),
    ...restData,
  };
});
