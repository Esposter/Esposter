import type { CitingPage } from "#src/models/shared/CitingPage";
import type { RestatedPointerFinding } from "#src/models/sweeps/duplicateProse/RestatedPointerFinding";

import { checkIsPathRun } from "#src/services/sweeps/duplicateProse/checkIsPathRun";
import { checkIsPointedAt } from "#src/services/sweeps/duplicateProse/checkIsPointedAt";
import { getDuplicateProse } from "#src/services/sweeps/duplicateProse/getDuplicateProse";
import { getPointerLines } from "#src/services/sweeps/duplicateProse/getPointerLines";
import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { readRepositoryPathShingles } from "#src/services/sweeps/duplicateProse/readRepositoryPathShingles";

// A run two pages share is a copy of one argument wherever it sits, and a pass reads ordinary prose to decide
// Which page owns it. A pointer line is the one place that is already decided: the direction it names is the
// Owner's wording on purpose — a line that reworded it would stop matching what a reader greps — and everything
// Past the direction is the one clause it may carry. So a run shared with the page the line points at is the
// Direction, and a run shared with any other page is the argument stated twice (`skill-authoring`,
// `references/settled-lists.md`).
export const getRestatedPointerFindings = (
  pages: CitingPage[],
  pathShingles: Set<string> = readRepositoryPathShingles(),
): RestatedPointerFinding[] => {
  const pathPointerLinesMap = new Map(pages.map(({ path, text }) => [path, getPointerLines(text)]));
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
