import type { SurveyChoice } from "survey-engine";

import { checkIsBlankSource } from "@/services/emailEditor/checkIsBlankSource";
import { parseChoiceLine } from "@/services/resource/survey/parseChoiceLine";

// The choices a paste of several lines becomes, one for each line that is not blank
export const parseChoiceLines = (text: string): SurveyChoice[] =>
  text
    .split(/\r?\n/u)
    .filter((line) => !checkIsBlankSource(line))
    .map((line) => parseChoiceLine(line));
