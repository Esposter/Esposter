import type { SurveyResponseEntity } from "@esposter/db-schema";
import type { Model } from "survey-core";

import { MutationStatus } from "@/models/shared/MutationStatus";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { getResultAsync, noop } from "@esposter/shared";

export const useSurveyResponse = (id: string, participantToken: string) => {
  const { $trpc } = useNuxtApp();
  let surveyResponse: SurveyResponseEntity | undefined;
  const { executeMutation } = useMutation();
  // Server-generated response row (modelVersion) — non-optimistic, applied in onSuccess.
  // Resolves to whether the answers are persisted, so a caller can never show a thank-you page for a
  // Response the server never took
  const saveSurveyResponse = async ({ currentPageNo, data }: Pick<Model, "currentPageNo" | "data">) => {
    const { status } = await executeMutation(
      () => {
        // Which write to send is resolved when it is sent rather than when it was issued: a save that queued
        // Behind the create must update the row that create produced, not write a second response
        const currentSurveyResponse = surveyResponse;
        if (!currentSurveyResponse)
          return $trpc.survey.createSurveyResponse.mutate({
            model: data,
            pageNo: currentPageNo,
            participantToken,
            partitionKey: id,
            rowKey: crypto.randomUUID(),
          });
        // The stored row already holds these answers at this position, which is the write the server itself
        // Rejects as a duplicate — so resolving with the stored row keeps an unchanged submit a success
        // Rather than an error banner over answers that are already safe
        else if (
          JSON.stringify(data) === JSON.stringify(currentSurveyResponse.model) &&
          currentPageNo <= currentSurveyResponse.pageNo
        )
          return Promise.resolve(currentSurveyResponse);

        return $trpc.survey.updateSurveyResponse.mutate({
          model: data,
          modelVersion: currentSurveyResponse.modelVersion,
          pageNo: currentPageNo,
          participantToken,
          partitionKey: currentSurveyResponse.partitionKey,
          rowKey: currentSurveyResponse.rowKey,
        });
      },
      {
        // One live response per participant per survey, so every save queues against that one target — a
        // Submit issued while the create is still in flight is exactly such a save
        key: id,
        onSuccess: (newSurveyResponse) => {
          surveyResponse = newSurveyResponse;
          window.localStorage.setItem(LocalStorageKey.SurveyResponseId(id, participantToken), newSurveyResponse.rowKey);
        },
      },
    );
    return status === MutationStatus.Succeeded;
  };
  // Respondent progress is tracked per browser, so an interrupted survey resumes where it left off.
  // A failed resume falls back to a blank survey rather than stranding the respondent on the skeleton
  const resumeSurveyResponse = (model: Model) =>
    getResultAsync(async () => {
      const surveyResponseId = window.localStorage.getItem(LocalStorageKey.SurveyResponseId(id, participantToken));
      if (!surveyResponseId) return;

      surveyResponse = await $trpc.survey.readSurveyResponse.query({
        participantToken,
        partitionKey: id,
        rowKey: surveyResponseId,
      });
      if (!surveyResponse) return;

      model.data = surveyResponse.model;
      if (!surveyResponse.pageNo) return;

      model.currentPageNo = surveyResponse.pageNo;
    }).match(noop, console.error);
  // The resume id must not outlive the submission — a shared device could otherwise reopen the answers
  const clearSurveyResponseId = () => {
    window.localStorage.removeItem(LocalStorageKey.SurveyResponseId(id, participantToken));
  };
  return { clearSurveyResponseId, resumeSurveyResponse, saveSurveyResponse };
};
