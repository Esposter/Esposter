import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { copyToClipboard } from "@/services/tableEditor/file/commands/copyToClipboard";
import { useTableEditorStore } from "@/store/tableEditor";
import { storeToRefs } from "pinia";

export const useCopyToClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);

  return (rowIds?: string[]) => {
    if (!editedItem.value?.dataSource) return;
    return copyToClipboard(editedItem.value.dataSource, rowIds);
  };
};
