import type { SurveyChoice } from "#src/models/SurveyChoice";

import { surveyChoiceSchema } from "#src/models/SurveyChoice";
import { MAX_SURVEY_CHOICE_COUNT } from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The choices a question offers, unique by their value since the value is what an answer holds
export interface SurveyChoicesProps {
  choices: SurveyChoice[];
}

export const surveyChoicesPropsShape: { choices: z.ZodDefault<z.ZodArray<typeof surveyChoiceSchema>> } = {
  choices: createUniqueArraySchema(surveyChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).default([]),
};
