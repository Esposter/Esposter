import ImageChoicesEditor from "@/components/Resource/Survey/Creator/ImageChoicesEditor.vue";
import ImageUpload from "@/components/Resource/Survey/Creator/ImageUpload.vue";
import { SurveyNodeType } from "survey-engine";

// The editors an image and an image picker take in the Creator's properties, beside the fields their own form draws
export const SurveyImageExtras: Partial<Record<SurveyNodeType, Component[]>> = {
  [SurveyNodeType.Image]: [ImageUpload],
  [SurveyNodeType.ImagePicker]: [ImageChoicesEditor],
};
