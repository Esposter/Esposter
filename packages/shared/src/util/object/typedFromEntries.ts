// Builds a record from entries whose keys are known only at run time, so the record is the type the caller names rather
// Than the bare string index Object.fromEntries gives it. The one cast every such record takes is asserted here, where
// No per-key type can be checked against the keys, and each caller states the record it builds
// The record type is named by the caller and carried only
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- by the return, which is the point of the helper
export const typedFromEntries = <TRecord>(entries: Iterable<readonly [PropertyKey, unknown]>): TRecord =>
  // Object.fromEntries types its keys as a bare string index, and the keys are built
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- at run time, so no per-key record type overlaps it
  Object.fromEntries(entries) as TRecord;
