import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getSkillName } from "#src/services/sweeps/skillDocs/getSkillName";

// A reference page is loaded by the trigger-named index line in its own SKILL.md — nothing else reaches it, so
// A page no line names is a page no pass ever opens, however good it is. The line is an index entry, a list item
// Opening on the citation or a table row with a cell that is the citation alone: a citation inside a rule's prose
// Or a rule table's cell names the page without saying when to read it, which is the half of the index a reader
// Choosing what to load needs
const checkIsIndexLine = (line: string, citation: string) =>
  line.startsWith(`- ${citation} — `) ||
  (line.startsWith("|") && line.split("|").some((cell) => cell.trim() === citation));

export const getUnindexedFindings = (skills: SkillDocsFile[], pages: SkillDocsFile[]): SkillDocsFinding[] => {
  const skillLinesMap = new Map(skills.map(({ path, text }) => [getSkillName(path), text.split("\n")]));
  return pages
    .filter(({ path }) => {
      const citation = `\`references/${path.split("/").at(-1) ?? ""}\``;
      return !(skillLinesMap.get(getSkillName(path)) ?? []).some((line) => checkIsIndexLine(line, citation));
    })
    .map(({ path }) => ({ detail: "no SKILL.md index line names it", path, type: SkillDocsFindingType.Unindexed }));
};
