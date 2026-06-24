import { createVirrun } from "@/services/virrun/createVirrun";
import { withFinalizerAsync } from "@esposter/shared";
import process from "node:process";
// The human-facing entrypoint and the lowest rung of adoption (specs/adoption.md): `virrun -- <cmd>`
// Runs a single command through the sandbox with no other change. Output streams live (stdio
// "inherit") and the child's exit code is propagated so it is a drop-in wrapper around any command.
const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);
  const separatorIndex = argv.indexOf("--");
  const command = (separatorIndex === -1 ? argv : argv.slice(separatorIndex + 1)).join(" ");
  if (command === "") {
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
