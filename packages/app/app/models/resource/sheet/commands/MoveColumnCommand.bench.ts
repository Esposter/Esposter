import { benchRows1k, benchRows10k, benchRows100 } from "@/composables/resource/sheet/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { BENCH_COLUMN_NAMES } from "@/composables/resource/sheet/commands/generateBenchRows.bench";
import { MoveColumnCommand } from "@/models/resource/sheet/commands/MoveColumnCommand";
import { bench, describe } from "vitest";

// Worst case: move first column to last position
const fromIndex = 0;
const toIndex = BENCH_COLUMN_NAMES.length - 1;
const columnName = BENCH_COLUMN_NAMES[fromIndex] ?? "";
const toColumnName = BENCH_COLUMN_NAMES[toIndex] ?? "";

describe(MoveColumnCommand, () => {
  bench("execute — move col 0→4, 100 rows", () => {
    new MoveColumnCommand(fromIndex, toIndex, columnName, toColumnName).execute(createBenchDataSource(benchRows100));
  });

  bench("execute — move col 0→4, 1000 rows", () => {
    new MoveColumnCommand(fromIndex, toIndex, columnName, toColumnName).execute(createBenchDataSource(benchRows1k));
  });

  bench("execute — move col 0→4, 10000 rows", () => {
    new MoveColumnCommand(fromIndex, toIndex, columnName, toColumnName).execute(createBenchDataSource(benchRows10k));
  });

  bench("undo — move col 0→4 then back, 1000 rows", () => {
    const dataSource = createBenchDataSource(benchRows1k);
    const command = new MoveColumnCommand(fromIndex, toIndex, columnName, toColumnName);
    command.execute(dataSource);
    command.undo(dataSource);
  });

  bench("undo — move col 0→4 then back, 10000 rows", () => {
    const dataSource = createBenchDataSource(benchRows10k);
    const command = new MoveColumnCommand(fromIndex, toIndex, columnName, toColumnName);
    command.execute(dataSource);
    command.undo(dataSource);
  });
});
