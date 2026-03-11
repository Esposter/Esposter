import type { DataSourceCommand } from "@/models/tableEditor/file/commands/DataSourceCommand";

import { syncStats } from "@/services/tableEditor/file/syncStats";

export const withSyncStats = (command: DataSourceCommand): DataSourceCommand => ({
  execute: (item) => {
    command.execute(item);
    if (item.dataSource) syncStats(item.dataSource);
  },
  undo: (item) => {
    command.undo(item);
    if (item.dataSource) syncStats(item.dataSource);
  },
});
