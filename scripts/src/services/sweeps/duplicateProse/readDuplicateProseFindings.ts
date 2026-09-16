import type { DuplicateProseFinding } from "#src/models/sweeps/duplicateProse/DuplicateProseFinding";

import { readCitingPages } from "#src/services/citations/readCitingPages";
import { checkIsPathRun } from "#src/services/sweeps/duplicateProse/checkIsPathRun";
import { getDuplicateProse } from "#src/services/sweeps/duplicateProse/getDuplicateProse";
import { readRepositoryPathShingles } from "#src/services/sweeps/duplicateProse/readRepositoryPathShingles";

// Every run of prose two docs pages or skills of different owners share, read off the tree. A README and a
// Ledger are shaped by a template each of their kind repeats, so the docs and the skills are the pages read; a
// Run that is a citation rather than prose is set aside (`checkIsPathRun`).
export const readDuplicateProseFindings = (): DuplicateProseFinding[] => {
  const pathShingles = readRepositoryPathShingles();
  const pages = readCitingPages().filter(
    ({ path }) => !path.endsWith("README.md") && !path.startsWith(".agents/ledgers/"),
  );
  return getDuplicateProse(pages).filter(({ words }) => !checkIsPathRun(words, pathShingles));
};
