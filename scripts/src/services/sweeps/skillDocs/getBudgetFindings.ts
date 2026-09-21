import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { MAX_SKILL_BYTES } from "#src/services/sweeps/skillDocs/constants";

// The budget is a signal to separate topics rather than a number to shave prose under (`skill-authoring`), so a
// Hit is read rather than trimmed. Bytes, not code points: this repo's prose is full of em-dashes and each is
// Three of them, which is the difference between a page that fits and one that reports. Bytes are also the only
// Axis — a line count beside them is a second number to maintain for the same signal (`skill-authoring`).
// Only `SKILL.md`: a reference page's bytes are paid on trigger, not always-on, so no ceiling measures them.
export const getBudgetFindings = (skills: SkillDocsFile[]): SkillDocsFinding[] =>
  skills
    .map(({ path, text }) => ({ bytes: Buffer.byteLength(text, "utf8"), path }))
    .filter(({ bytes }) => bytes > MAX_SKILL_BYTES)
    .map(({ bytes, path }) => ({
      detail: `${bytes} bytes`,
      path,
      type: SkillDocsFindingType.Budget,
    }));
