import { isSurveyAnswerEmpty } from "#src/services/runner/answer/isSurveyAnswerEmpty";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// A record answer keyed by the names of the fields it holds: a name no field declares is refused
// A required field must hold something, and the fields are a matrix's rows, a dynamic matrix's columns, a panel's questions or a multiple text's items
export const createSurveyNamedAnswerSchema = (
  fields: { isRequired?: boolean; name: string; schema: z.ZodType }[],
): z.ZodType =>
  z
    .strictObject(Object.fromEntries(fields.map((field) => [field.name, field.schema.optional()] as const)), {
      error: SURVEY_INVALID_ANSWER_MESSAGE,
    })
    .refine((answer) => fields.every((field) => !field.isRequired || !isSurveyAnswerEmpty(answer[field.name])), {
      error: SURVEY_REQUIRED_MESSAGE,
    });
