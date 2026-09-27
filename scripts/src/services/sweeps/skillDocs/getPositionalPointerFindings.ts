import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";

// "See below" names nothing a reader can grep, and it stops pointing anywhere the day either half moves. A quoted
// Or backticked pointer is prose about the form rather than an instance of it, and a fence is an example's own text
const POSITIONAL_POINTER_REGEX = /(?<!["`])(?:\((?:see )?(?:above|below)\)|\bsee (?:above|below)\b|\bas above\b)/iu;
const FENCE_REGEX = /^[ \t]*```[\s\S]*?^[ \t]*```/gmu;

export const getPositionalPointerFindings = (files: SkillDocsFile[]): SkillDocsFinding[] =>
  files.flatMap(({ path, text }) => {
    // Blanked rather than removed, so the line numbers still count the fence
    const prose = text.replaceAll(FENCE_REGEX, (fence) => fence.replaceAll(/[^\n]/gu, ""));
    return prose
      .split("\n")
      .map((line, index) => ({ index, line }))
      .filter(({ line }) => POSITIONAL_POINTER_REGEX.test(line))
      .map(({ index }) => ({ detail: `line ${index + 1}`, path, type: SkillDocsFindingType.PositionalPointer }));
  });
