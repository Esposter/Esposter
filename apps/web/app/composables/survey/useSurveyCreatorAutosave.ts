import type { SurveyDocument } from "headless-survey-engine";

import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useSurveyCreatorStore } from "@/store/survey/creator";

// Saves the creator's document on the shared autosave cadence each time it changes. The saves are one write queue under one
// Key, so no two run at once, and each saves the document as it stands when its turn comes, so an edit made during a save is
// Written by the save after it rather than dropped
export const useSurveyCreatorAutosave = (save: (document: SurveyDocument) => Promise<boolean>) => {
  const surveyCreatorStore = useSurveyCreatorStore();
  const { document } = storeToRefs(surveyCreatorStore);
  const { executeMutation, isPending } = useMutation();
  const hasError = ref(false);
  const write = () =>
    executeMutation(() => save(document.value), {
      key: "save",
      onError: (error) => {
        hasError.value = true;
        createErrorAlert(error);
      },
      onSuccess: (isSaved) => {
        hasError.value = !isSaved;
      },
    });
  watchAutosave(document, write);

  return { hasError, isSaving: isPending };
};
