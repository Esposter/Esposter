import type { Row } from "#shared/models/resource/file/datasource/Row";

import { CsvDataSourceItem } from "#shared/models/resource/file/csv/CsvDataSourceItem";
import { benchColumns } from "@/composables/tableEditor/file/commands/constants.bench";
import { createDataSource } from "@/composables/tableEditor/file/commands/createDataSource.test";

export const createBenchItemWithRows = (rows: Row[]) => {
  const item = new CsvDataSourceItem();
  item.dataSource = createDataSource(benchColumns, rows);
  return item;
};
