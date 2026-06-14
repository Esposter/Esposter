import {
  benchColumns,
  benchRows1k,
  benchRows10k,
  benchRows100,
  createBenchItem,
  createOriginalRowValues,
} from "@/composables/tableEditor/file/commands/testUtils.bench";
import { UpdateColumnCommand } from "@/models/tableEditor/file/commands/UpdateColumnCommand";
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
    createRenameCommand(benchRows100).execute(createBenchItem(benchRows100));
  });

  bench("execute (rename) — 1000 rows", () => {
    createRenameCommand(benchRows1k).execute(createBenchItem(benchRows1k));
  });

  bench("execute (rename) — 10000 rows", () => {
    createRenameCommand(benchRows10k).execute(createBenchItem(benchRows10k));
  });

  bench("undo (rename) — 1000 rows", () => {
    const item = createBenchItem(benchRows1k);
    const command = createRenameCommand(benchRows1k);
    command.execute(item);
    command.undo(item);
  });

  bench("undo (rename) — 10000 rows", () => {
    const item = createBenchItem(benchRows10k);
    const command = createRenameCommand(benchRows10k);
    command.execute(item);
    command.undo(item);
  });
});
