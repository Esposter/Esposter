import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { parseClipboardRows } from "@/services/tableEditor/file/commands/parseClipboardRows";
import { useTableEditorStore } from "@/store/tableEditor";
import { storeToRefs } from "pinia";

export const usePasteFromClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const createRows = useCreateRows();

  return async () => {
    if (!editedItem.value?.dataSource) return;
    const text = await navigator.clipboard.readText();
    const rows = parseClipboardRows(text, editedItem.value.dataSource);
    createRows(rows);
  };
};
