import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getFencedLines } from "#src/services/skills/extract/getFencedLines";

// A skill named bare in front of its page or heading — (`foo`, `references/bar.md`) — reads as any backticked token,
// So the page beside it resolves against the citing skill rather than the one meant. The form is the skill by name,
// Then the page: (the `foo` skill, `references/bar.md`)
const BARE_SKILL_CITATION_REGEX = /\(`(?<name>[\w-]+)`[ \t]*,[ \t]*(?:`references\/|")/gu;

export const getBareSkillCitationFindings = (files: SkillDocsFile[], skillNames: Set<string>): SkillDocsFinding[] =>
  files.flatMap(({ path, text }) => {
    const lines = text.split("\n");
    const fencedLines = getFencedLines(lines);
    return lines
      .filter(
        (line, index) =>
          !fencedLines[index] &&
          Array.from(line.matchAll(BARE_SKILL_CITATION_REGEX), ({ groups }) => groups?.name).some(
            (name) => name !== undefined && skillNames.has(name),
          ),
      )
      .map((line) => ({ detail: line.trim().slice(0, 80), path, type: SkillDocsFindingType.BareSkillCitation }));
  });
