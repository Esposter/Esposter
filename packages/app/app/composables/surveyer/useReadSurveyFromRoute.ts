import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";

export const useReadSurveyFromRoute = async () => {
  const { $trpc } = useNuxtApp();
  const route = useRoute();
  const surveyId = route.params.id as string;
  const survey = await $trpc.survey.readSurvey.query(surveyId);
  if (!survey)
    throw createError({
      statusCode: 404,
      statusMessage: getEntityNotFoundStatusMessage(DatabaseEntityType.Survey, surveyId),
    });

  return survey;
};
