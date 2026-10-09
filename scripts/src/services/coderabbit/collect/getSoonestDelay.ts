// The sooner of two retrigger delays, either of which may be absent — the run's one wake has to serve every hold
export const getSoonestDelay = (first: number | undefined, second: number | undefined): number | undefined => {
  if (first === undefined) return second;
  else if (second === undefined) return first;
  return Math.min(first, second);
};
