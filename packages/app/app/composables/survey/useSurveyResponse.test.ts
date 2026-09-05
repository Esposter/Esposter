// @vitest-environment nuxt
import { useSurveyResponse } from "@/composables/survey/useSurveyResponse";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { SurveyResponseEntity } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useSurveyResponse, () => {
  const server = setupMswTrpc();
  const id = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const participantToken = "";
  const model = { "": "" };
  const submittedModel = { "": " " };
  const createSurveyResponse = () => new SurveyResponseEntity({ model, partitionKey: id, rowKey });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // A respondent who answers and immediately submits leaves the create in flight, so a submit dropped outright
  // As a duplicate call would still report the answers saved — the row then holds only what the earlier
  // Autosave carried, and the resume id the caller clears takes the rest with it
  test("a submit racing an in-flight create still persists the submitted answers", async () => {
    expect.hasAssertions();

    let updatedModel: Record<string, unknown> | undefined;
    server.use(
      trpcMsw.survey.createSurveyResponse.mutation(() => createSurveyResponse()),
      trpcMsw.survey.updateSurveyResponse.mutation(({ input }) => {
        updatedModel = input.model;
        return Object.assign(createSurveyResponse(), { model: input.model, modelVersion: 1 });
      }),
    );
    const { saveSurveyResponse } = useSurveyResponse(id, participantToken);
    const autosave = saveSurveyResponse({ currentPageNo: 0, data: model });
    const submit = saveSurveyResponse({ currentPageNo: 0, data: submittedModel });
    const [isAutosaved, isSubmitted] = await Promise.all([autosave, submit]);

    expect(isAutosaved).toBe(true);
    expect(isSubmitted).toBe(true);
    expect(updatedModel).toStrictEqual(submittedModel);
  });

  // The mutation reports a rejection rather than throwing it, so a caller that wraps the save in a Result
  // Always takes the success branch — the respondent thanked for a response nothing ever stored
  test("reports a rejected save as unpersisted", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.survey.createSurveyResponse.mutation(() => {
        throw new TRPCError({ code: "CONFLICT" });
      }),
    );
    const { saveSurveyResponse } = useSurveyResponse(id, participantToken);
    const isSaved = await saveSurveyResponse({ currentPageNo: 0, data: model });

    expect(isSaved).toBe(false);
  });

  // The server rejects a write that changes nothing as a duplicate, and an unchanged submit is exactly that —
  // Answering the last question then submitting must not be reported as a failed submission
  test("treats an unchanged save as already persisted", async () => {
    expect.hasAssertions();

    let updateCallCount = 0;
    server.use(
      trpcMsw.survey.createSurveyResponse.mutation(() => createSurveyResponse()),
      trpcMsw.survey.updateSurveyResponse.mutation(() => {
        updateCallCount++;
        throw new TRPCError({ code: "BAD_REQUEST" });
      }),
    );
    const { saveSurveyResponse } = useSurveyResponse(id, participantToken);
    await saveSurveyResponse({ currentPageNo: 0, data: model });
    const isSubmitted = await saveSurveyResponse({ currentPageNo: 0, data: model });

    expect(isSubmitted).toBe(true);
    expect(updateCallCount).toBe(0);
  });
});
