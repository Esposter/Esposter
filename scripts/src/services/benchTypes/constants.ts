import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

// The compiler that counts is the `tsrs` this repo typechecks with, never a copy of an older one: a count is a property
// Of the compiler and its version, so the run reads that version rather than naming it
const requireFromScripts = createRequire(import.meta.url);
const TSRS_PACKAGE_JSON_PATH = requireFromScripts.resolve("tsrs/package.json");

export const TSRS_VERSION: string = parseMachineJson<{ version: string }>(
  readFileSync(TSRS_PACKAGE_JSON_PATH, "utf8"),
).version;
export const TSRS_PATH: string = join(dirname(TSRS_PACKAGE_JSON_PATH), "bin", "tsrs");
// Only a package's resolved options are read through `tsc`, since `tsrs` does not support `--showConfig` on Windows
export const TSC_PATH: string = join(dirname(requireFromScripts.resolve("typescript/package.json")), "bin", "tsc");
export const TYPE_BENCH_GLOB = "*.typebench.ts";
export const TYPE_BENCH_SUFFIX = ".typebench.ts";
export const TYPE_BENCH_RESULT_SUFFIX = ".typebench.md";
// The program a measurement writes beside its source, and removes once it has read the count
export const TYPE_BENCH_PROGRAM_SUFFIX = ".typebench.program.ts";
// A directory with nothing in it, named as `typeRoots` so a package's `types: []` loads no ambient declarations
export const EMPTY_TYPE_ROOTS_DIRECTORY: string = join(tmpdir(), "type-bench-empty-type-roots");
