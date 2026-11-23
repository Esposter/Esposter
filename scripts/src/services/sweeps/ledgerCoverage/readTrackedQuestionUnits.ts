import { readQuestionUnits } from "#src/services/sweeps/ledgerCoverage/readQuestionUnits";
import { readTrackedFiles } from "#src/services/sweeps/ledgerCoverage/readTrackedFiles";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";

// Each question's units over the tracked files the sweeps scan, read off the working tree in one call
export const readTrackedQuestionUnits = (): Record<string, string[]> =>
  readQuestionUnits(readTrackedFiles(readVendoredSkillNames()));
