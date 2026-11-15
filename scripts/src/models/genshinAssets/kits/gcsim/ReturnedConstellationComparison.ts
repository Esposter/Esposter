// The comparison a constellation test is written with in a gcsim file, `<` or `>=`
export const ReturnedConstellationComparison = { GreaterOrEqual: ">=", Less: "<" } as const;
export type ReturnedConstellationComparison =
  (typeof ReturnedConstellationComparison)[keyof typeof ReturnedConstellationComparison];
