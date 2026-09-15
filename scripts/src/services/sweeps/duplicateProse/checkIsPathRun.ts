// Two pages that cite one file share every word its path spells, and the deepest of them run past the shingle
// Size on their own — neither page is restating the other, it is the one string a citation has to be. A run
// That is nothing but a path is that; a run carrying prose around one is the pages sharing the prose.
export const checkIsPathRun = (words: string[], pathTexts: string[]): boolean => {
  const runText = words.join(" ");
  return pathTexts.some((pathText) => pathText.includes(runText));
};
