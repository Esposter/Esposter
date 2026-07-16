import { benchRows1k, benchRows10k, benchRows100 } from "@/composables/resource/sheet/commands/constants.bench";
import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { generateBenchRows } from "@/composables/resource/sheet/commands/generateBenchRows.bench";
import { CreateRowsCommand } from "@/models/resource/sheet/commands/CreateRowsCommand";
import { bench, describe } from "vitest";

const insertRows100 = generateBenchRows(100, { offset: 10000 });
const insertRows1k = generateBenchRows(1000, { offset: 10000 });
const insertRows10k = generateBenchRows(10000, { offset: 10000 });

describe(CreateRowsCommand, () => {
  bench("execute — insert 100 rows into 100", () => {
    new CreateRowsCommand(50, insertRows100).execute(createBenchDataSource(benchRows100));
  });

  bench("execute — insert 100 rows into 1000", () => {
    new CreateRowsCommand(500, insertRows100).execute(createBenchDataSource(benchRows1k));
  });

  bench("execute — insert 1000 rows into 10000", () => {
    new CreateRowsCommand(5000, insertRows1k).execute(createBenchDataSource(benchRows10k));
  });

  bench("execute — insert 10000 rows into 10000", () => {
    new CreateRowsCommand(5000, insertRows10k).execute(createBenchDataSource(benchRows10k));
  });

  bench("undo — remove 100 rows from 200", () => {
    const dataSource = createBenchDataSource(benchRows100);
    const command = new CreateRowsCommand(50, insertRows100);
    command.execute(dataSource);
    command.undo(dataSource);
  });

  bench("undo — remove 1000 rows from 11000", () => {
    const dataSource = createBenchDataSource(benchRows10k);
    const command = new CreateRowsCommand(5000, insertRows1k);
    command.execute(dataSource);
    command.undo(dataSource);
  });

  bench("undo — remove 10000 rows from 20000", () => {
    const dataSource = createBenchDataSource(benchRows10k);
    const command = new CreateRowsCommand(5000, insertRows10k);
    command.execute(dataSource);
    command.undo(dataSource);
  });
});
