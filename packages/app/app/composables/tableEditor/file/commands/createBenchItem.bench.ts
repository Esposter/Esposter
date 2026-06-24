import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { benchColumns } from "@/composables/tableEditor/file/commands/constants.bench";
import { createDataSource } from "@/composables/tableEditor/file/commands/createDataSource.test";

export const createBenchItem = (rows: Row[]) => {
  const item = new CsvDataSourceItem();
  item.dataSource = createDataSource(benchColumns, [...rows]);
  return item;
};
