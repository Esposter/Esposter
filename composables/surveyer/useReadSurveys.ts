import { SURVEYER_STORE } from "@/services/surveyer/constants";
import { useSurveyStore } from "@/store/surveyer/survey";
import { jsonDateParse } from "@/util/json";

export const useReadSurveys = async () => {
  const { $client } = useNuxtApp();
  const surveyStore = useSurveyStore();
  const { pushSurveyList, updateSurveyListNextCursor, initialiseSurveyList } = surveyStore;
  const { surveyListNextCursor } = storeToRefs(surveyStore);
  const readMoreSurveys = ref<(onComplete: () => void) => Promise<void>>();

  await useReadData(
    () => {
      const surveyerStoreJson = localStorage.getItem(SURVEYER_STORE);
      if (surveyerStoreJson) initialiseSurveyList(jsonDateParse(surveyerStoreJson));
    },
    async () => {
      const { surveys, nextCursor } = await $client.surveyer.readSurveys.query({ cursor: null });
      initialiseSurveyList(surveys);
      updateSurveyListNextCursor(nextCursor);

      readMoreSurveys.value = async (onComplete) => {
        try {
          const { surveys, nextCursor } = await $client.surveyer.readSurveys.query({
            cursor: surveyListNextCursor.value,
          });
          pushSurveyList(surveys);
          updateSurveyListNextCursor(nextCursor);
        } finally {
          onComplete();
        }
      };
    },
  );

  return readMoreSurveys;
};
