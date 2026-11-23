import { PATH_SHINGLE_SIZE, SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";
import { getWordWindows } from "#src/services/sweeps/duplicateProse/getWordWindows";

// Two pages that cite one file share every word its path spells, and a key-files row or a link shares the
// Path plus the few words that label it — neither page is restating the other, it is the one string a citation
// Has to be. So the words a cited path covers are not prose, and a run is a copy only when what is left of it
// Once those are set aside is still a run: the same twenty words that make a copy anywhere else.
// A link target is set aside whole, as the words it spells in order: a three-word window of one (`a kit is` from
// `how a kit is read`) is a phrase ordinary prose shares, so a run is a citation only where it holds the whole target
export const checkIsPathRun = (
  words: string[],
  pathShingles: ReadonlySet<string>,
  linkTargets: ReadonlySet<string>,
): boolean => {
  const isPathWord = words.map(() => false);
  for (const [index, window] of getWordWindows(words, PATH_SHINGLE_SIZE).entries())
    if (pathShingles.has(window))
      for (let offset = 0; offset < PATH_SHINGLE_SIZE; offset++) isPathWord[index + offset] = true;
  for (const size of new Set(Array.from(linkTargets, (linkTarget) => linkTarget.split(" ").length)))
    for (const [index, window] of getWordWindows(words, size).entries())
      if (linkTargets.has(window)) for (let offset = 0; offset < size; offset++) isPathWord[index + offset] = true;
  return isPathWord.filter((isPath) => !isPath).length < SHINGLE_SIZE;
};
