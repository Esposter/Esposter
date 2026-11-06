import type { BlockNodeProps, OwnProps } from "vue-block-editor-headless";

import { MAX_SURVEY_HTML_LENGTH } from "#src/services/constants";
import { surveyConditionSchema } from "#src/services/surveyConditionSchema";
import { surveyNameSchema } from "#src/services/surveyNameSchema";
import { z } from "zod";

// The props of a text block: markup a reader sees between questions, which asks nothing and so holds no answer
export interface SurveyHtmlNodeProps extends BlockNodeProps {
  html: string;
  name: string;
  visibleIf: string;
}

// The markup is kept as its owner wrote it, since it is sanitised where it renders, and a copy sanitised here would drift from that
export const surveyHtmlNodePropsSchema: z.ZodObject<{
  html: z.ZodDefault<z.ZodString>;
  name: typeof surveyNameSchema;
  visibleIf: typeof surveyConditionSchema;
}> = z.object({
  html: z.string().max(MAX_SURVEY_HTML_LENGTH).default(""),
  name: surveyNameSchema,
  visibleIf: surveyConditionSchema,
}) satisfies z.ZodType<OwnProps<SurveyHtmlNodeProps>>;
