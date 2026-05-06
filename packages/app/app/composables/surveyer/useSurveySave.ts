import type { Survey } from "@esposter/db-schema";
import type { SurveyCreatorModel } from "survey-creator-core";

import { THEME_KEY } from "@/services/survey/constants";
import { useSurveyStore } from "@/store/survey";
import { getResultAsync, noop } from "@esposter/shared";

export const useSurveySave = (survey: Ref<Survey>, creator: SurveyCreatorModel) => {
  const surveyStore = useSurveyStore();
  const { updateSurveyModel } = surveyStore;
  return async (saveNo: number, callback: (saveNo: number, isSuccessful: boolean) => void) => {
    await getResultAsync(async () => {
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
    }).match(noop, () => {
      callback(saveNo, false);
    });
  };
};
