import { SurveyMultipleTextItemInputType } from "#src/models/SurveyMultipleTextItemInputType";
import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { surveyNameSchema } from "#src/services/surveyNameSchema";
import { z } from "zod";

// An item of a multiple text question: one input of the question, named and typed by the input it takes
export interface SurveyMultipleTextItem {
  inputType: SurveyMultipleTextItemInputType;
  isRequired: boolean;
  name: string;
  title: string;
}

export const surveyMultipleTextItemSchema: z.ZodObject<{
  inputType: z.ZodEnum<typeof SurveyMultipleTextItemInputType>;
  isRequired: z.ZodDefault<z.ZodBoolean>;
  name: typeof surveyNameSchema;
  title: z.ZodDefault<z.ZodString>;
}> = z.object({
  inputType: z.enum(SurveyMultipleTextItemInputType),
  isRequired: z.boolean().default(false),
  name: surveyNameSchema,
  title: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<SurveyMultipleTextItem>;
