import type { CitingPage } from "#src/models/citations/CitingPage";
import type { DuplicateProseFinding } from "#src/models/sweeps/duplicateProse/DuplicateProseFinding";

import { SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";
import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { takeOne } from "@esposter/shared";

const SKILL_OWNER_REGEX = /^\.agents\/skills\/(?<skill>[^/]+)\//u;
// Two pages of one skill restate each other by design — the index line names the trigger its reference page
// Opens on — so a skill is one owner, and every other page is its own
const getOwner = (path: string): string => SKILL_OWNER_REGEX.exec(path)?.groups?.skill ?? path;

// Every run of words two pages of different owners share, longest first. A run is found through its shingles —
// Every window of `SHINGLE_SIZE` words, keyed by its text — and a shingle on three or more pages is a template
// (an area index's standing intro, a Key Files heading) rather than a copy, so only a shingle exactly two pages
// Hold counts. Adjacent shingles of one pair merge into the run they came from, positioned by the first page —
// Adjacent on both, since a shingle the second page repeats is kept at its first position there, which can sit
// Anywhere while its neighbour on the first page follows on.
export const getDuplicateProse = (pages: CitingPage[]): DuplicateProseFinding[] => {
  const shinglePages = new Map<string, Map<string, number>>();
  const pageWords = new Map(pages.map(({ path, text }) => [path, getProseWords(text)]));
  for (const [path, words] of pageWords)
    for (let index = 0; index + SHINGLE_SIZE <= words.length; index++) {
      const shingle = words.slice(index, index + SHINGLE_SIZE).join(" ");
      const positions = shinglePages.get(shingle) ?? new Map<string, number>();
      if (!positions.has(path)) positions.set(path, index);
      shinglePages.set(shingle, positions);
    }

  const pairRuns = new Map<string, { ends: [number, number]; paths: [string, string]; start: number }[]>();
  for (const positions of shinglePages.values()) {
    if (positions.size !== 2) continue;

    const entries = [...positions];
    const [firstPath, firstIndex] = takeOne(entries, 0);
    const [secondPath, secondIndex] = takeOne(entries, 1);
    if (getOwner(firstPath) === getOwner(secondPath)) continue;

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
    .toSorted((first, second) => second.words.length - first.words.length);
};
