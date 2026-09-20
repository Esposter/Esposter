import type { CitingPage } from "#src/models/citations/CitingPage";
import type { DuplicateProseFinding } from "#src/models/sweeps/duplicateProse/DuplicateProseFinding";

import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";
import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { takeOne } from "@esposter/shared";

const SKILL_OWNER_REGEX = new RegExp(`^${SKILLS_DIRECTORY.replaceAll(".", String.raw`\.`)}/(?<skill>[^/]+)/`, "u");
// Two pages of one skill restate each other by design — the index line names the trigger its reference page
// Opens on — so a skill is one owner, and every other page is its own
const getOwner = (path: string): string => SKILL_OWNER_REGEX.exec(path)?.groups?.skill ?? path;

// The shingles of every page in one pass: each window of `SHINGLE_SIZE` words with the pages it appears on and
// The position it first appears at on each, and beside it how many pages hold each window one word shorter —
// The shorter window is the longer one's prefix, so it costs one concatenation rather than a second walk
const getShingles = (
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
