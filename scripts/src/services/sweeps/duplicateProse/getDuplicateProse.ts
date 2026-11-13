import type { CitingPage } from "#src/models/shared/CitingPage";
import type { DuplicateProseFinding } from "#src/models/sweeps/duplicateProse/DuplicateProseFinding";

import { checkIsOneOwner } from "#src/services/sweeps/duplicateProse/checkIsOneOwner";
import { SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";
import { getPairedShingles } from "#src/services/sweeps/duplicateProse/getPairedShingles";
import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";

// Every run of words two pages of different owners share, longest first. A run is found through its shingles —
// Every window of `SHINGLE_SIZE` words — and a shingle on three or more pages is a template
// (an area index's standing intro, a Key Files heading) rather than a copy, so only a shingle exactly two pages
// Hold counts — and not one that is a template plus a word, since a standing intro followed by each page's own
// First word is shared by whichever two pages happen to start the same way. Adjacent shingles of one pair merge
// Into the run they came from, positioned by the first page — adjacent on both, since a shingle the second page
// Repeats is kept at its first position there, which can sit anywhere while its neighbour on the first page
// Follows on.
export const getDuplicateProse = (pages: CitingPage[]): DuplicateProseFinding[] => {
  const pageWords = new Map(pages.map(({ path, text }) => [path, getProseWords(text)]));
  const pairRuns = new Map<string, { ends: [number, number]; paths: [string, string]; start: number }[]>();
  for (const { firstIndex, firstPath, secondIndex, secondPath } of getPairedShingles(pageWords)) {
    if (checkIsOneOwner(firstPath, secondPath)) continue;

    const pairKey = `${firstPath}\n${secondPath}`;
    const runs = pairRuns.get(pairKey) ?? [];
    const run = runs.find(({ ends }) => ends[0] === firstIndex - 1 && ends[1] === secondIndex - 1);
    if (run === undefined)
      runs.push({ ends: [firstIndex, secondIndex], paths: [firstPath, secondPath], start: firstIndex });
    else run.ends = [firstIndex, secondIndex];
    pairRuns.set(pairKey, runs);
  }

  return [...pairRuns.values()]
    .flat()
    .map(({ ends, paths, start }) => ({
      paths,
      words: (pageWords.get(paths[0]) ?? []).slice(start, ends[0] + SHINGLE_SIZE),
    }))
    .toSorted((firstDuplicate, secondDuplicate) => secondDuplicate.words.length - firstDuplicate.words.length);
};
