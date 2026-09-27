import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getFencedLines } from "#src/services/skills/extract/getFencedLines";

// "See below" names nothing a reader can grep, and it stops pointing anywhere the day either half moves. A quoted
// Or backticked span is prose about the form rather than an instance of it, and a fence is an example's own text. A
// Backticked span closes on the next run of exactly its own length, as markdown reads it, so ``see above`` is one
// Span rather than two empty ones with the pointer standing between them
const POSITIONAL_POINTER_REGEX = /\((?:see )?(?:above|below)\)|\bsee (?:above|below)\b|\bas above\b/iu;
const QUOTED_SPAN_REGEX = /"[^"\n]*"|(?<backtickRun>`+)(?!`)[^\n]*?(?<!`)\k<backtickRun>(?!`)/gu;
// A heading named and then placed — `see "Heading" below` — reads as a citation, but the word after it is what a
// Reader follows, and it goes wrong the day the section moves; "on this page" is the form that survives a move. The
// Pointer ends its clause, where a real placement runs on to what it is placed against (`**top**, above the macros`)
const PLACED_HEADING_REGEX = /(?:"[^"\n]+"|\*\*[^*\n]+\*\*),? (?:above|below)(?=[).,;:]|$)/u;
const BACKTICK_SPAN_REGEX = /(?<backtickRun>`+)(?!`)[^\n]*?(?<!`)\k<backtickRun>(?!`)/gu;

export const getPositionalPointerFindings = (files: SkillDocsFile[]): SkillDocsFinding[] =>
  files.flatMap(({ path, text }) => {
    const lines = text.split("\n");
    const fencedLines = getFencedLines(lines);
    return lines
      .map((line, index) => ({ index, line }))
      .filter(
        ({ index, line }) =>
          !fencedLines[index] &&
          (POSITIONAL_POINTER_REGEX.test(line.replaceAll(QUOTED_SPAN_REGEX, "")) ||
            PLACED_HEADING_REGEX.test(line.replaceAll(BACKTICK_SPAN_REGEX, ""))),
      )
      .map(({ index }) => ({ detail: `line ${index + 1}`, path, type: SkillDocsFindingType.PositionalPointer }));
  });
