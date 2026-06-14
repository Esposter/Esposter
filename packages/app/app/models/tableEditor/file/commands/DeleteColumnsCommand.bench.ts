import {
  benchColumns,
  benchRows1k,
  benchRows10k,
  benchRows100,
  createBenchItem,
  createBenchItemWithRows,
  createOriginalRowValues,
} from "@/composables/tableEditor/file/commands/testUtils.bench";
import { DeleteColumnsCommand } from "@/models/tableEditor/file/commands/DeleteColumnsCommand";
import { bench, describe } from "vitest";

const createIndexedColumns = (count: number, rows: typeof benchRows1k) =>
  benchColumns.slice(0, count).map((originalColumn, columnIndex) => ({
    columnIndex,
    originalColumn,
    originalRowValues: createOriginalRowValues(rows, originalColumn.name),
  }));

describe(DeleteColumnsCommand, () => {
  bench("execute — delete 1 of 5 columns, 100 rows", () => {
    new DeleteColumnsCommand(createIndexedColumns(1, benchRows100)).execute(createBenchItem(benchRows100));
  });

  bench("execute — delete 1 of 5 columns, 1000 rows", () => {
    new DeleteColumnsCommand(createIndexedColumns(1, benchRows1k)).execute(createBenchItem(benchRows1k));
  });

  bench("execute — delete 1 of 5 columns, 10000 rows", () => {
    new DeleteColumnsCommand(createIndexedColumns(1, benchRows10k)).execute(createBenchItem(benchRows10k));
  });

  bench("execute — delete 3 of 5 columns, 1000 rows", () => {
    new DeleteColumnsCommand(createIndexedColumns(3, benchRows1k)).execute(createBenchItem(benchRows1k));
  });

  bench("execute — delete 3 of 5 columns, 10000 rows", () => {
    new DeleteColumnsCommand(createIndexedColumns(3, benchRows10k)).execute(createBenchItem(benchRows10k));
  });

  bench("undo — restore 1 column into 1000 rows", () => {
    const item = createBenchItem(benchRows1k);
    const command = new DeleteColumnsCommand(createIndexedColumns(1, benchRows1k));
    command.execute(item);
    command.undo(item);
  });

  bench("undo — restore 3 columns into 10000 rows", () => {
    const item = createBenchItemWithRows(benchRows10k);
    const command = new DeleteColumnsCommand(createIndexedColumns(3, benchRows10k));
    command.execute(item);
    command.undo(item);
  });
});
