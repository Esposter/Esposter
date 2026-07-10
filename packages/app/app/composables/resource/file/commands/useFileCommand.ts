import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { ADataSourceCommand } from "@/models/resource/file/commands/ADataSourceCommand";

import { useFileStore } from "@/store/resource/file";
import { useFileHistoryStore } from "@/store/resource/file/history";

// Owns the shared command scaffold: the store wiring, the execute+push tail, and the autosave.
// CreateCommand returns undefined for no-op cases (e.g. target not found), which skips execution entirely.
export const useFileCommand = <TArgs extends unknown[]>(
  createCommand: (dataSource: DataSource, ...args: TArgs) => ADataSourceCommand | undefined,
) => {
  const fileStore = useFileStore();
  const { saveFile } = fileStore;
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return async (...args: TArgs) => {
    const command = createCommand(fileStore.dataSource, ...args);
    if (!command) return;
    command.execute(fileStore.dataSource);
    push(command);
    await saveFile();
  };
};
