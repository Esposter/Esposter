import { type Survey } from "@/db/schema/surveys";
import { type SortItem } from "@/models/shared/pagination/sorting/SortItem";
import { useSurveyStore } from "@/store/surveyer/survey";

export const useReadSurveys = async () => {
  const { $client } = useNuxtApp();
  const surveyStore = useSurveyStore();
  const { initializeOffsetPaginationData } = surveyStore;
  const { surveyList, hasMore, totalItemsLength } = storeToRefs(surveyStore);
  const isLoading = ref(false);
  const readMoreSurveys = async ({
    page,
    itemsPerPage,
    sortBy,
  }: {
    page: number;
    itemsPerPage: number;
    sortBy: SortItem<keyof Survey>[];
  }) => {
    isLoading.value = true;
    try {
      const response = await $client.survey.readSurveys.query({
        offset: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
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
