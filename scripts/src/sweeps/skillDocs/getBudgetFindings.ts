import type { SkillDocsFile } from "#src/sweeps/skillDocs/models/SkillDocsFile";
import type { SkillDocsFinding } from "#src/sweeps/skillDocs/models/SkillDocsFinding";

import { MAX_SKILL_BYTES, MAX_SKILL_LINES } from "#src/sweeps/skillDocs/constants";
import { SkillDocsFindingType } from "#src/sweeps/skillDocs/models/SkillDocsFindingType";

// The budget is a signal to separate topics rather than a number to shave prose under (`skill-authoring`), so a
// Hit is read rather than trimmed. Bytes, not code points: this repo's prose is full of em-dashes and each is
// Three of them, which is the difference between a page that fits and one that reports.
export const getBudgetFindings = (skills: SkillDocsFile[]): SkillDocsFinding[] =>
  skills
    .map(({ path, text }) => ({ bytes: Buffer.byteLength(text, "utf8"), lines: text.split("\n").length, path }))
    .filter(({ bytes, lines }) => bytes > MAX_SKILL_BYTES || lines > MAX_SKILL_LINES)
    .map(({ bytes, lines, path }) => ({
      detail: `${bytes.toString()} bytes, ${lines.toString()} lines`,
      path,
      type: SkillDocsFindingType.Budget,
    }));
