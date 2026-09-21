import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";
import { constants } from "node:os";

// oxlint-disable-next-line no-restricted-imports -- the repo-root manifest, which no `#` map can reach
import packageJson from "../../../package.json" with { type: "json" };

const property = "crossOS";
// Invoked as `pnpm crossOS <script> [args]`
const [script, ...args] = process.argv.slice(2);
if (!script) throw new InvalidOperationError(Operation.Read, property, "script is required");

const { platform } = process;
const command = (packageJson[property] as Record<string, Partial<Record<string, string>>>)[script]?.[platform];
if (!command)
  throw new InvalidOperationError(
    Operation.Read,
    property,
    `script: "${script}" not found for the current platform: ${platform}`,
  );
// With shell: true, pass a single command string (no args array) — Node deprecates (DEP0190) array
// Args here since they are concatenated unescaped anyway. args are internal, trusted CLI tokens.
// Every command in the map is written against the repository root — a relative path into `scripts/`, an
// `rm -rf pnpm-lock.yaml` — while the root delegates here with `pnpm -C scripts`, whose cwd is this package.
// So the root is resolved from this file rather than inherited, and the map is read from the manifest that
// Declares it rather than from whichever one the caller happened to be standing in.
const proc = spawn([command, ...args].join(" "), {
  cwd: REPOSITORY_ROOT,
  shell: true,
  stdio: "inherit",
});
proc.on("exit", (code, signal) => {
  // A child killed by a signal carries no exit code, and exiting with that absence is exiting 0 — a run nothing
  // Finished reported as a success, to CI as much as to the caller. 128 plus the signal number is what a shell
  // Reports for the same death, so wrapping a command in this one changes nothing about the status it answers with.
  if (code !== null) process.exit(code);
  else if (signal) process.exit(128 + constants.signals[signal]);
  else process.exit(1);
});
