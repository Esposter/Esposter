import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { Entity } from "~/models/shared/Entity";

export const useReadSurveyFromRoute = async () => {
  const { $client } = useNuxtApp();
  const route = useRoute();
  const surveyId = route.params.id as string;
  const survey = await $client.survey.readSurvey.query(surveyId);
  if (!survey) throw createError({ statusCode: 404, statusMessage: getEntityNotFoundStatusMessage(Entity.Survey) });

  return survey;
};
