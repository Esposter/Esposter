import type { Survey } from "#shared/db/schema/surveys";
import type { SurveyCreatorModel } from "survey-creator-core";

import { THEME_KEY } from "@/services/survey/constants";
import { useSurveyStore } from "@/store/survey";

export const useSave = (survey: Ref<Survey>, creator: SurveyCreatorModel) => {
  const surveyStore = useSurveyStore();
  const { updateSurveyModel } = surveyStore;
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
