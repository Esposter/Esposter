import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";

// Every tracked path spelled the way a run is: a citation of one is the same string on both pages by design, so
// This is what a shared run has to be measured against before it reads as a copy
export const getRepositoryPathTexts = (): string[] =>
  getSweepFilePaths(".").map((path) => getProseWords(path).join(" "));
