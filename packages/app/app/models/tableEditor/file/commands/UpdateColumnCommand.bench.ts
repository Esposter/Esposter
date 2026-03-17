import {
  benchColumns,
  benchRows1k,
  benchRows10k,
  benchRows100,
  makeBenchItem,
  makeOriginalRowValues,
} from "@/composables/tableEditor/file/commands/testUtils.bench";
import { UpdateColumnCommand } from "@/models/tableEditor/file/commands/UpdateColumnCommand";
import { takeOne } from "@esposter/shared";
import { bench, describe } from "vitest";

const originalColumn = takeOne(benchColumns, 0);
const originalName = originalColumn.name;
const updatedColumn = Object.assign(Object.create(Object.getPrototypeOf(originalColumn)), originalColumn, {
  name: `${originalName}_renamed`,
});

const makeRenameCommand = (rows: typeof benchRows1k) =>
  new UpdateColumnCommand(originalName, originalColumn, updatedColumn, makeOriginalRowValues(rows, originalName));

describe(UpdateColumnCommand, () => {
  bench("execute (rename) — 100 rows", () => {
    makeRenameCommand(benchRows100).execute(makeBenchItem(benchRows100));
  });

  bench("execute (rename) — 1000 rows", () => {
    makeRenameCommand(benchRows1k).execute(makeBenchItem(benchRows1k));
  });

  bench("execute (rename) — 10000 rows", () => {
    makeRenameCommand(benchRows10k).execute(makeBenchItem(benchRows10k));
  });

  bench("undo (rename) — 1000 rows", () => {
    const item = makeBenchItem(benchRows1k);
    const command = makeRenameCommand(benchRows1k);
    command.execute(item);
    command.undo(item);
  });

  bench("undo (rename) — 10000 rows", () => {
    const item = makeBenchItem(benchRows10k);
    const command = makeRenameCommand(benchRows10k);
    command.execute(item);
    command.undo(item);
  });
});
