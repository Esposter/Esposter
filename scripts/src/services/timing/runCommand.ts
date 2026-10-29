import type { ArgsDef, CommandDef } from "citty";

import { timeCommand } from "#src/services/timing/timeCommand";
import { runMain } from "citty";

// Every citty command line goes through this rather than `runMain`, so its run is timed with no opt-in
export const runCommand = async <T extends ArgsDef>(command: CommandDef<T>): Promise<void> => {
  const meta = typeof command.meta === "function" ? await command.meta() : await command.meta;
  timeCommand(meta?.name ?? "command");
  await runMain(command);
};
