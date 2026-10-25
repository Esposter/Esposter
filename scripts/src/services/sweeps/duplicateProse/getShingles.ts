import { SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";

// The shingles of every page in one pass: each window of `SHINGLE_SIZE` words with the pages it appears on and
// The position it first appears at on each, and beside it how many pages hold each window one word shorter —
// The shorter window is the longer one's prefix, so it costs one concatenation rather than a second walk
export const getShingles = (
  pageWords: Map<string, string[]>,
): { shinglePages: Map<string, Map<string, number>>; stemPageCounts: Map<string, number> } => {
  const shinglePages = new Map<string, Map<string, number>>();
  // A page's positions arrive in order, so a stem's page count moves only when the page does — two flat maps
  // Rather than a set of paths per stem, which on a corpus of distinct pages is one allocation per word
  const stemPageCounts = new Map<string, number>();
  const stemLastPaths = new Map<string, string>();
  for (const [path, words] of pageWords)
    for (let index = 0; index + SHINGLE_SIZE - 1 <= words.length; index++) {
      const stem = words.slice(index, index + SHINGLE_SIZE - 1).join(" ");
      if (stemLastPaths.get(stem) !== path) {
        stemLastPaths.set(stem, path);
        stemPageCounts.set(stem, (stemPageCounts.get(stem) ?? 0) + 1);
      }
      const last = words[index + SHINGLE_SIZE - 1];
      if (last === undefined) continue;

      const shingle = `${stem} ${last}`;
      const positions = shinglePages.get(shingle) ?? new Map<string, number>();
      if (!positions.has(path)) positions.set(path, index);
      shinglePages.set(shingle, positions);
    }
  return { shinglePages, stemPageCounts };
};
