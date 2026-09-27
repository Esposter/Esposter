import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getFencedLines } from "#src/services/skills/extract/getFencedLines";

// "See below" names nothing a reader can grep, and it stops pointing anywhere the day either half moves. A quoted
// Or backticked span is prose about the form rather than an instance of it, and a fence is an example's own text
const POSITIONAL_POINTER_REGEX = /\((?:see )?(?:above|below)\)|\bsee (?:above|below)\b|\bas above\b/iu;
const QUOTED_SPAN_REGEX = /"[^"\n]*"|`[^`\n]*`/gu;

export const getPositionalPointerFindings = (files: SkillDocsFile[]): SkillDocsFinding[] =>
  files.flatMap(({ path, text }) => {
    const lines = text.split("\n");
    const fencedLines = getFencedLines(lines);
    return lines
      .map((line, index) => ({ index, line }))
      .filter(
        ({ index, line }) =>
          !fencedLines[index] && POSITIONAL_POINTER_REGEX.test(line.replaceAll(QUOTED_SPAN_REGEX, "")),
      )
      .map(({ index }) => ({ detail: `line ${index + 1}`, path, type: SkillDocsFindingType.PositionalPointer }));
  });
