import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Survey } from "@esposter/db-schema";

import { getResultAsync } from "#shared/util/getResultAsync";
import { withFinalizer } from "#shared/util/withFinalizer";
import { useSurveyStore } from "@/store/survey";

export const useReadSurveys = () => {
  const { $trpc } = useNuxtApp();
  const surveyStore = useSurveyStore();
  const { count, hasMore, items } = storeToRefs(surveyStore);
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
    await withFinalizer(
      getResultAsync(async () => {
        const [newCount, { hasMore: newHasMore, items: newItems }] = await Promise.all([
          $trpc.survey.count.query(),
          $trpc.survey.readSurveys.query({
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage,
            sortBy,
          }),
        ]);
        count.value = newCount;
        hasMore.value = newHasMore;
        items.value = newItems;
      }),
      () =>
        getResultAsync(() => {
          isLoading.value = false;
        }),
    );
  };
  return { isLoading, readSurveys };
};
