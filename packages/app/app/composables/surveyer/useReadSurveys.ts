import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Survey } from "@esposter/db";

import { useSurveyStore } from "@/store/survey";

export const useReadSurveys = () => {
  const { $trpc } = useNuxtApp();
  const surveyStore = useSurveyStore();
  const { hasMore, items, totalItemsLength } = storeToRefs(surveyStore);
  const isLoading = ref(false);
  const readSurveys = async ({
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
      const [count, { hasMore: newHasMore, items: newItems }] = await Promise.all([
        $trpc.survey.count.query(),
        $trpc.survey.readSurveys.query({
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          sortBy,
        }),
      ]);
      totalItemsLength.value = count;
      hasMore.value = newHasMore;
      items.value = newItems;
    } finally {
      isLoading.value = false;
    }
  };
  return { isLoading, readSurveys };
};
