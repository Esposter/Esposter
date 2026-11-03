// @vitest-environment nuxt
import { useSurveyResponse } from "@/composables/survey/useSurveyResponse";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { SurveyResponseEntity } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";

describe(useSurveyResponse, () => {
  const { trpcMsw } = setupMswTrpc();
  const id = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const participantToken = "";
  const model = { a: "" };
  const submittedModel = { a: " " };
  const createSurveyResponse = () => new SurveyResponseEntity({ model, partitionKey: id, rowKey });

  // A stored resume id outlives a test, and a composable reads it on creation, so each test starts with none
  beforeEach(() => {
    localStorage.clear();
  });

  // A respondent who answers and immediately submits leaves the create in flight, so a submit dropped outright
  // As a duplicate call would still report the answers saved — the row then holds only what the earlier
  // Autosave carried, and the resume id the caller clears takes the rest with it
  test("a submit racing an in-flight create still persists the submitted answers", async () => {
    expect.hasAssertions();

    let updatedModel: Record<string, unknown> | undefined;
    trpcMsw.survey.createSurveyResponse.mutation(() => createSurveyResponse());
    trpcMsw.survey.updateSurveyResponse.mutation(({ input }) => {
      updatedModel = input.model;
      return Object.assign(createSurveyResponse(), { model: input.model, modelVersion: 1 });
    });
    const { saveSurveyResponse } = useSurveyResponse(id, participantToken);
    const autosave = saveSurveyResponse({ answers: model, isSubmitting: false, pageIndex: 0 });
    const submit = saveSurveyResponse({ answers: submittedModel, isSubmitting: true, pageIndex: 0 });
    const [isAutosaved, isSubmitted] = await Promise.all([autosave, submit]);

    expect(isAutosaved).toBe(true);
    expect(isSubmitted).toBe(true);
    expect(updatedModel).toStrictEqual(submittedModel);
  });

  // The mutation reports a rejection rather than throwing it, so a caller that wraps the save in a Result
  // Always takes the success branch, thanking the respondent for a response nothing ever stored
  test("reports a rejected save as unpersisted", async () => {
    expect.hasAssertions();

    trpcMsw.survey.createSurveyResponse.mutation(() => {
      throw new TRPCError({ code: "CONFLICT" });
    });
    const { saveSurveyResponse } = useSurveyResponse(id, participantToken);
    const isSaved = await saveSurveyResponse({ answers: model, isSubmitting: false, pageIndex: 0 });

    expect(isSaved).toBe(false);
  });

  // The server rejects a write that changes nothing as a duplicate, and an unchanged submit is exactly that —
  // Answering the last question then submitting must not be reported as a failed submission
  test("treats an unchanged save as already persisted", async () => {
    expect.hasAssertions();

    let updateCallCount = 0;
    trpcMsw.survey.createSurveyResponse.mutation(() => createSurveyResponse());
    trpcMsw.survey.updateSurveyResponse.mutation(() => {
      updateCallCount++;
      throw new TRPCError({ code: "BAD_REQUEST" });
    });
    const { saveSurveyResponse } = useSurveyResponse(id, participantToken);
    await saveSurveyResponse({ answers: model, isSubmitting: false, pageIndex: 0 });
    const isSubmitted = await saveSurveyResponse({ answers: model, isSubmitting: true, pageIndex: 0 });

    expect(isSubmitted).toBe(true);
    expect(updateCallCount).toBe(0);
  });

  // Answering the last question autosaves the draft, so the submit that follows carries the same answers — skipped
  // As unchanged, the response would stay a draft that no count, table or program funnel ever reads
  test("submits a draft whose answers are unchanged", async () => {
    expect.hasAssertions();

    let isUpdatedDraft: boolean | undefined;
    trpcMsw.survey.createSurveyResponse.mutation(() => Object.assign(createSurveyResponse(), { isDraft: true }));
    trpcMsw.survey.updateSurveyResponse.mutation(({ input }) => {
      isUpdatedDraft = input.isDraft;
      return Object.assign(createSurveyResponse(), { modelVersion: 1 });
    });
    const { saveSurveyResponse } = useSurveyResponse(id, participantToken);
    await saveSurveyResponse({ answers: model, isSubmitting: false, pageIndex: 0 });
    const isSubmitted = await saveSurveyResponse({ answers: model, isSubmitting: true, pageIndex: 0 });

    expect(isSubmitted).toBe(true);
    expect(isUpdatedDraft).toBe(false);
  });

  // The row key is the seed a shuffled choice list is ordered by, so a resumed draft hands back the key it was stored under
  test("resumes a stored draft's answers, page and seed", async () => {
    expect.hasAssertions();

    localStorage.setItem(LocalStorageKey.SurveyResponseId(id, participantToken), rowKey);
    trpcMsw.survey.readSurveyResponse.query(() => Object.assign(createSurveyResponse(), { pageNo: 1 }));
    const { resumeSurveyResponse } = useSurveyResponse(id, participantToken);
    const draft = await resumeSurveyResponse();

    expect(draft).toStrictEqual({ answers: model, pageIndex: 1, seed: rowKey });
  });

  // A shared device must not reopen a submitted response, so once the submit persisted and its id is cleared, a later
  // Visit to the survey on that device finds nothing to resume
  test("a later visit resumes nothing once a persisted submit clears the resume id", async () => {
    expect.hasAssertions();

    trpcMsw.survey.createSurveyResponse.mutation(() => createSurveyResponse());
    trpcMsw.survey.updateSurveyResponse.mutation(({ input }) =>
      Object.assign(createSurveyResponse(), { model: input.model, modelVersion: 1 }),
    );
    trpcMsw.survey.readSurveyResponse.query(() => createSurveyResponse());
    const { clearSurveyResponseId, saveSurveyResponse } = useSurveyResponse(id, participantToken);
    await saveSurveyResponse({ answers: model, isSubmitting: false, pageIndex: 0 });
    await saveSurveyResponse({ answers: submittedModel, isSubmitting: true, pageIndex: 0 });
    clearSurveyResponseId();
    // The id is written to storage on the next tick, which is when a later visit reads it
    await nextTick();
    const { resumeSurveyResponse } = useSurveyResponse(id, participantToken);
    const draft = await resumeSurveyResponse();

    expect(draft).toBeUndefined();
  });
});
