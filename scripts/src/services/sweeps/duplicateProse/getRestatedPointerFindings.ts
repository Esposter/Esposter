import type { CitingPage } from "#src/models/citations/CitingPage";
import type { RestatedPointerFinding } from "#src/models/sweeps/duplicateProse/RestatedPointerFinding";

import { getBacktickedTokens } from "#src/services/citations/getBacktickedTokens";
import { checkIsPathRun } from "#src/services/sweeps/duplicateProse/checkIsPathRun";
import { getDuplicateProse } from "#src/services/sweeps/duplicateProse/getDuplicateProse";
import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { readRepositoryPathShingles } from "#src/services/sweeps/duplicateProse/readRepositoryPathShingles";
import { CATALOGUE_HEADING, SETTLED_HEADING } from "#src/services/sweeps/skillDocs/constants";
import { AGENT_DIRECTORY } from "@esposter/configuration";

const POINTER_HEADINGS = new Set([CATALOGUE_HEADING, SETTLED_HEADING]);
const SKILL_NAME_REGEX = /^[\w-]+$/u;

// The two headings whose lines the convention already decides the shape of, so a run inside one is readable
// Where a run in ordinary prose is a candidate a pass has to judge
const getPointerLines = (text: string): string[] => {
  const lines: string[] = [];
  let isUnderPointerHeading = false;
  for (const line of text.split("\n"))
    if (line.startsWith("## ")) isUnderPointerHeading = POINTER_HEADINGS.has(line);
    else if (isUnderPointerHeading && (line.startsWith("- ") || line.startsWith("| "))) lines.push(line);
  return lines;
};

// A backticked repo path names one page; a backticked skill name names every page of that skill, since the
// Argument a line points at may sit in the `SKILL.md` or in any of its reference pages
const checkIsPointedAt = (line: string, path: string): boolean =>
  getBacktickedTokens(line).some(
    (token) =>
      token === path || (SKILL_NAME_REGEX.test(token) && path.startsWith(`${AGENT_DIRECTORY}/skills/${token}/`)),
  );

// A run two pages share is a copy of one argument wherever it sits, and a pass reads ordinary prose to decide
// Which page owns it. A pointer line is the one place that is already decided: the direction it names is the
// Owner's wording on purpose — a line that reworded it would stop matching what a reader greps — and everything
// Past the direction is the one clause it may carry. So a run shared with the page the line points at is the
// Direction, and a run shared with any other page is the argument stated twice (`skill-authoring`,
// `references/settled-lists.md`).
export const getRestatedPointerFindings = (pages: CitingPage[]): RestatedPointerFinding[] => {
  const pathPointerLinesMap = new Map(pages.map(({ path, text }) => [path, getPointerLines(text)]));
  const pathShingles = readRepositoryPathShingles();
  return getDuplicateProse(pages).flatMap(({ paths: [firstPath, secondPath], words }) => {
    if (checkIsPathRun(words, pathShingles)) return [];

    const runText = words.join(" ");
    return [
      { otherPath: secondPath, path: firstPath },
      { otherPath: firstPath, path: secondPath },
    ].flatMap(({ otherPath, path }) =>
      (pathPointerLinesMap.get(path) ?? [])
        .filter((line) => getProseWords(line).join(" ").includes(runText) && !checkIsPointedAt(line, otherPath))
        .map((line) => ({ line: line.trim(), otherPath, path })),
    );
  });
};
