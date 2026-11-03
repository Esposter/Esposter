import type { SurveyMultipleTextItem } from "#src/models/SurveyMultipleTextItem";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyMultipleTextItemSchema } from "#src/models/SurveyMultipleTextItem";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The most inputs one multiple text question holds, so the question stays a form a respondent fills in one pass
const MAX_SURVEY_MULTIPLE_TEXT_ITEM_COUNT = 50;

// The props of a multiple text question: the inputs it asks for, each one a named text field
export interface SurveyMultipleTextNodeProps extends SurveyQuestionBaseProps {
  items: SurveyMultipleTextItem[];
}

// Items are unique by their name, since the name is the key each answer is held under
export const surveyMultipleTextNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & { items: z.ZodDefault<z.ZodArray<typeof surveyMultipleTextItemSchema>> }
> = z.object({
  ...surveyQuestionBasePropsShape,
  items: createUniqueArraySchema(surveyMultipleTextItemSchema, "name")
    .max(MAX_SURVEY_MULTIPLE_TEXT_ITEM_COUNT)
    .default([]),
}) satisfies z.ZodType<OwnProps<SurveyMultipleTextNodeProps>>;
