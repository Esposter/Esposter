import type { SurveyChoice } from "headless-survey-engine";

import { parseChoiceLine } from "@/services/resource/survey/parseChoiceLine";

// Choices typed or pasted as lines, a choice per line, with the blank lines dropped. Blank text makes no choices
export const parseChoiceLines = (text: string): SurveyChoice[] =>
  text
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== "")
    .map((line) => parseChoiceLine(line));
