import type { SurveyImagePickerNode } from "#src/models/SurveyImagePickerNode";
import type { SurveyNodeTypeDefinition } from "#src/models/SurveyNodeTypeDefinition";

import { surveyImagePickerNodePropsSchema } from "#src/models/SurveyImagePickerNodeProps";
import { SurveyNodeType } from "#src/models/SurveyNodeType";

// An image picker question. Its form and its props share one schema, since every prop is one its owner edits, and its defaults are the schema's own
export const surveyImagePickerNodeType: {
  createDefaultProps: SurveyNodeTypeDefinition<SurveyImagePickerNode>["createDefaultProps"];
  formSchema: typeof surveyImagePickerNodePropsSchema;
  label: string;
  propsSchema: typeof surveyImagePickerNodePropsSchema;
  slots: SurveyNodeTypeDefinition<SurveyImagePickerNode>["slots"];
  type: SurveyNodeType.ImagePicker;
} = {
  createDefaultProps: () => surveyImagePickerNodePropsSchema.parse({ name: "question" }),
  formSchema: surveyImagePickerNodePropsSchema,
  label: "Image picker",
  propsSchema: surveyImagePickerNodePropsSchema,
  slots: {},
  type: SurveyNodeType.ImagePicker,
} satisfies SurveyNodeTypeDefinition<SurveyImagePickerNode>;
