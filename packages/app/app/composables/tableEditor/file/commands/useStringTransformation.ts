import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { BasicStringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/BasicStringTransformationType";
import { StringTransformationCommand } from "@/models/tableEditor/file/commands/StringTransformationCommand";
import { getStringColumnsAffectedCells } from "@/services/tableEditor/file/commands/getStringColumnsAffectedCells";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useStringTransformation = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (stringTransformationType: BasicStringTransformationType) => {
    if (!editedItem.value?.dataSource) return;
    const affectedCells = getStringColumnsAffectedCells(editedItem.value.dataSource);
    if (affectedCells.length === 0) return;
    const command = new StringTransformationCommand(stringTransformationType, affectedCells);
    command.execute(editedItem.value);
    push(command);
  };
};
