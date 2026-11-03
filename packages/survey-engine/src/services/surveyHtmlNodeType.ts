import type { SurveyHtmlNode } from "#src/models/SurveyHtmlNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyHtmlNodePropsSchema } from "#src/models/SurveyHtmlNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// A text block. It is not a question, so its form and its props share one schema of its own props, and its defaults are the schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveyHtmlNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyHtmlNode>["createDefaultProps"];
  formSchema: typeof surveyHtmlNodePropsSchema;
  label: string;
  propsSchema: typeof surveyHtmlNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyHtmlNode>["slots"];
  type: SurveyNodeType.Html;
} = {
  createDefaultProps: () => surveyHtmlNodePropsSchema.parse({ name: "block" }),
  formSchema: surveyHtmlNodePropsSchema,
  label: "Text block",
  propsSchema: surveyHtmlNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Html,
} satisfies SurveyNodeTypeDefinition<SurveyHtmlNode>;
