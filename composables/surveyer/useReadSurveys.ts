import type { Survey } from "@/db/schema/surveys";
import type { SortItem } from "@/models/shared/pagination/SortItem";
import { useSurveyStore } from "@/store/surveyer/survey";

export const useReadSurveys = async () => {
  const { $client } = useNuxtApp();
  const surveyStore = useSurveyStore();
  const { initialisePaginationData, pushSurveys } = surveyStore;
  const { totalItemsLength, nextCursor, hasMore } = storeToRefs(surveyStore);
  const readMoreSurveys = async ({
    page,
    itemsPerPage,
    sortBy,
  }: {
    page: number;
    itemsPerPage: number;
    sortBy: SortItem<keyof Survey>[];
  }) => {
    const response = await $client.survey.readSurveys.query({
      cursor: nextCursor.value,
      limit: itemsPerPage,
      sortBy,
    });
    pushSurveys(response.items);
    nextCursor.value = response.nextCursor;
    hasMore.value = response.hasMore;
  };

  initialisePaginationData(await $client.survey.readSurveys.query());
  totalItemsLength.value = await $client.survey.count.query();
  return readMoreSurveys;
};
