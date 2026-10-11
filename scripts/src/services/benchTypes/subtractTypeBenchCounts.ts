import type { TypeBenchCounts } from "#src/models/benchTypes/TypeBenchCounts";

// What a case adds over the same file's baseline: the header's own cost, the imports and fixtures every case shares
// Along with the lib they pull in, cancels, leaving the alias's
export const subtractTypeBenchCounts = (counts: TypeBenchCounts, baseline: TypeBenchCounts): TypeBenchCounts => ({
  instantiations: counts.instantiations - baseline.instantiations,
  types: counts.types - baseline.types,
});
