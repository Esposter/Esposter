import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import {
  benchColumns,
  benchRows1k,
  benchRows10k,
  benchRows100,
} from "@/composables/resource/sheet/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { setupCommandBench } from "@/composables/resource/sheet/commands/setupCommandBench.bench";
import { UpdateColumnCommand } from "@/models/resource/sheet/commands/UpdateColumnCommand";
import { getOriginalRowValues } from "@/services/resource/sheet/getOriginalRowValues";
import { takeOne } from "@esposter/shared";
import { describe } from "vitest";

const originalColumn = takeOne(benchColumns);
const originalName = originalColumn.name;
// The command takes the update as plain data, which is what a structured clone of a column instance is.
const updatedColumn = Object.assign(structuredClone(originalColumn), { name: `${originalName}_renamed` });
// Read once per scale rather than inside every iteration: the command only reads these back on undo, so building
// Them in the callback would time an O(rows) read the command itself never performs.
const originalRowValues100 = getOriginalRowValues(createBenchDataSource(benchRows100), originalName);
const originalRowValues1k = getOriginalRowValues(createBenchDataSource(benchRows1k), originalName);
const originalRowValues10k = getOriginalRowValues(createBenchDataSource(benchRows10k), originalName);
const createRenameCommand = (originalRowValues: ColumnValue[]) => () =>
  new UpdateColumnCommand(originalName, originalColumn, updatedColumn, originalRowValues);

describe(UpdateColumnCommand, () => {
  setupCommandBench("rename column, 100 rows", createRenameCommand(originalRowValues100), () =>
    createBenchDataSource(benchRows100),
  );
  setupCommandBench("rename column, 1000 rows", createRenameCommand(originalRowValues1k), () =>
    createBenchDataSource(benchRows1k),
  );
  setupCommandBench("rename column, 10000 rows", createRenameCommand(originalRowValues10k), () =>
    createBenchDataSource(benchRows10k),
  );
});
