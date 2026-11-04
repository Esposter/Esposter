import ImageChoicesEditor from "@/components/Resource/Survey/Creator/ImageChoicesEditor.vue";
import ImageUpload from "@/components/Resource/Survey/Creator/ImageUpload.vue";
import { SurveyNodeType } from "headless-survey-engine";

// The editors an image and an image picker take in the Creator's properties, drawn after the list editors. Each takes
// The pointer of the node it edits and writes that node itself, so it is not a list editor under a props key
export const SurveyImageExtras: Partial<Record<SurveyNodeType, Component[]>> = {
  [SurveyNodeType.Image]: [ImageUpload],
  [SurveyNodeType.ImagePicker]: [ImageChoicesEditor],
};
// The props an image kind's editors draw, which its form leaves out so each prop is drawn once
export const SurveyImageExtrasKeyMap: Partial<Record<SurveyNodeType, string[]>> = {
  [SurveyNodeType.ImagePicker]: ["choices"],
};
