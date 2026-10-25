import { UpdateColumnCommand } from "#shared/models/resource/sheet/commands/UpdateColumnCommand";
import {
  benchColumns,
  benchRows1k,
  benchRows10k,
  benchRows100,
} from "@/composables/resource/sheet/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { setupCommandBench } from "@/composables/resource/sheet/commands/setupCommandBench.bench";
import { takeOne } from "@esposter/shared";
import { describe } from "vitest";

const originalColumn = takeOne(benchColumns);
const originalName = originalColumn.name;
// The command takes the update as plain data, which is what a structured clone of a column instance is.
const updatedColumn = Object.assign(structuredClone(originalColumn), { name: `${originalName}_renamed` });
const createRenameCommand = () => new UpdateColumnCommand(originalName, updatedColumn);

describe(UpdateColumnCommand, () => {
  setupCommandBench("rename column, 100 rows", createRenameCommand, () => createBenchDataSource(benchRows100));
  setupCommandBench("rename column, 1000 rows", createRenameCommand, () => createBenchDataSource(benchRows1k));
  setupCommandBench("rename column, 10000 rows", createRenameCommand, () => createBenchDataSource(benchRows10k));
});
