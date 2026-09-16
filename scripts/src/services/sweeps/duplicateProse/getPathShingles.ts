import { PATH_SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";

// Every window of `PATH_SHINGLE_SIZE` words any tracked path spells, so a run is read for citations by lookup
// Rather than by a substring search over every path
export const getPathShingles = (pathTexts: string[]): Set<string> => {
  const pathShingles = new Set<string>();
  for (const pathText of pathTexts) {
    const words = pathText.split(" ");
    for (let index = 0; index + PATH_SHINGLE_SIZE <= words.length; index++)
      pathShingles.add(words.slice(index, index + PATH_SHINGLE_SIZE).join(" "));
  }
  return pathShingles;
};
