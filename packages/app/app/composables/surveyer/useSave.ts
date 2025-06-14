import type { Survey } from "#shared/db/schema/surveys";
import type { SurveyCreatorModel } from "survey-creator-core";

import { THEME_KEY } from "@/services/surveyer/constants";
import { useSurveyStore } from "@/store/surveyer/survey";

export const useSave = (survey: Ref<Survey>, creator: SurveyCreatorModel) => {
  const surveyerStore = useSurveyStore();
  const { updateSurveyModel } = surveyerStore;
  return async (saveNo: number, callback: (saveNo: number, isSuccessful: boolean) => void) => {
    try {
      if (creator.text === survey.value.model) {
        callback(saveNo, true);
        return;
      }

      Object.assign(
        survey.value,
        await updateSurveyModel({
          id: survey.value.id,
          model: JSON.stringify({ ...creator.JSON, [THEME_KEY]: creator.theme }),
          modelVersion: survey.value.modelVersion,
        }),
      );
      callback(saveNo, true);
    } catch {
      callback(saveNo, false);
    }
  };
};
