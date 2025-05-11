export const useReadSurveyFromRoute = () => {
  const { $trpc } = useNuxtApp();
  const route = useRoute();
  const surveyId = route.params.id as string;
  return $trpc.survey.readSurvey.query(surveyId);
};
