import { readCitingPages } from "#src/services/citations/readCitingPages";
import { checkIsPathRun } from "#src/services/sweeps/duplicateProse/checkIsPathRun";
import { getDuplicateProse } from "#src/services/sweeps/duplicateProse/getDuplicateProse";
import { getRepositoryPathTexts } from "#src/services/sweeps/duplicateProse/getRepositoryPathTexts";

// Prints rather than exits non-zero: a run two pages share is a candidate, not a defect — the pass decides which
// Page owns it and which keeps a pointer (`.agents/ledgers/docs/README.md`). The subset that is already decided
// Exits non-zero instead, in `scripts/src/workspace/restatedPointers.test.ts`. A README and a ledger are shaped
// By a template each of their kind repeats, so the docs and the skills are the pages read.
const pathTexts = getRepositoryPathTexts();
const pages = readCitingPages().filter(
  ({ path }) => !path.endsWith("README.md") && !path.startsWith(".agents/ledgers/"),
);
const findings = getDuplicateProse(pages).filter(({ words }) => !checkIsPathRun(words, pathTexts));

for (const { paths, words } of findings)
  console.info(`${paths[0]} | ${paths[1]}: ${words.length} words — ${words.slice(0, 12).join(" ")} …`);
