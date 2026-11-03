import type { SurveyChoice } from "survey-engine";

import { parseChoiceLine } from "@/services/resource/survey/parseChoiceLine";
import { checkIsBlankSource } from "@/services/shared/checkIsBlankSource";

// The choices a paste of several lines becomes, one for each line that is not blank
export const parseChoiceLines = (text: string): SurveyChoice[] =>
  text
    .split(/\r?\n/u)
    .filter((line) => !checkIsBlankSource(line))
    .map((line) => parseChoiceLine(line));
