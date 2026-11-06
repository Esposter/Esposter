import type { SurveyImagePickerNodeProps } from "#src/models/SurveyImagePickerNodeProps";
import type { SurveyNodeType } from "#src/models/SurveyNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// An image picker question node: the image picker kind's props, under its type tag
export type SurveyImagePickerNode = BlockNode<SurveyNodeType.ImagePicker, SurveyImagePickerNodeProps>;
