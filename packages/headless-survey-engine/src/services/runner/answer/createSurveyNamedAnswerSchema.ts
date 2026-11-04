import { checkSurveyAnswerEmpty } from "#src/services/runner/checkSurveyAnswerEmpty";
import { SURVEY_INVALID_ANSWER_MESSAGE, SURVEY_REQUIRED_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// A record answer keyed by the names of the fields it holds: a name no field declares is refused
// A field left empty is not checked by its schema, as an empty question is not, and a required one that is empty is refused at its own name
// The fields are a matrix's rows, a dynamic matrix's columns, a panel's questions or a multiple text's items
export const createSurveyNamedAnswerSchema = (
  fields: { isRequired?: boolean; name: string; schema: z.ZodType }[],
): z.ZodType =>
  z
    .strictObject(
      Object.fromEntries(
        fields.map(
          (field) =>
            [
              field.name,
              z.preprocess((value) => (checkSurveyAnswerEmpty(value) ? undefined : value), field.schema.optional()),
            ] as const,
        ),
      ),
      { error: SURVEY_INVALID_ANSWER_MESSAGE },
    )
    .superRefine((answer, ctx) => {
      for (const field of fields)
        if (field.isRequired && checkSurveyAnswerEmpty(answer[field.name]))
          ctx.addIssue({ code: "custom", message: SURVEY_REQUIRED_MESSAGE, path: [field.name] });
    });
