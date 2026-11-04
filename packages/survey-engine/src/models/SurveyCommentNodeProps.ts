import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// The most rows a comment's box may show, so a box cannot take over the page it sits on
const MAX_SURVEY_COMMENT_ROWS = 20;

// The props of a comment question: a box of text, sized in rows and optionally bounded in characters
export interface SurveyCommentNodeProps extends SurveyQuestionBaseProps {
  maxLength?: number;
  placeholder: string;
  rows: number;
}

export const surveyCommentNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    maxLength: z.ZodOptional<z.ZodInt>;
    placeholder: z.ZodDefault<z.ZodString>;
    rows: z.ZodDefault<z.ZodInt>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  maxLength: z.int().positive().optional(),
  placeholder: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  rows: z.int().min(1).max(MAX_SURVEY_COMMENT_ROWS).default(4),
}) satisfies z.ZodType<OwnProps<SurveyCommentNodeProps>>;
