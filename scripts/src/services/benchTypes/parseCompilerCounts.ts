import type { TypeBenchCounts } from "#src/models/benchTypes/TypeBenchCounts";

import { InvalidOperationError } from "@esposter/shared";

const TYPES_REGEX = /^Types:\s+(?<count>\d+)\s*$/mu;
const INSTANTIATIONS_REGEX = /^Instantiations:\s+(?<count>\d+)\s*$/mu;

// Reads the two counts `tsc --extendedDiagnostics` prints. A run that printed neither has measured nothing, so it
// Throws rather than reporting zeros that would commit as a real result.
export const parseCompilerCounts = (output: string): TypeBenchCounts => {
  const types = TYPES_REGEX.exec(output)?.groups?.count;
  const instantiations = INSTANTIATIONS_REGEX.exec(output)?.groups?.count;
  if (types === undefined || instantiations === undefined)
    throw new InvalidOperationError("tsc --extendedDiagnostics printed no Types or Instantiations count");

  return { instantiations: Number(instantiations), types: Number(types) };
};
