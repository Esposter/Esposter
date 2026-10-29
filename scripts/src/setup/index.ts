import { formatSetupRows } from "#src/services/setup/formatSetupRows";
import { getSetupExitCode } from "#src/services/setup/getSetupExitCode";
import { readSetupEnvironment } from "#src/services/setup/readSetupEnvironment";
import { readSetupRows } from "#src/services/setup/readSetupRows";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:setup [--install] [--verify]` — the new-machine steps after the clone and the logins, as one table. It exits 1 while
// a step needs the person; the install and verify steps run only when asked for, since they take minutes and the network
await runCommand(
  defineCommand({
    args: {
      install: {
        default: false,
        description:
          "Run pnpm i when the dependencies are not installed, and the parity references' restore when some are missing",
        type: "boolean",
      },
      verify: {
        default: false,
        description: "Verify the hosted game data's lock against the public container, which needs the network",
        type: "boolean",
      },
    },
    meta: {
      description:
        "Take a fresh machine to the working state after the logins: one table of step, status and next; exits 1 while a step needs you",
      name: "ai:setup",
    },
    run: ({ args }) => {
      const rows = readSetupRows(
        { install: args.install, verify: args.verify },
        readSetupEnvironment(process.platform),
      );
      for (const line of formatSetupRows(rows)) console.info(line);
      console.info("for the session's own resume, then:");
      console.info("pnpm ai:resume");
      process.exitCode = getSetupExitCode(rows);
    },
  }),
);
