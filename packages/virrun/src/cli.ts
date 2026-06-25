import { parseCliCommand } from "@/services/cli/parseCliCommand";
import { createVirrun } from "@/services/virrun/createVirrun";
import { withFinalizerAsync } from "@esposter/shared";
import process from "node:process";
// The human-facing entrypoint and the lowest rung of adoption (specs/adoption.md): `virrun -- <cmd>`
// Runs a single command through the sandbox with no other change. Output streams live (stdio
// "inherit") and the child's exit code is propagated so it is a drop-in wrapper around any command.
// The command is forwarded as an argv array (never a joined string) so it runs with shell: false and
// Argument boundaries are preserved — spaces and metacharacters reach the program literally instead of
// Being re-tokenized by a shell. Operators inside the sandbox are opt-in via `virrun -- sh -c "..."`.
const main = async (): Promise<void> => {
  const command = parseCliCommand(process.argv.slice(2));
  if (command.length === 0) {
    process.stderr.write("usage: virrun -- <command>\n");
    process.exitCode = 1;
    return;
  }
  const virrun = await createVirrun();
  const { exitCode } = await withFinalizerAsync(
    () => virrun.exec(command, "inherit"),
    () => virrun.dispose(),
  );
  process.exitCode = exitCode;
};

await main();
