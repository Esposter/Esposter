import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";

import { syncStats } from "@/services/tableEditor/file/syncStats";

export const withSyncStats = <T extends ADataSourceCommand>(command: T): T => {
  const execute = command.execute.bind(command);
  const undo = command.undo.bind(command);
  command.execute = (item: ADataSourceItem<DataSourceType>) => {
    execute(item);
    if (item.dataSource) syncStats(item.dataSource);
  };
  command.undo = (item: ADataSourceItem<DataSourceType>) => {
    undo(item);
    if (item.dataSource) syncStats(item.dataSource);
  };
  return command;
};
