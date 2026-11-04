import { useSurveyCreatorStore } from "@/store/survey/creator";
import { getBlockNode } from "headless-block-editor";
import { surveyNodeChildren } from "headless-survey-engine";

// The node a pointer names in the creator's document, with the writes to its props and the picture uploads its files take,
// So an editor of one node reads it and writes it at its own pointer
export const useSurveyPointerNode = (pointer: MaybeRefOrGetter<string>) => {
  const surveyCreatorStore = useSurveyCreatorStore();
  const { document } = storeToRefs(surveyCreatorStore);
  const { updateNodeProps } = useSurveyCreatorCommands();
  const { uploadPicked } = useSurveyFiles();
  return {
    node: computed(() => getBlockNode(document.value, toValue(pointer), surveyNodeChildren)),
    updateNodeProps: (props: Record<string, unknown>) => updateNodeProps(toValue(pointer), props),
    uploadPicked,
  };
};
