import type { TypeBenchRow } from "#src/models/benchTypes/TypeBenchRow";

import { TYPE_BENCH_PROGRAM_SUFFIX, TYPE_BENCH_SUFFIX } from "#src/services/benchTypes/constants";
import { findPackageTsconfig } from "#src/services/benchTypes/findPackageTsconfig";
import { measureTypeProgram } from "#src/services/benchTypes/measureTypeProgram";
import { readCompilerFlags } from "#src/services/benchTypes/readCompilerFlags";
import { readTypeBenchSource } from "#src/services/benchTypes/readTypeBenchSource";
import { subtractTypeBenchCounts } from "#src/services/benchTypes/subtractTypeBenchCounts";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getResultAsync } from "@esposter/shared";
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

// A hyphen is not in a type alias's name, so no case can write the baseline's program over its own
const BASELINE_PROGRAM_NAME = "baseline-header";

// Each case is its own program: the header every case shares, then that alias alone. The header is measured once as
// The baseline and subtracted, so a row is what its alias adds over the imports and fixtures beside it. The programs
// Sit beside the source so their relative imports resolve as they do for the source itself, each under a name of its
// Own so they are measured together.
export const measureTypeBench = async (sourcePath: string): Promise<TypeBenchRow[]> => {
  const absolutePath = resolve(REPOSITORY_ROOT, sourcePath);
  const source = readTypeBenchSource(readFileSync(absolutePath, "utf8"));
  const getProgramPath = (name: string): string =>
    `${absolutePath.slice(0, -TYPE_BENCH_SUFFIX.length)}.${name}${TYPE_BENCH_PROGRAM_SUFFIX}`;
  const programPaths = [BASELINE_PROGRAM_NAME, ...source.cases.map(({ name }) => name)].map((name) =>
    getProgramPath(name),
  );
  const result = await getResultAsync(() => {
    const flags = readCompilerFlags(findPackageTsconfig(absolutePath));
    const baselineCounts = measureTypeProgram(getProgramPath(BASELINE_PROGRAM_NAME), flags, source.header);

    return Promise.all(
      source.cases.map(async ({ name, text }) => {
        const [baseline, caseCounts] = await Promise.all([
          baselineCounts,
          measureTypeProgram(getProgramPath(name), flags, `${source.header}\n${text}\n`),
        ]);
        const counts = subtractTypeBenchCounts(caseCounts, baseline);
        return { instantiations: counts.instantiations, name, types: counts.types };
      }),
    );
  });
  // The programs are removed on every path out, so a failed measurement leaves no file for a later run to find
  for (const programPath of programPaths) rmSync(programPath, { force: true });

  return result.match(
    (rows) => rows,
    (error) => {
      throw error;
    },
  );
};
