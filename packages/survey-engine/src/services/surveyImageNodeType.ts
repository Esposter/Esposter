import type { SurveyImageNode } from "#src/models/SurveyImageNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyImageNodePropsSchema } from "#src/models/SurveyImageNodeProps";

// An image. It is not a question, so its form and its props share one schema of its own props, and its defaults are the schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveyImageNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyImageNode>["createDefaultProps"];
  formSchema: typeof surveyImageNodePropsSchema;
  label: string;
  propsSchema: typeof surveyImageNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyImageNode>["slots"];
  type: SurveyNodeType.Image;
} = {
  createDefaultProps: () => surveyImageNodePropsSchema.parse({ name: "image" }),
  formSchema: surveyImageNodePropsSchema,
  label: "Image",
  propsSchema: surveyImageNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Image,
} satisfies SurveyNodeTypeDefinition<SurveyImageNode>;
