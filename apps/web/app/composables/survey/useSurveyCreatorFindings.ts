import { getSurveyEditorFindings } from "#src/services/resource/survey/getSurveyEditorFindings";
import { useSurveyCreatorStore } from "#src/store/survey/creator";

// The findings of the survey creator's document, which the problems surface lists. They are recomputed once an edit settles
export const useSurveyCreatorFindings = () => {
  const surveyCreatorStore = useSurveyCreatorStore();
  const { document } = storeToRefs(surveyCreatorStore);
  return useEditorFindings(document, getSurveyEditorFindings);
};
