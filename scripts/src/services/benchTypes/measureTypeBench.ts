import type { TypeBenchRow } from "#src/models/benchTypes/TypeBenchRow";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { findPackageTsconfig } from "#src/services/benchTypes/findPackageTsconfig";
import { measureTypeProgram } from "#src/services/benchTypes/measureTypeProgram";
import { readCompilerFlags } from "#src/services/benchTypes/readCompilerFlags";
import { readTypeBenchSource } from "#src/services/benchTypes/readTypeBenchSource";
import { subtractTypeBenchCounts } from "#src/services/benchTypes/subtractTypeBenchCounts";
import { TYPE_BENCH_PROGRAM_SUFFIX, TYPE_BENCH_SUFFIX } from "#src/services/benchTypes/constants";
import { getResult } from "@esposter/shared";
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

// Each case is its own program: the header every case shares, then that alias alone. The header is measured once as
// The baseline and subtracted, so a row is what its alias adds over the imports and fixtures beside it. The program
// Sits beside the source so its relative imports resolve as they do for the source itself.
export const measureTypeBench = (sourcePath: string): TypeBenchRow[] => {
  const absolutePath = resolve(REPOSITORY_ROOT, sourcePath);
  const source = readTypeBenchSource(readFileSync(absolutePath, "utf8"));
  const programPath = `${absolutePath.slice(0, -TYPE_BENCH_SUFFIX.length)}${TYPE_BENCH_PROGRAM_SUFFIX}`;
  const result = getResult(() => {
    const flags = readCompilerFlags(findPackageTsconfig(absolutePath));
    const baseline = measureTypeProgram(programPath, flags, source.header);
    return source.cases.map((caseItem) => {
      const counts = subtractTypeBenchCounts(
        measureTypeProgram(programPath, flags, `${source.header}\n${caseItem.text}\n`),
        baseline,
      );
      return { instantiations: counts.instantiations, name: caseItem.name, types: counts.types };
    });
  });
  // The program is removed on every path out, so a failed measurement leaves no file for a later run to find
  rmSync(programPath, { force: true });

  return result.match(
    (rows) => rows,
    (error) => {
      throw error;
    },
  );
};
