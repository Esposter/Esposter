import type { Survey } from "#shared/db/schema/surveys";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { useSurveyStore } from "@/store/survey";

export const useReadSurveys = async () => {
  const { $trpc } = useNuxtApp();
  const surveyStore = useSurveyStore();
  const { hasMore, surveys, totalItemsLength } = storeToRefs(surveyStore);
  const isLoading = ref(false);
  // This is also used by v-data-table-server to initialize the offset pagination data
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
      const { hasMore: newHasMore, items } = await $trpc.survey.readSurveys.query({
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        sortBy,
      });
      surveys.value = items;
      hasMore.value = newHasMore;
    } finally {
      isLoading.value = false;
    }
  };

  totalItemsLength.value = await $trpc.survey.count.query();
  return { isLoading, readMoreSurveys };
};
