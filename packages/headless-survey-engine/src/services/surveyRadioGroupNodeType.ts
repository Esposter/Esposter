import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";
import type { SurveyRadioGroupNode } from "#src/models/SurveyRadioGroupNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyRadioGroupNodePropsSchema } from "#src/models/SurveyRadioGroupNodeProps";

// A radio group, whose form and props are one schema and whose defaults are that schema's own
export const surveyRadioGroupNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyRadioGroupNode>["createDefaultProps"];
  formSchema: typeof surveyRadioGroupNodePropsSchema;
  label: string;
  propsSchema: typeof surveyRadioGroupNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyRadioGroupNode>["slots"];
  type: SurveyNodeType.RadioGroup;
} = {
  createDefaultProps: () => surveyRadioGroupNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyRadioGroupNodePropsSchema,
  label: "Radio group",
  propsSchema: surveyRadioGroupNodePropsSchema,
  slots: {},
  type: SurveyNodeType.RadioGroup,
} satisfies SurveyNodeTypeDefinition<SurveyRadioGroupNode>;
