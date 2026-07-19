import type { SurveyResponseEntity } from "@esposter/db-schema";
import type { Model } from "survey-core";

import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { getResultAsync, noop } from "@esposter/shared";

export const useSurveyResponse = (id: string, participantToken: string) => {
  const { $trpc } = useNuxtApp();
  let surveyResponse: null | SurveyResponseEntity = null;
  const { executeMutation } = useMutation();
  // Server-generated response row (modelVersion) — non-optimistic, applied in onSuccess
  const saveSurveyResponse = async (survey: Model) => {
    const responseModel = survey.data;
    const currentSurveyResponse = surveyResponse;
    if (!currentSurveyResponse) {
      const newSurveyResponseId = crypto.randomUUID();
      // Single-flight: until the first save's onSuccess records the created row, every save takes this
      // Branch, and a second concurrent create would write a duplicate response with a fresh rowKey.
      // The dropped save's answers are not lost — the next autosave carries the full model
      await executeMutation(
        () =>
          $trpc.survey.createSurveyResponse.mutate({
            model: responseModel,
            pageNo: survey.currentPageNo,
            participantToken,
            partitionKey: id,
            rowKey: newSurveyResponseId,
          }),
        {
          isExclusive: true,
          key: id,
          onSuccess: (newSurveyResponse) => {
            surveyResponse = newSurveyResponse;
            localStorage.setItem(LocalStorageKey.SurveyResponseId(id, participantToken), newSurveyResponse.rowKey);
          },
        },
      );
      return;
    }

    await executeMutation(
      () =>
        $trpc.survey.updateSurveyResponse.mutate({
          model: responseModel,
          modelVersion: currentSurveyResponse.modelVersion,
          pageNo: survey.currentPageNo,
          participantToken,
          partitionKey: currentSurveyResponse.partitionKey,
          rowKey: currentSurveyResponse.rowKey,
        }),
      {
        // Keyed per response row — repeated saves of the same response are genuine latest-wins
        key: currentSurveyResponse.rowKey,
        onSuccess: (updatedSurveyResponse) => {
          surveyResponse = updatedSurveyResponse;
        },
      },
    );
  };
  // Respondent progress is tracked per browser, so an interrupted survey resumes where it left off.
  // A failed resume falls back to a blank survey rather than stranding the respondent on the skeleton
  const resumeSurveyResponse = (model: Model) =>
    getResultAsync(async () => {
      const surveyResponseId = localStorage.getItem(LocalStorageKey.SurveyResponseId(id, participantToken));
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
    localStorage.removeItem(LocalStorageKey.SurveyResponseId(id, participantToken));
  };
  return { clearSurveyResponseId, resumeSurveyResponse, saveSurveyResponse };
};
