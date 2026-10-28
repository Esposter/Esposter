import type { CitingPage } from "#src/models/shared/CitingPage";
import type { DuplicateProseFinding } from "#src/models/sweeps/duplicateProse/DuplicateProseFinding";

import { checkIsOneOwner } from "#src/services/sweeps/duplicateProse/checkIsOneOwner";
import { SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";
import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { getShingles } from "#src/services/sweeps/duplicateProse/getShingles";
import { takeOne } from "@esposter/shared";

// Every run of words two pages of different owners share, longest first. A run is found through its shingles —
// Every window of `SHINGLE_SIZE` words, keyed by its text — and a shingle on three or more pages is a template
// (an area index's standing intro, a Key Files heading) rather than a copy, so only a shingle exactly two pages
// Hold counts — and not one that is a template plus a word, since a standing intro followed by each page's own
// First word is shared by whichever two pages happen to start the same way. Adjacent shingles of one pair merge
// Into the run they came from, positioned by the first page — adjacent on both, since a shingle the second page
// Repeats is kept at its first position there, which can sit anywhere while its neighbour on the first page
// Follows on.
export const getDuplicateProse = (pages: CitingPage[]): DuplicateProseFinding[] => {
  const pageWords = new Map(pages.map(({ path, text }) => [path, getProseWords(text)]));
  const { shinglePages, stemPageCounts } = getShingles(pageWords);
  // The two stems are the shingle less its last word and less its first, read by index: the check runs once per
  // Shingle two pages share, which on a paired corpus is every shingle
  const checkIsTemplateEdge = (shingle: string): boolean =>
    (stemPageCounts.get(shingle.slice(0, shingle.lastIndexOf(" "))) ?? 0) > 2 ||
    (stemPageCounts.get(shingle.slice(shingle.indexOf(" ") + 1)) ?? 0) > 2;

  const pairRuns = new Map<string, { ends: [number, number]; paths: [string, string]; start: number }[]>();
  for (const [shingle, positions] of shinglePages) {
    if (positions.size !== 2 || checkIsTemplateEdge(shingle)) continue;

    const entries = [...positions];
    const [firstPath, firstIndex] = takeOne(entries, 0);
    const [secondPath, secondIndex] = takeOne(entries, 1);
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
