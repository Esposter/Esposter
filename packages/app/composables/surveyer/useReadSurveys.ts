import type { SortItem } from "@/models/shared/pagination/sorting/SortItem";
import type { Survey } from "@/server/db/schema/surveys";

import { useSurveyStore } from "@/store/surveyer/survey";

export const useReadSurveys = async () => {
  const { $client } = useNuxtApp();
  const surveyStore = useSurveyStore();
  const { initializeOffsetPaginationData } = surveyStore;
  const { hasMore, surveyList, totalItemsLength } = storeToRefs(surveyStore);
  const isLoading = ref(false);
  const readMoreSurveys = async ({
    itemsPerPage,
    page,
    sortBy,
  }: {
    itemsPerPage: number;
    page: number;
    sortBy: SortItem<keyof Survey>[];
  }) => {
    isLoading.value = true;
    try {
      const response = await $client.survey.readSurveys.query({
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        sortBy,
      });
      surveyList.value = response.items;
      hasMore.value = response.hasMore;
    } finally {
      isLoading.value = false;
    }
  };

  initializeOffsetPaginationData(await $client.survey.readSurveys.query());
  totalItemsLength.value = await $client.survey.count.query();
  return { isLoading, readMoreSurveys };
};
