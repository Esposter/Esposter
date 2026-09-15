import { getPathShingles } from "#src/services/sweeps/duplicateProse/getPathShingles";
import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";

// Every tracked path spelled the way a run is, as the windows a citation of one is read by: a citation is the
// Same string on both pages by design, so this is what a shared run has to be measured against before it reads
// As a copy
export const readRepositoryPathShingles = (): Set<string> =>
  getPathShingles(getSweepFilePaths(".").map((path) => getProseWords(path).join(" ")));
