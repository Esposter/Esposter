// The sibling worktrees' task caches in the order a create tries them. The fewest build directories changed since their
// Base Come first: each changed one is a package the build here runs again, and the packages built on it with it. The
// Newest Recording breaks a tie, since it is the one most recently run on the sources it holds
export const rankCacheSources = (
  candidates: readonly { changedDirectories: number; path: string; recordedAt: number }[],
): string[] =>
  candidates
    .toSorted(
      (candidate, otherCandidate) =>
        candidate.changedDirectories - otherCandidate.changedDirectories ||
        otherCandidate.recordedAt - candidate.recordedAt,
    )
    .map(({ path }) => path);
