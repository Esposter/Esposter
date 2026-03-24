import {
  benchColumns,
  benchRows1k,
  benchRows10k,
  benchRows100,
  makeBenchItem,
  makeBenchItemWithRows,
  makeOriginalRowValues,
} from "@/composables/tableEditor/file/commands/testUtils.bench";
import { DeleteColumnsCommand } from "@/models/tableEditor/file/commands/DeleteColumnsCommand";
import { bench, describe } from "vitest";

const makeIndexedColumns = (count: number, rows: typeof benchRows1k) =>
  benchColumns.slice(0, count).map((originalColumn, columnIndex) => ({
    columnIndex,
    originalColumn,
    originalRowValues: makeOriginalRowValues(rows, originalColumn.name),
  }));

describe(DeleteColumnsCommand, () => {
  bench("execute — delete 1 of 5 columns, 100 rows", () => {
    new DeleteColumnsCommand(makeIndexedColumns(1, benchRows100)).execute(makeBenchItem(benchRows100));
  });

  bench("execute — delete 1 of 5 columns, 1000 rows", () => {
    new DeleteColumnsCommand(makeIndexedColumns(1, benchRows1k)).execute(makeBenchItem(benchRows1k));
  });

  bench("execute — delete 1 of 5 columns, 10000 rows", () => {
    new DeleteColumnsCommand(makeIndexedColumns(1, benchRows10k)).execute(makeBenchItem(benchRows10k));
  });

  bench("execute — delete 3 of 5 columns, 1000 rows", () => {
    new DeleteColumnsCommand(makeIndexedColumns(3, benchRows1k)).execute(makeBenchItem(benchRows1k));
  });

  bench("execute — delete 3 of 5 columns, 10000 rows", () => {
    new DeleteColumnsCommand(makeIndexedColumns(3, benchRows10k)).execute(makeBenchItem(benchRows10k));
  });

  bench("undo — restore 1 column into 1000 rows", () => {
    const item = makeBenchItem(benchRows1k);
    const command = new DeleteColumnsCommand(makeIndexedColumns(1, benchRows1k));
    command.execute(item);
    command.undo(item);
  });

  bench("undo — restore 3 columns into 10000 rows", () => {
    const item = makeBenchItemWithRows(benchRows10k);
    const command = new DeleteColumnsCommand(makeIndexedColumns(3, benchRows10k));
    command.execute(item);
    command.undo(item);
  });
});
