import type { Survey } from "#shared/db/schema/surveys";
import type { CreateSurveyInput } from "#shared/models/db/survey/CreateSurveyInput";
import type { DeleteSurveyInput } from "#shared/models/db/survey/DeleteSurveyInput";
import type { UpdateSurveyInput } from "#shared/models/db/survey/UpdateSurveyInput";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { createOperationData } from "@/services/shared/createOperationData";
import { createOffsetPaginationData } from "@/services/shared/pagination/offset/createOffsetPaginationData";

export const useSurveyStore = defineStore("surveyer/survey", () => {
  const { $trpc } = useNuxtApp();
  const { itemList, ...restData } = createOffsetPaginationData<Survey>();
  const {
    createSurvey: storeCreateSurvey,
    deleteSurvey: storeDeleteSurvey,
    updateSurvey: storeUpdateSurvey,
    ...restOperationData
  } = createOperationData(itemList, ["id"], DatabaseEntityType.Survey);

  const createSurvey = async (input: CreateSurveyInput) => {
    const newSurvey = await $trpc.survey.createSurvey.mutate(input);
    if (!newSurvey) return;

    storeCreateSurvey(newSurvey);
    totalItemsLength.value++;
  };
  const updateSurvey = async (input: UpdateSurveyInput) => {
    input.modelVersion++;
    const updatedSurvey = await $trpc.survey.updateSurvey.mutate(input);
    // Surveyjs needs to know whether the save was successful with a boolean
    if (!updatedSurvey) return false;

    storeUpdateSurvey(updatedSurvey);
    return true;
  };
  const deleteSurvey = async (input: DeleteSurveyInput) => {
    const deletedSurvey = await $trpc.survey.deleteSurvey.mutate(input);
    if (!deletedSurvey) return;

    storeDeleteSurvey({ id: deletedSurvey.id });
  };

  const searchQuery = ref("");
  const totalItemsLength = ref(0);

  return {
    createSurvey,
    deleteSurvey,
    updateSurvey,
    ...restOperationData,
    ...restData,
    searchQuery,
    totalItemsLength,
  };
});
