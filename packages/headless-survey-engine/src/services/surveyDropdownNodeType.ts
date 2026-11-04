import type { SurveyDropdownNode } from "#src/models/SurveyDropdownNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyDropdownNodePropsSchema } from "#src/models/SurveyDropdownNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// A dropdown, whose form and props are one schema and whose defaults are that schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveyDropdownNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyDropdownNode>["createDefaultProps"];
  formSchema: typeof surveyDropdownNodePropsSchema;
  label: string;
  propsSchema: typeof surveyDropdownNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyDropdownNode>["slots"];
  type: SurveyNodeType.Dropdown;
} = {
  createDefaultProps: () => surveyDropdownNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyDropdownNodePropsSchema,
  label: "Dropdown",
  propsSchema: surveyDropdownNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Dropdown,
} satisfies SurveyNodeTypeDefinition<SurveyDropdownNode>;
