import type { SurveyResponseInResource } from "@esposter/db-schema";
import type { SurveyAnswers } from "vue-survey-engine-headless";

import { MutationStatus } from "@/models/shared/MutationStatus";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { getResultAsync } from "@esposter/shared";
import { v7 } from "uuid";
import { surveyAnswerValueSchema } from "vue-survey-engine-headless";
import { z } from "zod";

// A stored draft's answers are parsed rather than cast, since the record holds whatever the server stored
const surveyAnswersSchema: z.ZodType<SurveyAnswers> = z.record(z.string(), surveyAnswerValueSchema);

export const useSurveyResponse = (resourceId: string, participantToken: string) => {
  const { $trpc } = useNuxtApp();
  // Respondent progress is tracked per browser, and scoped by participant token so a shared device cannot
  // Resume someone else's answers — see openspec/specs/architecture/browser-execution/design.md
  const surveyResponseId = useLocalStorage(LocalStorageKey.SurveyResponseId(resourceId, participantToken), "");
  // A response's id is its seed, so a shuffled choice list keeps one order across visits: the id of the stored
  // Response when there is one, else a new id that the first save creates the row under
  const seed = surveyResponseId.value || v7();
  let surveyResponse: SurveyResponseInResource | undefined;
  const { executeMutation } = useMutation();
  // Server-generated response row (modelVersion) — non-optimistic, applied in onSuccess.
  // Resolves to whether the answers are persisted, so a caller can never show a thank-you page for a
  // Response the server never took. Only the save that completes the runner carries isSubmitting
  const saveSurveyResponse = async ({
    answers,
    isSubmitting,
    pageIndex,
  }: {
    answers: SurveyAnswers;
    isSubmitting: boolean;
    pageIndex: number;
  }) => {
    const { status } = await executeMutation(
      () => {
        // Which write to send is resolved when it is sent rather than when it was issued: a save that queued
        // Behind the create must update the row that create produced, not write a second response
        const storedSurveyResponse = surveyResponse;
        if (!storedSurveyResponse)
          return $trpc.survey.createSurveyResponse.mutate({
            id: seed,
            isDraft: !isSubmitting,
            model: answers,
            pageNo: pageIndex,
            participantToken,
            resourceId,
          });
        // The stored row already holds these answers at this position, which is the write the server itself
        // Rejects as a duplicate — so resolving with the stored row keeps an unchanged submit a success
        // Rather than an error banner over answers that are already safe. The same answers still submit a draft
        else if (
          JSON.stringify(answers) === JSON.stringify(storedSurveyResponse.model) &&
          pageIndex <= storedSurveyResponse.pageNo &&
          !(storedSurveyResponse.isDraft && isSubmitting)
        )
          return Promise.resolve(storedSurveyResponse);
        else
          return $trpc.survey.updateSurveyResponse.mutate({
            id: storedSurveyResponse.id,
            isDraft: !isSubmitting,
            model: answers,
            modelVersion: storedSurveyResponse.modelVersion,
            pageNo: pageIndex,
            participantToken,
            resourceId: storedSurveyResponse.resourceId,
          });
      },
      {
        // One live response per participant per survey, so every save queues against that one target — a
        // Submit issued while the create is still in flight is exactly such a save
        key: resourceId,
        onSuccess: (newSurveyResponse) => {
          surveyResponse = newSurveyResponse;
          surveyResponseId.value = newSurveyResponse.id;
        },
      },
    );
    return status === MutationStatus.Succeeded;
  };
  // An interrupted survey resumes where it left off. A failed resume falls back to a blank survey rather than
  // Stranding the respondent on the skeleton
  const resumeSurveyResponse = () =>
    getResultAsync(async () => {
      if (!surveyResponseId.value) return undefined;

      surveyResponse = await $trpc.survey.readSurveyResponse.query({
        id: surveyResponseId.value,
        participantToken,
        resourceId,
      });
      if (!surveyResponse) return undefined;

      return {
        answers: surveyAnswersSchema.parse(surveyResponse.model),
        pageIndex: surveyResponse.pageNo,
        seed: surveyResponse.id,
      };
    })
      .orTee(console.error)
      .unwrapOr(undefined);
  // The resume id must not outlive the submission — a shared device could otherwise reopen the answers
  const clearSurveyResponseId = () => {
    surveyResponseId.value = "";
  };
  return { clearSurveyResponseId, resumeSurveyResponse, saveSurveyResponse, seed };
};
