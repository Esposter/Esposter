import type { TypeBenchShowConfig } from "#src/models/benchTypes/TypeBenchShowConfig";

import { EMPTY_TYPE_ROOTS_DIRECTORY, TSC_PATH } from "#src/services/benchTypes/constants";
import { toCompilerFlags } from "#src/services/benchTypes/toCompilerFlags";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdirSync } from "node:fs";

// The package's resolved options, read from `--showConfig` so an extends chain is followed rather than re-read here
export const readCompilerFlags = (packageTsconfigPath: string): string[] => {
  const { stdout } = spawnSync(process.execPath, [TSC_PATH, "-p", packageTsconfigPath, "--showConfig"], {
    encoding: "utf8",
  });
  const { compilerOptions } = parseMachineJson<TypeBenchShowConfig>(stdout);
  mkdirSync(EMPTY_TYPE_ROOTS_DIRECTORY, { recursive: true });

  return toCompilerFlags(compilerOptions);
};
