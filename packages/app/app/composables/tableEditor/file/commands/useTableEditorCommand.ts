import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";

import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

type EditedDataSourceItem = DataSourceItem & { dataSource: NonNullable<DataSourceItem["dataSource"]> };

// Owns the shared command scaffold: the store wiring, the edited-dataSource guard, and the execute+push tail.
// createCommand returns undefined for no-op cases (e.g. target not found), which skips execution entirely.
export const useTableEditorCommand = <TArgs extends unknown[]>(
  createCommand: (editedItem: EditedDataSourceItem, ...args: TArgs) => ADataSourceCommand | undefined,
) => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (...args: TArgs) => {
    if (!editedItem.value?.dataSource) return;
    const command = createCommand(editedItem.value as EditedDataSourceItem, ...args);
    if (!command) return;
    command.execute(editedItem.value);
    push(command);
  };
};
