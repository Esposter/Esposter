import type { TypeBenchCounts } from "#src/models/benchTypes/TypeBenchCounts";

import { TSC_PATH } from "#src/services/benchTypes/constants";
import { parseCompilerCounts } from "#src/services/benchTypes/parseCompilerCounts";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { writeFileSync } from "node:fs";

const DIAGNOSTIC_REGEX = /error TS\d+/u;

// Writes one program and has the compiler count it under the package's flags. A case that does not compile counts
// Nothing useful, so a diagnostic throws rather than being measured. `spawnSync` rather than `execFileSync` because tsc
// Exits non-zero on a diagnostic and its output is what names it. Its stderr is not read: the tsgo-backed build prints a
// Banner there. `--ignoreConfig` because a file given on the command line makes a tsconfig in the working directory an
// Error otherwise.
export const measureTypeProgram = (programPath: string, flags: string[], text: string): TypeBenchCounts => {
  writeFileSync(programPath, text);
  const { stdout } = spawnSync(
    process.execPath,
    [TSC_PATH, ...flags, "--noEmit", "--extendedDiagnostics", "--ignoreConfig", programPath],
    { encoding: "utf8" },
  );
  if (DIAGNOSTIC_REGEX.test(stdout))
    throw new InvalidOperationError(Operation.Read, programPath, `does not compile:\n${stdout}`);

  return parseCompilerCounts(stdout);
};
