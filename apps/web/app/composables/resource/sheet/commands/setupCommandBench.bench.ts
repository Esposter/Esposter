import type { ADataSourceCommand } from "#shared/models/resource/sheet/commands/ADataSourceCommand";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

interface CommandBenchCase {
  createCommand: () => ADataSourceCommand;
  createDataSource: () => DataSource;
  name: string;
}

// Every command bench is the same pair measured at some case: `execute` against a data source nothing else has
// Touched, then the round trip that ends back where it started. Registering both from one place is what keeps
// `vs base` meaningful. A group holds one scale and may hold several shapes at that scale, each shape its own
// Pair; a group mixing scales reports the ratio between two fixture sizes instead, which is a fact about the
// Fixture rather than about the command.
//
// The undo task times its own `execute` too, because there is no undo to measure without one, hence the task name.
// Both callbacks build their own data source (every command mutates the one it is handed) and their own command,
// Since a command carries the state its undo consumes.
export const setupCommandBench = (title: string, cases: CommandBenchCase[]): void => {
  test(title, async ({ bench }) => {
    await bench.compare(
      ...cases.flatMap(({ createCommand, createDataSource, name }) => [
        bench(`${name} execute`, () => {
          createCommand().execute(createDataSource());
        }),
        bench(`${name} execute + undo`, () => {
          const dataSource = createDataSource();
          const command = createCommand();
          command.execute(dataSource);
          command.undo(dataSource);
        }),
      ]),
      BENCHMARK_RUN_OPTIONS,
    );
  });
};

describe.todo("setupCommandBench");
