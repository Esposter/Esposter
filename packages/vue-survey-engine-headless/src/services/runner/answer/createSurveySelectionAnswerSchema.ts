import type { SurveyChoice } from "#src/models/SurveyChoice";
import type { z } from "zod";

import { MAX_SURVEY_ANSWER_ENTRY_COUNT } from "#src/services/constants";
import { createSurveyChoiceValueSchema } from "#src/services/runner/answer/createSurveyChoiceValueSchema";
import {
  SURVEY_INVALID_ANSWER_MESSAGE,
  SURVEY_NONE_ANSWER,
  SURVEY_TOO_FEW_SELECTED_MESSAGE,
  SURVEY_TOO_MANY_SELECTED_MESSAGE,
} from "#src/services/runner/constants";
import { createUniqueArraySchema } from "@esposter/shared";

// A list of distinct choice values, bounded by how many a respondent must pick and may pick
// None is picked alone, so a list holding it beside another answer is refused
export const createSurveySelectionAnswerSchema = ({
  choices,
  hasNone = false,
  hasOther = false,
  maxSelected,
  minSelected,
}: {
  choices: SurveyChoice[];
  hasNone?: boolean;
  hasOther?: boolean;
  maxSelected?: number;
  minSelected?: number;
}): z.ZodArray<z.ZodType<number | string>> =>
  createUniqueArraySchema(createSurveyChoiceValueSchema({ choices, hasNone, hasOther }))
    .min(minSelected ?? 0, { error: SURVEY_TOO_FEW_SELECTED_MESSAGE })
    .max(maxSelected ?? MAX_SURVEY_ANSWER_ENTRY_COUNT, { error: SURVEY_TOO_MANY_SELECTED_MESSAGE })
    .refine((selected) => !hasNone || !selected.includes(SURVEY_NONE_ANSWER) || selected.length === 1, {
      error: SURVEY_INVALID_ANSWER_MESSAGE,
    });
