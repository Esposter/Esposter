import type { Survey } from "@/db/schema/surveys";
import type { CreateSurveyInput, DeleteSurveyInput, UpdateSurveyInput } from "@/server/trpc/routers/survey";
import { createPaginationData } from "@/services/shared/pagination/createPaginationData";

export const useSurveyStore = defineStore("surveyer/survey", () => {
  const { $client } = useNuxtApp();
  const { items: surveyList, ...rest } = createPaginationData<Survey>();
  const pushSurveys = (surveys: Survey[]) => {
    surveyList.value.push(...surveys);
  };
  const createSurvey = async (input: CreateSurveyInput) => {
    const newSurvey = await $client.survey.createSurvey.mutate(input);
    surveyList.value.push(newSurvey);
  };
  const updateSurvey = async (input: UpdateSurveyInput) => {
    await $client.survey.updateSurvey.mutate(input);
    const index = surveyList.value.findIndex((s) => s.id === input.id);
    if (index > -1) surveyList.value[index] = { ...surveyList.value[index], ...input };
  };
  const deleteSurvey = async (id: DeleteSurveyInput) => {
    await $client.survey.deleteSurvey.mutate(id);
    surveyList.value = surveyList.value.filter((s) => s.id !== id);
  };
  const autoSave = async (survey: Survey) => {
    survey.modelVersion++;
    await $client.survey.updateSurvey.mutate(survey);
  };

  const searchQuery = ref("");

  return {
    surveyList,
    ...rest,
    pushSurveys,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    searchQuery,
    autoSave,
  };
});
