import { benchRows1k, benchRows10k, benchRows100 } from "@/composables/resource/sheet/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { BENCH_COLUMN_NAMES } from "@/composables/resource/sheet/commands/generateBenchRows.bench";
import { setupCommandBench } from "@/composables/resource/sheet/commands/setupCommandBench.bench";
import { MoveColumnCommand } from "@/models/resource/sheet/commands/MoveColumnCommand";
import { takeOne } from "@esposter/shared";
import { describe } from "vitest";

// Worst case: move the first column to the last position, so every row's data is rebuilt.
const fromIndex = 0;
const toIndex = BENCH_COLUMN_NAMES.length - 1;
const createMoveCommand = () =>
  new MoveColumnCommand(
    fromIndex,
    toIndex,
    takeOne(BENCH_COLUMN_NAMES, fromIndex),
    takeOne(BENCH_COLUMN_NAMES, toIndex),
  );

describe(MoveColumnCommand, () => {
  setupCommandBench("move column 0→4, 100 rows", createMoveCommand, () => createBenchDataSource(benchRows100));
  setupCommandBench("move column 0→4, 1000 rows", createMoveCommand, () => createBenchDataSource(benchRows1k));
  setupCommandBench("move column 0→4, 10000 rows", createMoveCommand, () => createBenchDataSource(benchRows10k));
});
