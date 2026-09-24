import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";

import { useSheetStore } from "@/store/resource/sheet";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";

// Owns the shared command scaffold: the store wiring, the execute+push tail, and the autosave.
// `createCommand` returns undefined for no-op cases (e.g. target not found), which skips execution entirely.
export const useSheetCommand = <TArgs extends unknown[]>(
  createCommand: (dataSource: DataSource, ...args: TArgs) => ADataSourceCommand | undefined,
) => {
  const sheetStore = useSheetStore();
  const { dataSource } = storeToRefs(sheetStore);
  const { saveSheet } = sheetStore;
  const sheetHistoryStore = useSheetHistoryStore();
  const { push } = sheetHistoryStore;
  return async (...args: TArgs) => {
    const command = createCommand(dataSource.value, ...args);
    if (!command) return;
    command.execute(dataSource.value);
    push(command);
    await saveSheet();
  };
};
