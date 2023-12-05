import { SURVEYER_STORE } from "@/services/surveyer/constants";
import { useSurveyStore } from "@/store/surveyer/survey";
import { jsonDateParse } from "@/util/json";

export const useReadSurveys = async () => {
  const { $client } = useNuxtApp();
  const surveyStore = useSurveyStore();
  const { initialisePaginationData, pushSurveys } = surveyStore;
  const { nextCursor, hasMore } = storeToRefs(surveyStore);
  const readMoreSurveys = ref<(onComplete: () => void) => Promise<void>>();

  await useReadData(
    () => {
      const surveyerStoreJson = localStorage.getItem(SURVEYER_STORE);
      if (surveyerStoreJson)
        initialisePaginationData({
          items: jsonDateParse(surveyerStoreJson),
          nextCursor: null,
          hasMore: false,
        });
      else initialisePaginationData();
    },
    async () => {
      initialisePaginationData(await $client.surveyer.readSurveys.query());

      readMoreSurveys.value = async (onComplete) => {
        try {
          const response = await $client.surveyer.readSurveys.query({
            cursor: nextCursor.value,
          });
          pushSurveys(response.items);
          nextCursor.value = response.nextCursor;
          hasMore.value = response.hasMore;
        } finally {
          onComplete();
        }
      };
    },
  );

  return readMoreSurveys;
};
