export type BuildTuple<N extends number, T extends unknown[] = []> = T["length"] extends N
  ? T
  : BuildTuple<N, [...T, unknown]>;
