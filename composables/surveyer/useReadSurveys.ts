import { SURVEYER_STORE } from "@/services/surveyer/constants";
import { useSurveyStore } from "@/store/surveyer/survey";
import { jsonDateParse } from "@/util/json";

export const useReadSurveys = async () => {
  const { $client } = useNuxtApp();
  const surveyStore = useSurveyStore();
  const { initialisePaginationData, resetPaginationData, pushSurveys } = surveyStore;
  const { nextCursor, hasMore } = storeToRefs(surveyStore);
  const readMoreSurveys = ref<({ itemsPerPage }: { itemsPerPage: number }) => Promise<void>>();

  await useReadData(
    () => {
      const surveyerStoreJson = localStorage.getItem(SURVEYER_STORE);
      if (surveyerStoreJson)
        initialisePaginationData({
          items: jsonDateParse(surveyerStoreJson),
          nextCursor: null,
          hasMore: false,
        });
      else resetPaginationData();
    },
    async () => {
      initialisePaginationData(await $client.survey.readSurveys.query());

      readMoreSurveys.value = async ({ itemsPerPage }) => {
        const response = await $client.survey.readSurveys.query({
          cursor: nextCursor.value,
          limit: itemsPerPage,
        });
        pushSurveys(response.items);
        nextCursor.value = response.nextCursor;
        hasMore.value = response.hasMore;
      };
    },
    true,
  );

  return readMoreSurveys;
};
