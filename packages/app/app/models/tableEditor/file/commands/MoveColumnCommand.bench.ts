import {
  BENCH_COLUMN_NAMES,
  benchRows1k,
  benchRows10k,
  benchRows100,
  makeBenchItem,
} from "@/composables/tableEditor/file/commands/testUtils.bench";
import { MoveColumnCommand } from "@/models/tableEditor/file/commands/MoveColumnCommand";
import { bench, describe } from "vitest";

// Worst case: move first column to last position
const fromIndex = 0;
const toIndex = BENCH_COLUMN_NAMES.length - 1;
const columnName = BENCH_COLUMN_NAMES[fromIndex] ?? "";
const toColumnName = BENCH_COLUMN_NAMES[toIndex] ?? "";

describe(MoveColumnCommand, () => {
  bench("execute — move col 0→4, 100 rows", () => {
    new MoveColumnCommand(fromIndex, toIndex, columnName, toColumnName).execute(makeBenchItem(benchRows100));
  });

  bench("execute — move col 0→4, 1000 rows", () => {
    new MoveColumnCommand(fromIndex, toIndex, columnName, toColumnName).execute(makeBenchItem(benchRows1k));
  });

  bench("execute — move col 0→4, 10000 rows", () => {
    new MoveColumnCommand(fromIndex, toIndex, columnName, toColumnName).execute(makeBenchItem(benchRows10k));
  });

  bench("undo — move col 0→4 then back, 1000 rows", () => {
    const item = makeBenchItem(benchRows1k);
    const command = new MoveColumnCommand(fromIndex, toIndex, columnName, toColumnName);
    command.execute(item);
    command.undo(item);
  });

  bench("undo — move col 0→4 then back, 10000 rows", () => {
    const item = makeBenchItem(benchRows10k);
    const command = new MoveColumnCommand(fromIndex, toIndex, columnName, toColumnName);
    command.execute(item);
    command.undo(item);
  });
});
