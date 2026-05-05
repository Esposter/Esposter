import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { copyToClipboard } from "@/services/tableEditor/file/commands/copyToClipboard";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";
import { toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const useCopyToClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async (rowIds?: string[]) => {
    if (!editedItem.value?.dataSource) return;
    await ResultAsync.fromPromise(copyToClipboard(editedItem.value.dataSource, rowIds), toAppError).tapErr((error) => {
      createAlert(error.message, "error");
    });
  };
};
