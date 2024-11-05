import type { Survey } from "@/server/db/schema/surveys";
import type { CreateSurveyInput, DeleteSurveyInput, UpdateSurveyInput } from "@/server/trpc/routers/survey";

import { DatabaseEntityType } from "@/models/shared/entity/DatabaseEntityType";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { createOffsetPaginationData } from "@/services/shared/pagination/offset/createOffsetPaginationData";

export const useSurveyStore = defineStore("surveyer/survey", () => {
  const { $client } = useNuxtApp();
  const { itemList, ...restData } = createOffsetPaginationData<Survey>();
  const {
    createSurvey: storeCreateSurvey,
    deleteSurvey: storeDeleteSurvey,
    updateSurvey: storeUpdateSurvey,
    ...restOperationData
  } = createOperationData(itemList, DatabaseEntityType.Survey);

  const createSurvey = async (input: CreateSurveyInput) => {
    const newSurvey = await $client.survey.createSurvey.mutate(input);
    if (!newSurvey) return;

    storeCreateSurvey(newSurvey);
    totalItemsLength.value++;
  };
  const updateSurvey = async (input: UpdateSurveyInput) => {
    input.modelVersion++;
    const updatedSurvey = await $client.survey.updateSurvey.mutate(input);
    // Surveyjs needs to know whether the save was successful with a boolean
    if (!updatedSurvey) return false;

    storeUpdateSurvey(updatedSurvey);
    return true;
  };
  const deleteSurvey = async (input: DeleteSurveyInput) => {
    const deletedSurvey = await $client.survey.deleteSurvey.mutate(input);
    if (!deletedSurvey) return;

    storeDeleteSurvey(deletedSurvey.id);
  };

  const searchQuery = ref("");
  const totalItemsLength = ref(0);

  return {
    ...restData,
    ...restOperationData,
    createSurvey,
    deleteSurvey,
    searchQuery,
    totalItemsLength,
    updateSurvey,
  };
});
