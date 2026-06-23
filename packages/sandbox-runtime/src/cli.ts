#!/usr/bin/env node
import { createSandbox } from "@/services/sandbox/createSandbox";
import process from "node:process";
// The human-facing entrypoint and the lowest rung of adoption (specs/adoption.md): `sandbox -- <cmd>`
// Runs a single command through the sandbox with no other change. Output streams live (stdio
// "inherit") and the child's exit code is propagated so it is a drop-in wrapper around any command.
const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);
  const separatorIndex = argv.indexOf("--");
  const command = (separatorIndex === -1 ? argv : argv.slice(separatorIndex + 1)).join(" ");
  if (command === "") {
    process.stderr.write("usage: sandbox -- <command>\n");
    process.exitCode = 1;
    return;
  }
  const sandbox = await createSandbox();
  const { exitCode } = await sandbox.exec(command, "inherit");
  await sandbox.dispose();
  process.exitCode = exitCode;
};

await main();
