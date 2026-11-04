// The candidate no later one replaces, starting from the first. A tie keeps the earlier candidate, because a later one
// Replaces the best only when it is strictly better
export const getSurveyExtreme = <T>(
  candidates: T[],
  checkReplaces: (best: T, candidate: T) => boolean,
): T | undefined => {
  let best: T | undefined;
  for (const candidate of candidates) if (best === undefined || checkReplaces(best, candidate)) best = candidate;

  return best;
};
