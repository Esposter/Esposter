import type { SurveyButtonGroupNode } from "#src/models/SurveyButtonGroupNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyButtonGroupNodePropsSchema } from "#src/models/SurveyButtonGroupNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// A button group, whose form and props are one schema and whose defaults are that schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveyButtonGroupNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyButtonGroupNode>["createDefaultProps"];
  formSchema: typeof surveyButtonGroupNodePropsSchema;
  label: string;
  propsSchema: typeof surveyButtonGroupNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyButtonGroupNode>["slots"];
  type: SurveyNodeType.ButtonGroup;
} = {
  createDefaultProps: () => surveyButtonGroupNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyButtonGroupNodePropsSchema,
  label: "Button group",
  propsSchema: surveyButtonGroupNodePropsSchema,
  slots: {},
  type: SurveyNodeType.ButtonGroup,
} satisfies SurveyNodeTypeDefinition<SurveyButtonGroupNode>;
