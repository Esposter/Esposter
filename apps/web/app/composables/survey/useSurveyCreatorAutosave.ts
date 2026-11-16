import type { SurveyDocument } from "vue-survey-engine-headless";

import { useSurveyCreatorStore } from "#src/store/survey/creator";

// Hands the creator's document to `save` on the shared autosave cadence each time it changes. `save` writes at once and
// Queues behind any write before it under its own key, so an edit made during a save is written by the save after it
export const useSurveyCreatorAutosave = (save: (document: SurveyDocument) => void) => {
  const surveyCreatorStore = useSurveyCreatorStore();
  const { document } = storeToRefs(surveyCreatorStore);
  watchAutosave(document, () => {
    save(document.value);
  });
};
