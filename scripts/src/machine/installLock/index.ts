import { withInstallLock } from "#src/services/machine/withInstallLock";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runCommand } from "#src/services/timing/runCommand";
import { spawnSync } from "@esposter/shared-node/child-process";
import { defineCommand } from "citty";

// `pnpm -C scripts ai:machine:install-lock <command...>` — runs a command from the repository root while it holds the
// Machine's install lock, so an install it runs never races another on the pnpm store they share, and exits with its status
await runCommand(
  defineCommand({
    args: {
      command: {
        description: "The command to run, and the arguments it takes after it",
        required: true,
        type: "positional",
      },
    },
    meta: {
      description:
        "Run a command from the repository root while holding the machine's install lock, and exit with its status",
      name: "ai:machine:install-lock",
    },
    run: async ({ args }) => {
      // Through a shell with its arguments joined unquoted, as crossOS runs the commands it holds, so `pnpm` and a `.ps1`
      // Script resolve on Windows too. A quoted argument is not kept, so none is passed
      const { status } = await withInstallLock(() =>
        spawnSync(args._.map(String).join(" "), { cwd: REPOSITORY_ROOT, shell: true, stdio: "inherit" }),
      );
      process.exitCode = status ?? 1;
    },
  }),
);
