import { PATH_SHINGLE_SIZE } from "#src/services/sweeps/duplicateProse/constants";
import { getWordWindows } from "#src/services/sweeps/duplicateProse/getWordWindows";

// Every window of `PATH_SHINGLE_SIZE` words any tracked path spells, so a run is read for citations by lookup
// Rather than by a substring search over every path
export const getPathShingles = (pathTexts: string[]): Set<string> =>
  new Set(pathTexts.flatMap((pathText) => getWordWindows(pathText.split(" "), PATH_SHINGLE_SIZE)));
