import type { SurveyCommentNode } from "#src/models/SurveyCommentNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyCommentNodePropsSchema } from "#src/models/SurveyCommentNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// A comment question, whose form and props are one schema and whose defaults are that schema's own
// The type is written out so the schema's shape survives into the emitted declaration
export const surveyCommentNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyCommentNode>["createDefaultProps"];
  formSchema: typeof surveyCommentNodePropsSchema;
  label: string;
  propsSchema: typeof surveyCommentNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyCommentNode>["slots"];
  type: SurveyNodeType.Comment;
} = {
  createDefaultProps: () => surveyCommentNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyCommentNodePropsSchema,
  label: "Comment",
  propsSchema: surveyCommentNodePropsSchema,
  slots: {},
  type: SurveyNodeType.Comment,
} satisfies SurveyNodeTypeDefinition<SurveyCommentNode>;
