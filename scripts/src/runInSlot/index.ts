import { InvalidOperationError, Operation } from "@esposter/shared";
import { runInSlot } from "#src/services/buildCache/runInSlot";
import { runSlotCommand } from "#src/services/buildCache/runSlotCommand";
import { defineCommand, runMain } from "citty";

// `node --conditions=source scripts/node_modules/tsx/dist/cli.mjs scripts/src/runInSlot/index.ts -- <command...>` runs the
// Command once a machine-wide slot is free, and exits with the command's own status. The shell wrapper
// `.agents/skills/throughput/scripts/run-in-slot.sh` starts it this way, so the shell and the build cache share one gate
await runMain(
  defineCommand({
    meta: {
      description: "Run a heavy command once a machine-wide slot is free, with the command's own exit status",
      name: "run-in-slot",
    },
    run: ({ rawArgs }) => {
      const separatorIndex = rawArgs.indexOf("--");
      const command = separatorIndex === -1 ? [] : rawArgs.slice(separatorIndex + 1);
      if (command.length === 0)
        throw new InvalidOperationError(Operation.Read, "run-in-slot", "it was given no command after --");

      process.exitCode = runInSlot(() => runSlotCommand(command)) ?? 1;
    },
  }),
);
