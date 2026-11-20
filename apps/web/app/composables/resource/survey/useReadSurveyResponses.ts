import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import type { SurveySummaryCard } from "#src/models/resource/survey/SurveySummaryCard";

import { getSurveyDocumentResponseSummaryCards } from "#src/services/resource/survey/getSurveyDocumentResponseSummaryCards";
import { getResultAsync } from "@esposter/shared";

// The responses of one survey, read beside the survey itself. The summary is drawn from both reads, so its failure is
// Its own: the records still show when the survey cannot be read, and the Individual view never needed the survey. The
// Read stays live while the view is open, so a response submitted elsewhere reaches the table and the summary
export const useReadSurveyResponses = (id: string) => {
  const { $trpc } = useNuxtApp();
  const { run } = useRunScope();
  const records = ref<SurveyResponseRecords>();
  const summaryCards = ref<SurveySummaryCard[]>([]);
  const error = ref("");
  const summaryError = ref("");
  // Rows arrive already carrying their keys from one server read, so a response submitted or deleted between reads can
  // Never associate a row with another response's key. Each read settles on its own, so the read as a whole lands. No
  // Version covers the pivot, so the read is residue on the run scope: a newer read aborts the one before it, and only the
  // Newest commits, so a delete's refresh supersedes every read in flight before it
  const refreshResponses = () =>
    run(
      () =>
        Promise.all([
          getResultAsync(() => $trpc.survey.readSurveyResponseRecords.query({ id })),
          getResultAsync(() => $trpc.survey.readResourceContent.query({ id })),
        ]),
      ([recordsResult, contentResult]) => {
        recordsResult.match(
          (newRecords) => {
            records.value = newRecords;
            error.value = "";
            contentResult.match(
              (content) => {
                summaryCards.value = content ? getSurveyDocumentResponseSummaryCards(content.document, newRecords) : [];
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
      },
    );

  return { error, records, refreshResponses, summaryCards, summaryError };
};
