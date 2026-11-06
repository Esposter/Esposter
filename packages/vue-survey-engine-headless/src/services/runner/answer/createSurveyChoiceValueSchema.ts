import type { SurveyChoice } from "#src/models/SurveyChoice";

import { createSurveyStringAnswerSchema } from "#src/services/runner/answer/createSurveyStringAnswerSchema";
import {
  SURVEY_NONE_ANSWER,
  SURVEY_NOT_A_CHOICE_MESSAGE,
  SURVEY_REQUIRED_MESSAGE,
} from "#src/services/runner/constants";
import { z } from "zod";

// One value a choice question takes: a choice's own value, the none answer when the question has one, or any text when it has an other answer
export const createSurveyChoiceValueSchema = ({
  choices,
  hasNone = false,
  hasOther = false,
}: {
  choices: SurveyChoice[];
  hasNone?: boolean;
  hasOther?: boolean;
}): z.ZodType<number | string> => {
  const options: z.ZodType<number | string>[] = [
    ...choices.map((choice) => z.literal(choice.value, { error: SURVEY_NOT_A_CHOICE_MESSAGE })),
    ...(hasNone ? [z.literal(SURVEY_NONE_ANSWER, { error: SURVEY_NOT_A_CHOICE_MESSAGE })] : []),
    ...(hasOther ? [createSurveyStringAnswerSchema({}).min(1, { error: SURVEY_REQUIRED_MESSAGE })] : []),
  ];
  return options.length === 0
    ? z.never({ error: SURVEY_NOT_A_CHOICE_MESSAGE })
    : z.union(options, { error: SURVEY_NOT_A_CHOICE_MESSAGE });
};
