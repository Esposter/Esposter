import type { Survey } from "#shared/db/schema/surveys";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { useSurveyStore } from "@/store/surveyer/survey";

export const useReadSurveys = async () => {
  const { $trpc } = useNuxtApp();
  const surveyStore = useSurveyStore();
  const { initializeOffsetPaginationData, pushSurveys } = surveyStore;
  const { hasMore, surveys, totalItemsLength } = storeToRefs(surveyStore);
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
      const response = await $trpc.survey.readSurveys.query({
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        sortBy,
      });
      surveys.value = response.items;
      hasMore.value = response.hasMore;
      if (response.items.length === 0) return;
      pushSurveys(...response.items);
    } finally {
      isLoading.value = false;
    }
  };

  initializeOffsetPaginationData(await $trpc.survey.readSurveys.query());
  totalItemsLength.value = await $trpc.survey.count.query();
  return { isLoading, readMoreSurveys };
};
