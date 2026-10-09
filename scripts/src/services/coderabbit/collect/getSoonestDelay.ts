// The soonest of the retrigger delays the run's holds stated, any of which may be absent — the run's one wake has to
// Serve every hold
export const getSoonestDelay = (...delays: (number | undefined)[]): number | undefined => {
  const statedDelays = delays.filter((delay) => delay !== undefined);
  return statedDelays.length === 0 ? undefined : Math.min(...statedDelays);
};
