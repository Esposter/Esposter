import { ErrorEntity } from "@/models/shared/error/ErrorEntity";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { getInvalidIdStatusMessage } from "@/services/shared/error/getInvalidIdStatusMessage";

export const useReadSurveyFromRoute = async () => {
  const route = useRoute();
  const surveyId = route.params.id;
  if (!(typeof surveyId === "string"))
    throw createError({ statusCode: 404, statusMessage: getInvalidIdStatusMessage(ErrorEntity.Survey) });

  const { $client } = useNuxtApp();
  const survey = await $client.survey.readSurvey.query(parseInt(surveyId));
  if (!survey)
    throw createError({ statusCode: 404, statusMessage: getEntityNotFoundStatusMessage(ErrorEntity.Survey) });

  return survey;
};
