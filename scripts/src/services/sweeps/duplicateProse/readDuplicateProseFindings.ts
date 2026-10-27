import type { DuplicateProseFinding } from "#src/models/sweeps/duplicateProse/DuplicateProseFinding";

import { readCitingPages } from "#src/services/citations/readCitingPages";
import { OPENSPEC_SPEC_FILE } from "#src/services/openspec/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { checkIsPathRun } from "#src/services/sweeps/duplicateProse/checkIsPathRun";
import { getDuplicateProse } from "#src/services/sweeps/duplicateProse/getDuplicateProse";
import { getPathShingles } from "#src/services/sweeps/duplicateProse/getPathShingles";
import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { readRepositoryPathShingles } from "#src/services/sweeps/duplicateProse/readRepositoryPathShingles";

// Every run of prose two pages or skills of different owners share, read off the tree. A README, a ledger and a
// Spec's requirements are shaped by a template each of their kind repeats — a requirement is a SHALL and its scenarios,
// Which `openspec validate` holds — so the designs, proposals, tasks and skills are the pages read; a run that is a
// Citation rather than prose is set aside (`checkIsPathRun`).
// A `{data-root}` path names a game-data file a page cites, and a markdown link's target names the page or anchor it
// Cites: each is a citation by the same convention a repository path is, so its words are set aside like a tracked path's
const DATA_ROOT_PATH_REGEX = /\{data-root\}\/[^\s`()[\]<>]+/gu;
const LINK_TARGET_REGEX = /(?<=\]\()[^)\s]+(?=\))/gu;
export const readDuplicateProseFindings = (): DuplicateProseFinding[] => {
  const pages = readCitingPages().filter(
    ({ path }) =>
      !path.endsWith("README.md") && !path.endsWith(OPENSPEC_SPEC_FILE) && !path.startsWith(`${LEDGER_DIRECTORY}/`),
  );
  const citationShingles = getPathShingles(
    pages
      .flatMap(({ text }) => [
        ...Array.from(text.matchAll(DATA_ROOT_PATH_REGEX), ({ 0: path }) => path),
        ...Array.from(text.matchAll(LINK_TARGET_REGEX), ({ 0: target }) => target),
      ])
      .map((path) => getProseWords(path).join(" ")),
  );
  const pathShingles = new Set([...readRepositoryPathShingles(), ...citationShingles]);
  return getDuplicateProse(pages).filter(({ words }) => !checkIsPathRun(words, pathShingles));
};
