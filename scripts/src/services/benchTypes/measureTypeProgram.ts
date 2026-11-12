import type { TypeBenchCounts } from "#src/models/benchTypes/TypeBenchCounts";

import { TSRS_PATH } from "#src/services/benchTypes/constants";
import { parseCompilerCounts } from "#src/services/benchTypes/parseCompilerCounts";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "@esposter/shared-node/child-process";
import { writeFileSync } from "node:fs";

const DIAGNOSTIC_REGEX = /error TS\d+/u;

// Writes one program and has the compiler count it under the package's flags. A case that does not compile counts
// Nothing useful, so a diagnostic throws rather than being measured. The process is awaited rather than run to
// Completion, so the programs of one run measure side by side, and its output is collected rather than read from a
// Rejection because tsrs exits non-zero on a diagnostic and its output is what names it. Its stderr is not read.
// `--ignoreConfig` because a file given on the command line makes a tsconfig in the working directory an error
// Otherwise.
export const measureTypeProgram = async (
  programPath: string,
  flags: string[],
  text: string,
): Promise<TypeBenchCounts> => {
  writeFileSync(programPath, text);
  const stdout = await new Promise<string>((resolve, reject) => {
    const compiler = spawn(
      process.execPath,
      [TSRS_PATH, ...flags, "--noEmit", "--extendedDiagnostics", "--ignoreConfig", programPath],
      { stdio: ["ignore", "pipe", "ignore"] },
    );
    let output = "";
    compiler.stdout.setEncoding("utf8");
    compiler.stdout.on("data", (chunk: string) => {
      output += chunk;
    });
    compiler.on("error", reject);
    compiler.on("close", () => {
      resolve(output);
    });
  });
  if (DIAGNOSTIC_REGEX.test(stdout))
    throw new InvalidOperationError(Operation.Read, programPath, `does not compile:\n${stdout}`);

  return parseCompilerCounts(stdout);
};
