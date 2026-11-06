import type { SurveyMultipleTextNode } from "#src/models/SurveyMultipleTextNode";

import { SurveyMultipleTextItemInputType } from "#src/models/SurveyMultipleTextItemInputType";
import { createSurveyNamedAnswerSchema } from "#src/services/runner/answer/createSurveyNamedAnswerSchema";
import { createSurveyStringAnswerSchema } from "#src/services/runner/answer/createSurveyStringAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { z } from "zod";

// A multiple text's answer: a record from each item's name to the text typed into it, an email item held to the email format
export const createSurveyMultipleTextAnswerSchema = (node: SurveyMultipleTextNode): z.ZodType =>
  createSurveyNamedAnswerSchema(
    node.props.items.map((item) => ({
      isRequired: item.isRequired,
      name: item.name,
      schema:
        item.inputType === SurveyMultipleTextItemInputType.Email
          ? z.email({ error: SURVEY_INVALID_ANSWER_MESSAGE })
          : createSurveyStringAnswerSchema({}),
    })),
  );
