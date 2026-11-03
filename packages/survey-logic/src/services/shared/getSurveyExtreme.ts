// The candidate no later one replaces, starting from the first. A tie keeps the earlier candidate, since SurveyJS replaces
// Only on a strict comparison
export const getSurveyExtreme = <T>(
  candidates: T[],
  checkReplaces: (best: T, candidate: T) => boolean,
): T | undefined => {
  let best: T | undefined;
  for (const candidate of candidates) if (best === undefined || checkReplaces(best, candidate)) best = candidate;

  return best;
};
