import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The compiler is the one `typescript` resolves to from this package, never a copy of an older one: a count is a
// Property of the compiler version, so the run reads that version rather than naming it
const requireFromScripts = createRequire(import.meta.url);
const TYPESCRIPT_PACKAGE_JSON_PATH = requireFromScripts.resolve("typescript/package.json");

export const TYPESCRIPT_VERSION: string = parseMachineJson<{ version: string }>(
  readFileSync(TYPESCRIPT_PACKAGE_JSON_PATH, "utf8"),
).version;
export const TSC_PATH: string = join(dirname(TYPESCRIPT_PACKAGE_JSON_PATH), "bin", "tsc");
export const TYPE_BENCH_GLOB = "*.typebench.ts";
export const TYPE_BENCH_SUFFIX = ".typebench.ts";
export const TYPE_BENCH_RESULT_SUFFIX = ".typebench.md";
// The program a measurement writes beside its source, and removes once it has read the count
export const TYPE_BENCH_PROGRAM_SUFFIX = ".typebench.program.ts";
// A directory with nothing in it, named as `typeRoots` so a package's `types: []` loads no ambient declarations
export const EMPTY_TYPE_ROOTS_DIRECTORY: string = join(tmpdir(), "type-bench-empty-type-roots");
