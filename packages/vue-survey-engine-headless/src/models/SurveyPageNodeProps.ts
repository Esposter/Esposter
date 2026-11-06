import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";
import type { BlockNodeProps, OwnProps } from "vue-block-editor-headless";

import { surveyContainerBasePropsShape } from "#src/models/SurveyContainerBaseProps";
import { z } from "zod";

// The props of a page: its heading, the condition that shows it, and the nodes it holds
export interface SurveyPageNodeProps extends BlockNodeProps {
  children: SurveyPlaceableNode[];
  description: string;
  title: string;
  visibleIf: string;
}

// The own props, without the slot, which the node schema adds beside the id
export const surveyPageNodePropsSchema: z.ZodObject<typeof surveyContainerBasePropsShape> = z.object({
  ...surveyContainerBasePropsShape,
}) satisfies z.ZodType<OwnProps<SurveyPageNodeProps>>;
