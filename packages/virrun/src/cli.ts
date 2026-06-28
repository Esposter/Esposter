import { parseCliCommand } from "@/services/cli/parseCliCommand";
import { resolveCommandBackend } from "@/services/configuration/resolveCommandBackend";
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
// The backend is chosen by the repo's `virrun.config.json` allowlist (adoption level 3): a command in `route`
// Runs through the configured backend, everything else (and any repo with no config) stays native. So the same
// Prefix is safe on every command — only the allowlisted ones are actually sandboxed.
const main = async (): Promise<void> => {
  const command = parseCliCommand(process.argv.slice(2));
  if (command.length === 0) {
    process.stderr.write("usage: virrun -- <command>\n");
    process.exitCode = 1;
    return;
  }
  const backend = resolveCommandBackend(command, resolveVirrunConfiguration(""));
  const virrun = await createVirrun({ backend });
  const { exitCode } = await withFinalizerAsync(
    () => virrun.exec(command, "inherit"),
    () => virrun.dispose(),
  );
  process.exitCode = exitCode;
};

await main();
