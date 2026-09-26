import type { SkillDocsFile } from "#src/models/sweeps/skillDocs/SkillDocsFile";
import type { SkillDocsFinding } from "#src/models/sweeps/skillDocs/SkillDocsFinding";

import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";

// A page whose last line introduces something with a colon has lost what it introduced — an example or a list an
// Extract left behind on the page it was cut from, where it now sits under a pointer line and reads as its own rule
export const getDanglingLeadInFindings = (files: SkillDocsFile[]): SkillDocsFinding[] =>
  files.flatMap(({ path, text }) => {
    const lastLine = text.trimEnd().split("\n").at(-1) ?? "";
    return lastLine.endsWith(":")
      ? [{ detail: lastLine.trim().slice(0, 80), path, type: SkillDocsFindingType.DanglingLeadIn }]
      : [];
  });
