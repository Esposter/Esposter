import type { SurveyImageBoxProps } from "#src/models/SurveyImageBoxProps";
import type { BlockNodeProps, OwnProps } from "vue-block-editor-headless";

import { surveyImageBoxPropsShape } from "#src/models/SurveyImageBoxProps";
import { MAX_SURVEY_TEXT_LENGTH, MAX_SURVEY_URL_LENGTH } from "#src/services/constants";
import { surveyConditionSchema } from "#src/services/surveyConditionSchema";
import { surveyNameSchema } from "#src/services/surveyNameSchema";
import { z } from "zod";

// The props of an image: the picture it loads from, the text a reader without it gets and the box it is drawn in
export interface SurveyImageNodeProps extends BlockNodeProps, SurveyImageBoxProps {
  altText: string;
  imageLink: string;
  name: string;
  visibleIf: string;
}

// An empty alt text marks the picture as decoration, so it is the empty string and not an absent one
export const surveyImageNodePropsSchema: z.ZodObject<
  typeof surveyImageBoxPropsShape & {
    altText: z.ZodDefault<z.ZodString>;
    imageLink: z.ZodDefault<z.ZodString>;
    name: typeof surveyNameSchema;
    visibleIf: typeof surveyConditionSchema;
  }
> = z.object({
  ...surveyImageBoxPropsShape,
  altText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  imageLink: z.string().max(MAX_SURVEY_URL_LENGTH).default(""),
  name: surveyNameSchema,
  visibleIf: surveyConditionSchema,
}) satisfies z.ZodType<OwnProps<SurveyImageNodeProps>>;
