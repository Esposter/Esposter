import type { Survey } from "@/db/schema/surveys";
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

  const autoSave = async (survey: Survey) => {
    survey.modelVersion++;
    // Surveyjs needs to know whether the save was successful with a boolean
    return Boolean(await $client.survey.updateSurvey.mutate(survey));
  };

  const createSurvey = async (input: CreateSurveyInput) => {
    const newSurvey = await $client.survey.createSurvey.mutate(input);
    if (!newSurvey) return;

    storeCreateSurvey(newSurvey);
    totalItemsLength.value++;
  };
  const updateSurvey = async (input: UpdateSurveyInput) => {
    const updatedSurvey = await $client.survey.updateSurvey.mutate(input);
    if (!updatedSurvey) return;

    storeUpdateSurvey(updatedSurvey);
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
    autoSave,
    createSurvey,
    deleteSurvey,
    searchQuery,
    totalItemsLength,
    updateSurvey,
  };
});
