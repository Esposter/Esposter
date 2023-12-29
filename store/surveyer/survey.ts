import { type Survey } from "@/db/schema/surveys";
import { type CreateSurveyInput, type DeleteSurveyInput, type UpdateSurveyInput } from "@/server/trpc/routers/survey";
import { createOffsetPaginationData } from "@/services/shared/pagination/createOffsetPaginationData";

export const useSurveyStore = defineStore("surveyer/survey", () => {
  const { $client } = useNuxtApp();
  const { itemList: surveyList, pushItemList: pushSurveyList, ...rest } = createOffsetPaginationData<Survey>();
  const searchQuery = ref("");
  const totalItemsLength = ref(0);

  const createSurvey = async (input: CreateSurveyInput) => {
    const newSurvey = await $client.survey.createSurvey.mutate(input);
    surveyList.value.push(newSurvey);
    totalItemsLength.value++;
  };
  const updateSurvey = async (input: UpdateSurveyInput) => {
    await $client.survey.updateSurvey.mutate(input);
    const index = surveyList.value.findIndex((s) => s.id === input.id);
    if (index > -1) surveyList.value[index] = { ...surveyList.value[index], ...input };
  };
  const deleteSurvey = async (surveyId: DeleteSurveyInput) => {
    await $client.survey.deleteSurvey.mutate(surveyId);
    surveyList.value = surveyList.value.filter((s) => s.id !== surveyId);
  };
  const autoSave = async (survey: Survey) => {
    survey.modelVersion++;
    // Surveyjs needs to know whether the save was successful with a boolean
    return Boolean(await $client.survey.updateSurvey.mutate(survey));
  };

  return {
    surveyList,
    pushSurveyList,
    ...rest,
    searchQuery,
    totalItemsLength,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    autoSave,
  };
});
