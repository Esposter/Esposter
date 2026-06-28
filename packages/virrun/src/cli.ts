import { parseCliCommand } from "@/services/cli/parseCliCommand";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { createVirrun } from "@/services/virrun/createVirrun";
import { withFinalizerAsync } from "@esposter/shared";
import process from "node:process";
// The human-facing entrypoint and the adoption entry point (specs/adoption.md): `virrun -- <cmd>` runs a
// Command through the sandbox with no other change. Output streams live (stdio "inherit") and the child's
// Exit code is propagated so it is a drop-in wrapper around any command. The command is forwarded as an argv
// Array (never a joined string) so it runs with shell: false and argument boundaries are preserved — spaces
// And metacharacters reach the program literally instead of being re-tokenized by a shell. Operators inside
// The sandbox are opt-in via `virrun -- sh -c "..."`.
//
// The prefix is the switch: every `virrun -- <cmd>` is sandboxed, and opting a command in or out is just adding
// Or removing the `virrun -- ` prefix on it — there is no separate on/off flag or allowlist. The repo's
// `virrun.config.json` (adoption level 3) only chooses *which* backend a sandboxed command runs through; with no
// Config the backend defaults to auto (native today), so the prefix is safe everywhere. virrun does inject a
// `VIRRUN=true` signal into the command's environment (see createVirrun), the way vitest sets `VITEST`, so the
// Command can detect it.
const main = async (): Promise<void> => {
  const command = parseCliCommand(process.argv.slice(2));
  if (command.length === 0) {
    process.stderr.write("usage: virrun -- <command>\n");
    process.exitCode = 1;
    return;
  }
  const configuration = resolveVirrunConfiguration();
  const backend = resolveBackend(configuration);
  const virrun = await createVirrun({ backend });
  const { exitCode } = await withFinalizerAsync(
    () => virrun.exec(command, "inherit"),
    () => virrun.dispose(),
  );
  process.exitCode = exitCode;
};

await main();
