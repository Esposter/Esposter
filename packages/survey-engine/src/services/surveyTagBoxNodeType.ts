import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";
import type { SurveyTagBoxNode } from "#src/models/SurveyTagBoxNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyTagBoxNodePropsSchema } from "#src/models/SurveyTagBoxNodeProps";

// A tag box, whose form and props are one schema and whose defaults are that schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveyTagBoxNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyTagBoxNode>["createDefaultProps"];
  formSchema: typeof surveyTagBoxNodePropsSchema;
  label: string;
  propsSchema: typeof surveyTagBoxNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyTagBoxNode>["slots"];
  type: SurveyNodeType.TagBox;
} = {
  createDefaultProps: () => surveyTagBoxNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyTagBoxNodePropsSchema,
  label: "Tag box",
  propsSchema: surveyTagBoxNodePropsSchema,
  slots: {},
  type: SurveyNodeType.TagBox,
} satisfies SurveyNodeTypeDefinition<SurveyTagBoxNode>;
