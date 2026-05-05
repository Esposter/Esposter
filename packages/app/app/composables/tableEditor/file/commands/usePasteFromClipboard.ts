import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { parseClipboardRows } from "@/services/tableEditor/file/commands/parseClipboardRows";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";
import { toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const usePasteFromClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const createRows = useCreateRows();
  return async () => {
    if (!editedItem.value?.dataSource) return;
    const dataSource = editedItem.value.dataSource;
    await ResultAsync.fromPromise(window.navigator.clipboard.readText(), toAppError)
      .map((text) => parseClipboardRows(text, dataSource))
      .andTee(createRows)
      .orTee((error) => {
        createAlert(error.message, "error");
      });
  };
};
