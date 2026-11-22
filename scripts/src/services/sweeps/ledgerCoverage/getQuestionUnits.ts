// The units a question reads: those holding one of its in-scope files
export const getQuestionUnits = (
  units: readonly string[],
  unitFiles: ReadonlyMap<string, readonly string[]>,
  scopeFiles: ReadonlySet<string>,
): string[] => units.filter((unit) => (unitFiles.get(unit) ?? []).some((file) => scopeFiles.has(file)));
