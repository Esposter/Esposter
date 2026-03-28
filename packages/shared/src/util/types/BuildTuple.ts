export type BuildTuple<N extends number, T = unknown, R extends unknown[] = []> = R["length"] extends N
  ? R
  : BuildTuple<N, T, [...R, T]>;
