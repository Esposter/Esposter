import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { IndexedColumn } from "@/models/resource/sheet/commands/IndexedColumn";

import {
  benchColumns,
  benchRows1k,
  benchRows10k,
  benchRows100,
} from "@/composables/resource/sheet/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { setupCommandBench } from "@/composables/resource/sheet/commands/setupCommandBench.bench";
import { DeleteColumnsCommand } from "@/models/resource/sheet/commands/DeleteColumnsCommand";
import { getOriginalRowValues } from "@/services/resource/sheet/getOriginalRowValues";
import { describe } from "vitest";

// The command reads its indexed columns and writes only to the data source it executes against, so these are built
// Once per case instead of per iteration — reading a 10000-row column back is work the command itself never does.
const createIndexedColumns = (count: number, rows: Row[]): IndexedColumn[] => {
  const dataSource = createBenchDataSource(rows);
  return benchColumns.slice(0, count).map((originalColumn, columnIndex) => ({
    columnIndex,
    originalColumn,
    originalRowValues: getOriginalRowValues(dataSource, originalColumn.name),
  }));
};
const oneColumn100Rows = createIndexedColumns(1, benchRows100);
const oneColumn1kRows = createIndexedColumns(1, benchRows1k);
const oneColumn10kRows = createIndexedColumns(1, benchRows10k);
const threeColumns1kRows = createIndexedColumns(3, benchRows1k);
const threeColumns10kRows = createIndexedColumns(3, benchRows10k);

describe(DeleteColumnsCommand, () => {
  setupCommandBench(
    "delete 1 of 5 columns, 100 rows",
    () => new DeleteColumnsCommand(oneColumn100Rows),
    () => createBenchDataSource(benchRows100),
  );
  setupCommandBench(
    "delete 1 of 5 columns, 1000 rows",
    () => new DeleteColumnsCommand(oneColumn1kRows),
    () => createBenchDataSource(benchRows1k),
  );
  setupCommandBench(
    "delete 1 of 5 columns, 10000 rows",
    () => new DeleteColumnsCommand(oneColumn10kRows),
    () => createBenchDataSource(benchRows10k),
  );
  setupCommandBench(
    "delete 3 of 5 columns, 1000 rows",
    () => new DeleteColumnsCommand(threeColumns1kRows),
    () => createBenchDataSource(benchRows1k),
  );
  setupCommandBench(
    "delete 3 of 5 columns, 10000 rows",
    () => new DeleteColumnsCommand(threeColumns10kRows),
    () => createBenchDataSource(benchRows10k),
  );
});
