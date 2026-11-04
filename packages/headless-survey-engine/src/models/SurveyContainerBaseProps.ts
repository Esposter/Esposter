import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { surveyConditionSchema } from "#src/services/surveyConditionSchema";
import { z } from "zod";

// The fields every container holds besides its id and its nodes, so each container's own schema spreads the shape below
export const surveyContainerBasePropsShape: {
  description: z.ZodDefault<z.ZodString>;
  title: z.ZodDefault<z.ZodString>;
  visibleIf: typeof surveyConditionSchema;
} = {
  description: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  title: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  visibleIf: surveyConditionSchema,
};
