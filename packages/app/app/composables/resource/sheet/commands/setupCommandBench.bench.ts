import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";

import { bench, describe } from "vitest";

// Every command bench is the same pair measured at some case: `execute` against a data source nothing else has
// Touched, then the round trip that ends back where it started. Registering both from one place is what keeps
// `vs base` meaningful — a group holds a single case at a single scale, so the multiplier reads as what the undo
// Costs on top of the execute. A flat group mixing 100-row and 10000-row tasks reports the ratio between two
// Scales instead, which is a fact about the fixture rather than about the command.
//
// The undo task times its own `execute` too, because there is no undo to measure without one — hence the task
// Name. Both callbacks build their own data source (every command mutates the one it is handed) and their own
// Command (a command carries the state its undo consumes).
export const setupCommandBench = (
  title: string,
  createCommand: () => ADataSourceCommand,
  createDataSource: () => DataSource,
): void => {
  describe(title, () => {
    bench("execute", () => {
      createCommand().execute(createDataSource());
    });

    bench("execute + undo", () => {
      const dataSource = createDataSource();
      const command = createCommand();
      command.execute(dataSource);
      command.undo(dataSource);
    });
  });
};

describe.todo("setupCommandBench");
