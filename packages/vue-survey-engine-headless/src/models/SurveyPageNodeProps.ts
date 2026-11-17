import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";
import type { BlockNodeProps, OwnProps } from "vue-block-editor-headless";

import { surveyContainerBasePropsShape } from "#src/models/SurveyContainerBaseProps";
import { surveyConditionSchema } from "#src/services/surveyConditionSchema";
import { z } from "zod";

// The props of a page: its heading, the conditions that show and enable it, and the nodes it holds
export interface SurveyPageNodeProps extends BlockNodeProps {
  children: SurveyPlaceableNode[];
  description: string;
  enableIf: string;
  title: string;
  visibleIf: string;
}

// The own props, without the slot, which the node schema adds beside the id. The enable condition is the panel's, held as a required string
export const surveyPageNodePropsSchema: z.ZodObject<typeof surveyContainerBasePropsShape & { enableIf: z.ZodString }> =
  z.object({ ...surveyContainerBasePropsShape, enableIf: surveyConditionSchema.unwrap() }) satisfies z.ZodType<
    OwnProps<SurveyPageNodeProps>
  >;
