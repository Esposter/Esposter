import type { Survey } from "@/db/schema/surveys";
import type { CreateSurveyInput, DeleteSurveyInput, UpdateSurveyInput } from "@/server/trpc/routers/survey";
import { createPaginationData } from "@/services/shared/pagination/createPaginationData";
import { SURVEYER_STORE } from "@/services/surveyer/constants";
import { NIL } from "@/util/uuid";

export const useSurveyStore = defineStore("surveyer/survey", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const { items: surveyList, ...rest } = createPaginationData<Survey>();
  const pushSurveys = (surveys: Survey[]) => {
    surveyList.value.push(...surveys);
  };
  const createSurvey = async (input: CreateSurveyInput) => {
    if (status.value === "authenticated") {
      const newSurvey = await $client.survey.createSurvey.mutate(input);
      surveyList.value.push(newSurvey);
    } else if (status.value === "unauthenticated") {
      const createdAt = new Date();
      const newSurvey: Survey = {
        ...input,
        id: crypto.randomUUID(),
        creatorId: NIL,
        modelVersion: 0,
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
        publishVersion: 0,
        publishedAt: null,
      };
      surveyList.value.push(newSurvey);
      unauthedSave();
    }
  };
  const updateSurvey = async (input: UpdateSurveyInput) => {
    const index = surveyList.value.findIndex((s) => s.id === input.id);
    if (index > -1) surveyList.value[index] = { ...surveyList.value[index], ...input };

    if (status.value === "authenticated") await $client.survey.updateSurvey.mutate(input);
    else if (status.value === "unauthenticated") unauthedSave();
  };
  const deleteSurvey = async (id: DeleteSurveyInput) => {
    surveyList.value = surveyList.value.filter((s) => s.id !== id);

    if (status.value === "authenticated") await $client.survey.deleteSurvey.mutate(id);
    else if (status.value === "unauthenticated") unauthedSave();
  };
  // Survey argument is only used for autosaving from survey creator
  const unauthedSave = (survey?: Survey) => {
    if (survey) survey.modelVersion++;
    localStorage.setItem(SURVEYER_STORE, JSON.stringify(surveyList.value));
    return true;
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
    unauthedSave,
  };
});
