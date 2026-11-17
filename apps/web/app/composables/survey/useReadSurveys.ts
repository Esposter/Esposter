import { MAX_READ_LIMIT } from "@esposter/shared";

// The owner's surveys in one page, the read the survey import takes
export const useReadSurveys = () => {
  const { $trpc } = useNuxtApp();
  const readSurveyResources = () => $trpc.survey.readResources.query({ limit: MAX_READ_LIMIT });

  return { readSurveyResources };
};
