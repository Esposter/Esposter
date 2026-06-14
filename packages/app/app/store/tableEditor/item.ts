import { createOperationData } from "@/services/shared/createOperationData";
import { useTableEditorStore } from "@/store/tableEditor";

export const useItemStore = defineStore("tableEditor/item", () => {
  const tableEditorStore = useTableEditorStore();
  // Pass a computed state so we seed the initial value from the tableEditor while staying reactive,
  // Notifying the tableEditor whenever an operation runs on our items.
  const { items, ...restData } = useOffsetPaginationData(
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
