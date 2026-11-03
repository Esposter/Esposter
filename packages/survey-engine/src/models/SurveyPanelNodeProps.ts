import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";
import type { BlockNodeProps } from "headless-block-editor";

import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { surveyConditionSchema } from "#src/services/surveyConditionSchema";
import { z } from "zod";

// The props of a panel: its heading, the conditions that show and enable it, and the nodes it holds
export interface SurveyPanelNodeProps extends BlockNodeProps {
  children: SurveyPlaceableNode[];
  description: string;
  enableIf: string;
  title: string;
  visibleIf: string;
}

// The own props, without the slot, which the node schema adds beside the id
export const surveyPanelNodePropsSchema: z.ZodObject<{
  description: z.ZodDefault<z.ZodString>;
  enableIf: typeof surveyConditionSchema;
  title: z.ZodDefault<z.ZodString>;
  visibleIf: typeof surveyConditionSchema;
}> = z.object({
  description: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  enableIf: surveyConditionSchema,
  title: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  visibleIf: surveyConditionSchema,
});
