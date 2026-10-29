// A profile cut to at most `count` samples, each the largest of the run it stands for, so a single bright row survives
// The cut and a long rectangle's profile still fits in the output
export const downsampleByMax = (values: readonly number[], count: number): number[] => {
  if (values.length <= count) return [...values];
  const runLength = Math.ceil(values.length / count);
  return Array.from({ length: Math.ceil(values.length / runLength) }, (_, run) =>
    Math.max(...values.slice(run * runLength, (run + 1) * runLength)),
  );
};
