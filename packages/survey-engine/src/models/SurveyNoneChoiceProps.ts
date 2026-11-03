import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// The none answer a choice question may offer beside its choices, which excludes every other choice
export interface SurveyNoneChoiceProps {
  hasNone: boolean;
  noneText: string;
}

export const surveyNoneChoicePropsShape: { hasNone: z.ZodDefault<z.ZodBoolean>; noneText: z.ZodDefault<z.ZodString> } =
  { hasNone: z.boolean().default(false), noneText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default("") };
