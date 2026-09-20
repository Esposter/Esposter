import { PATH_SHINGLE_SIZE, SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";
import { getWordWindows } from "#src/services/sweeps/duplicateProse/getWordWindows";

// Two pages that cite one file share every word its path spells, and a key-files row or a link shares the
// Path plus the few words that label it — neither page is restating the other, it is the one string a citation
// Has to be. So the words a cited path covers are not prose, and a run is a copy only when what is left of it
// Once those are set aside is still a run: the same ten words that make a copy anywhere else.
export const checkIsPathRun = (words: string[], pathShingles: ReadonlySet<string>): boolean => {
  const isPathWord = words.map(() => false);
  for (const [index, window] of getWordWindows(words, PATH_SHINGLE_SIZE).entries())
    if (pathShingles.has(window))
      for (let offset = 0; offset < PATH_SHINGLE_SIZE; offset++) isPathWord[index + offset] = true;
  return isPathWord.filter((isPath) => !isPath).length < SHINGLE_SIZE;
};
