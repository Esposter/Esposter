import type { CreateSurveyInput } from "#shared/models/db/survey/CreateSurveyInput";
import type { DeleteSurveyInput } from "#shared/models/db/survey/DeleteSurveyInput";
import type { UpdateSurveyInput } from "#shared/models/db/survey/UpdateSurveyInput";
import type { UpdateSurveyModelInput } from "#shared/models/db/survey/UpdateSurveyModelInput";
import type { Survey } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useSurveyStore = defineStore("survey", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = useOffsetPaginationData<Except<Survey, "model">>();
  const {
    createSurvey: storeCreateSurvey,
    deleteSurvey: storeDeleteSurvey,
    updateSurvey: storeUpdateSurvey,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Survey);

  const createSurvey = async (input: CreateSurveyInput) => {
    const newSurvey = await $trpc.survey.createSurvey.mutate(input);
    storeCreateSurvey(newSurvey);
    count.value++;
  };
  const updateSurvey = async (input: UpdateSurveyInput) => {
    const updatedSurvey = await $trpc.survey.updateSurvey.mutate(input);
    storeUpdateSurvey(updatedSurvey);
  };
  // This is called by surveyjs externally so we will also need to
  // update our reactivity externally outside from our stores
  const updateSurveyModel = (input: UpdateSurveyModelInput) => $trpc.survey.updateSurveyModel.mutate(input);
  const deleteSurvey = async (input: DeleteSurveyInput) => {
    const { id } = await $trpc.survey.deleteSurvey.mutate(input);
    storeDeleteSurvey({ id });
    count.value--;
  };

  const searchQuery = ref("");
  const count = ref(0);

  return {
    createSurvey,
    deleteSurvey,
    items,
    updateSurvey,
    updateSurveyModel,
    ...restOperationData,
    ...restData,
    count,
    searchQuery,
  };
});
