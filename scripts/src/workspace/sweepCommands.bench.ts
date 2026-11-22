import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { execSync } from "@esposter/shared-node/child-process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "vitest";

const SWEEP_SCRIPT_PREFIX = "ai:sweep:";
// Every sweep the root manifest delegates, read off the manifest rather than listed here, so a sweep added later is
// Benched the day it is added. The whole command an agent types is what is spawned — the root's delegation to
// `scripts`, that package's loader booting, the `git ls-files` spawns and every file read — because that walltime is
// What a session waits on, and its clock is those layers before it is any unit's (`runtime-efficiency` skill, "A
// Script's clock").
const { scripts } = parseMachineJson<{ scripts: Record<string, string> }>(
  readFileSync(resolve(REPOSITORY_ROOT, PACKAGE_JSON_FILENAME), "utf8"),
);
const sweepScriptNames = Object.keys(scripts).filter((name) => name.startsWith(SWEEP_SCRIPT_PREFIX));
// The argument a command cannot run without, as an agent would type it: the kit the kit-differs-from-source ledger's
// Own recipe names
const SWEEP_SCRIPT_ARGUMENTS: Partial<Record<string, string>> = { "ai:sweep:kit-design": "arataki-itto" };

test("ai:sweep commands end to end", async ({ bench }) => {
  await bench.compare(
    ...sweepScriptNames.map((name) =>
      // The command line as typed, through a shell: on Windows `pnpm` is a `.cmd` shim only a shell resolves, and a
      // Shell handed an argument list concatenates it unescaped, which Node warns about — one string has nothing to
      // Concatenate. The sweep's own output is what an agent reads and not what this measures, so only a failure's
      // Stderr is kept, for the error a non-zero exit throws
      bench(name, () => {
        const command = [`pnpm ${name}`, SWEEP_SCRIPT_ARGUMENTS[name]].filter(Boolean).join(" ");
        execSync(command, { cwd: REPOSITORY_ROOT, stdio: ["ignore", "ignore", "pipe"] });
      }),
    ),
    // A command is a second or two, so the shared iteration count would put this bench in the minutes. One warmup
    // Run fills the file cache the way a session's second sweep finds it, and three measured runs are what buy an
    // Honest `±rme`.
    { ...BENCHMARK_RUN_OPTIONS, iterations: 3, warmupIterations: 1 },
  );
});
