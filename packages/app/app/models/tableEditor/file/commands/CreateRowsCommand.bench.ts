import { benchRows1k, benchRows10k, benchRows100 } from "@/composables/tableEditor/file/commands/constants.bench";
import { createBenchItem } from "@/composables/tableEditor/file/commands/createBenchItem.bench";
import { generateBenchRows } from "@/composables/tableEditor/file/commands/generateBenchRows.bench";
import { CreateRowsCommand } from "@/models/tableEditor/file/commands/CreateRowsCommand";
import { bench, describe } from "vitest";

const insertRows100 = generateBenchRows(100, { offset: 10000 });
const insertRows1k = generateBenchRows(1000, { offset: 10000 });
const insertRows10k = generateBenchRows(10000, { offset: 10000 });

describe(CreateRowsCommand, () => {
  bench("execute — insert 100 rows into 100", () => {
    new CreateRowsCommand(50, insertRows100).execute(createBenchItem(benchRows100));
  });

  bench("execute — insert 100 rows into 1000", () => {
    new CreateRowsCommand(500, insertRows100).execute(createBenchItem(benchRows1k));
  });

  bench("execute — insert 1000 rows into 10000", () => {
    new CreateRowsCommand(5000, insertRows1k).execute(createBenchItem(benchRows10k));
  });

  bench("execute — insert 10000 rows into 10000", () => {
    new CreateRowsCommand(5000, insertRows10k).execute(createBenchItem(benchRows10k));
  });

  bench("undo — remove 100 rows from 200", () => {
    const item = createBenchItem(benchRows100);
    const command = new CreateRowsCommand(50, insertRows100);
    command.execute(item);
    command.undo(item);
  });

  bench("undo — remove 1000 rows from 11000", () => {
    const item = createBenchItem(benchRows10k);
    const command = new CreateRowsCommand(5000, insertRows1k);
    command.execute(item);
    command.undo(item);
  });

  bench("undo — remove 10000 rows from 20000", () => {
    const item = createBenchItem(benchRows10k);
    const command = new CreateRowsCommand(5000, insertRows10k);
    command.execute(item);
    command.undo(item);
  });
});
