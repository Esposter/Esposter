import { TYPE_BENCH_RESULT_SUFFIX, TYPE_BENCH_SUFFIX } from "#src/services/benchTypes/constants";

// The committed results sit beside their source, named for it
export const getTypeBenchResultPath = (sourcePath: string): string =>
  `${sourcePath.slice(0, -TYPE_BENCH_SUFFIX.length)}${TYPE_BENCH_RESULT_SUFFIX}`;
