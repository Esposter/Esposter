import type { DuplicateProseFinding } from "#src/models/sweeps/duplicateProse/DuplicateProseFinding";

import { readCitingPages } from "#src/services/citations/readCitingPages";
import { OPENSPEC_SPEC_FILE } from "#src/services/openspec/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { checkIsPathRun } from "#src/services/sweeps/duplicateProse/checkIsPathRun";
import { getDuplicateProse } from "#src/services/sweeps/duplicateProse/getDuplicateProse";
import { readRepositoryPathShingles } from "#src/services/sweeps/duplicateProse/readRepositoryPathShingles";

// Every run of prose two pages or skills of different owners share, read off the tree. A README, a ledger and a
// Spec's requirements are shaped by a template each of their kind repeats — a requirement is a SHALL and its scenarios,
// Which `openspec validate` holds — so the designs, proposals, tasks and skills are the pages read; a run that is a
// Citation rather than prose is set aside (`checkIsPathRun`).
export const readDuplicateProseFindings = (): DuplicateProseFinding[] => {
  const pathShingles = readRepositoryPathShingles();
  const pages = readCitingPages().filter(
    ({ path }) =>
      !path.endsWith("README.md") && !path.endsWith(OPENSPEC_SPEC_FILE) && !path.startsWith(`${LEDGER_DIRECTORY}/`),
  );
  return getDuplicateProse(pages).filter(({ words }) => !checkIsPathRun(words, pathShingles));
};
