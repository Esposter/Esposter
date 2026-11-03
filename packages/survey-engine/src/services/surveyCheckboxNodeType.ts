import type { SurveyCheckboxNode } from "#src/models/SurveyCheckboxNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyCheckboxNodePropsSchema } from "#src/models/SurveyCheckboxNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// A checkboxes question, whose form and props are one schema and whose defaults are that schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveyCheckboxNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyCheckboxNode>["createDefaultProps"];
  formSchema: typeof surveyCheckboxNodePropsSchema;
  label: string;
  propsSchema: typeof surveyCheckboxNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyCheckboxNode>["slots"];
  type: SurveyNodeType.Checkbox;
} = {
  createDefaultProps: () => surveyCheckboxNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyCheckboxNodePropsSchema,
  label: "Checkboxes",
  propsSchema: surveyCheckboxNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Checkbox,
} satisfies SurveyNodeTypeDefinition<SurveyCheckboxNode>;
