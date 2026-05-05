import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { getResultAsync } from "@esposter/shared";
import { parseClipboardRows } from "@/services/tableEditor/file/commands/parseClipboardRows";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";

export const usePasteFromClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const createRows = useCreateRows();
  return async () => {
    if (!editedItem.value?.dataSource) return;
    const dataSource = editedItem.value.dataSource;
    await getResultAsync(async () => {
      const text = await window.navigator.clipboard.readText();
      const rows = parseClipboardRows(text, dataSource);
      createRows(rows);
    }).match(
      () => undefined,
      (error) => {
        createAlert(error.message, "error");
      },
    );
  };
};
