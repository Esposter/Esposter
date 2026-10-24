import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import type { SurveySummaryCard } from "@/models/resource/survey/SurveySummaryCard";

import { getSurveyResponseSummaryCards } from "@/services/resource/survey/getSurveyResponseSummaryCards";
import { getResultAsync } from "@esposter/shared";

// The responses of one survey, read beside the survey itself. The summary is drawn from both reads, so its failure is
// Its own: the records still show when the survey cannot be read, and the Individual view never needed the survey
export const useReadSurveyResponses = (id: string) => {
  const { $trpc } = useNuxtApp();
  const records = ref<SurveyResponseRecords>();
  const summaryCards = ref<SurveySummaryCard[]>([]);
  const error = ref("");
  const summaryError = ref("");
  const refreshResponses = async () => {
    // Rows arrive already carrying their keys from one server read, so a response submitted or deleted between reads
    // can never associate a row with another response's key
    const [recordsResult, contentResult] = await Promise.all([
      getResultAsync(() => $trpc.survey.readSurveyResponseRecords.query({ id })),
      getResultAsync(() => $trpc.survey.readResourceContent.query({ id })),
    ]);
    recordsResult.match(
      (newRecords) => {
        records.value = newRecords;
        error.value = "";
        contentResult.match(
          (content) => {
            summaryCards.value = getSurveyResponseSummaryCards(content?.model ?? "", newRecords);
            summaryError.value = "";
          },
          (newError) => {
            summaryCards.value = [];
            summaryError.value = newError.message;
          },
        );
      },
      (newError) => {
        error.value = newError.message;
      },
    );
  };

  return { error, records, refreshResponses, summaryCards, summaryError };
};
