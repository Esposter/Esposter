import type { Survey } from "#shared/db/schema/surveys";
import type { CreateSurveyInput } from "#shared/models/db/survey/CreateSurveyInput";
import type { DeleteSurveyInput } from "#shared/models/db/survey/DeleteSurveyInput";
import type { UpdateSurveyInput } from "#shared/models/db/survey/UpdateSurveyInput";
import type { UpdateSurveyModelInput } from "#shared/models/db/survey/UpdateSurveyModelInput";
import type { Except } from "type-fest";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { createOperationData } from "@/services/shared/createOperationData";
import { createOffsetPaginationData } from "@/services/shared/pagination/offset/createOffsetPaginationData";

export const useSurveyStore = defineStore("surveyer/survey", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = createOffsetPaginationData<Except<Survey, "model">>();
  const {
    createSurvey: storeCreateSurvey,
    deleteSurvey: storeDeleteSurvey,
    updateSurvey: storeUpdateSurvey,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Survey);

  const createSurvey = async (input: CreateSurveyInput) => {
    const newSurvey = await $trpc.survey.createSurvey.mutate(input);
    storeCreateSurvey(newSurvey);
    totalItemsLength.value++;
  };
  const updateSurvey = async (input: UpdateSurveyInput) => {
    const updatedSurvey = await $trpc.survey.updateSurvey.mutate(input);
    storeUpdateSurvey(updatedSurvey);
    return updatedSurvey;
  };
  // This is called by surveyjs externally so we will also need to
  // update our reactivity externally outside from our stores
  const updateSurveyModel = async (input: UpdateSurveyModelInput) => {
    const updatedSurvey = await $trpc.survey.updateSurveyModel.mutate(input);
    return updatedSurvey;
  };
  const deleteSurvey = async (input: DeleteSurveyInput) => {
    const deletedSurvey = await $trpc.survey.deleteSurvey.mutate(input);
    storeDeleteSurvey({ id: deletedSurvey.id });
    totalItemsLength.value--;
  };

  const searchQuery = ref("");
  const totalItemsLength = ref(0);

  return {
    createSurvey,
    deleteSurvey,
    updateSurvey,
    updateSurveyModel,
    ...restOperationData,
    ...restData,
    searchQuery,
    totalItemsLength,
  };
});
