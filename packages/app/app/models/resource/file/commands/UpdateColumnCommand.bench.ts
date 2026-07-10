import {
  benchColumns,
  benchRows1k,
  benchRows10k,
  benchRows100,
} from "@/composables/resource/file/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/file/commands/createBenchDataSource.bench";
import { createOriginalRowValues } from "@/composables/resource/file/commands/createOriginalRowValues.bench";
import { UpdateColumnCommand } from "@/models/resource/file/commands/UpdateColumnCommand";
import { takeOne } from "@esposter/shared";
import { bench, describe } from "vitest";

const originalColumn = takeOne(benchColumns);
const originalName = originalColumn.name;
const updatedColumn = Object.assign(structuredClone(originalColumn), {
  name: `${originalName}_renamed`,
});

const createRenameCommand = (rows: typeof benchRows1k) =>
  new UpdateColumnCommand(originalName, originalColumn, updatedColumn, createOriginalRowValues(rows, originalName));

describe(UpdateColumnCommand, () => {
  bench("execute (rename) — 100 rows", () => {
    createRenameCommand(benchRows100).execute(createBenchDataSource(benchRows100));
  });

  bench("execute (rename) — 1000 rows", () => {
    createRenameCommand(benchRows1k).execute(createBenchDataSource(benchRows1k));
  });

  bench("execute (rename) — 10000 rows", () => {
    createRenameCommand(benchRows10k).execute(createBenchDataSource(benchRows10k));
  });

  bench("undo (rename) — 1000 rows", () => {
    const dataSource = createBenchDataSource(benchRows1k);
    const command = createRenameCommand(benchRows1k);
    command.execute(dataSource);
    command.undo(dataSource);
  });

  bench("undo (rename) — 10000 rows", () => {
    const dataSource = createBenchDataSource(benchRows10k);
    const command = createRenameCommand(benchRows10k);
    command.execute(dataSource);
    command.undo(dataSource);
  });
});
