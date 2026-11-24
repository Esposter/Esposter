// @vitest-environment nuxt
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import { useReadSurveyResponses } from "#src/composables/resource/survey/useReadSurveyResponses";
import { getLastOpenRealtimeSocketCall } from "#src/services/realtime/openRealtimeSocket.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useConnectionStore } from "#src/store/realtime/connection";
import { getTopic, SurveyResponseMode, TopicKind } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";
import { createSurveyDocument } from "vue-survey-engine-headless";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

describe(useReadSurveyResponses, () => {
  const { trpcMsw } = setupMswTrpc();
  const surveyId = v7();
  const readAt = 0;
  const topic = getTopic(TopicKind.Resource, surveyId);
  const emptyRecords: SurveyResponseRecords = { columns: [], isCountCapped: false, rows: [], totalRows: 0 };
  const submittedRecords: SurveyResponseRecords = {
    columns: [],
    isCountCapped: false,
    rows: [{ responseId: v7() }],
    totalRows: 1,
  };

  // A response submitted elsewhere publishes the survey's topic, which the records read names in its answer, so the
  // Read runs again and the table reaches the new response without the owner refreshing
  test("reads the responses again when a topic its answer names is published", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const { openUser } = connectionStore;
    openUser();
    const [, onFrame] = getLastOpenRealtimeSocketCall();
    let records = emptyRecords;
    trpcMsw.survey.readSurveyResponseRecords.query(({ ctx }) => {
      ctx.responseHeaders.set(
        TOPICS_HEADER,
        formatTopicsHeaderValue("survey.readSurveyResponseRecords", { readAt, signature: "", topics: [{ topic }] }),
      );
      return records;
    });
    trpcMsw.survey.readResourceContent.query(() => ({
      document: createSurveyDocument(),
      settings: surveySettingsSchema.parse({ responseMode: SurveyResponseMode.Identified }),
    }));
    const scope = effectScope();
    const reader = scope.run(() => useReadSurveyResponses(surveyId));
    await reader?.refreshResponses();
    records = submittedRecords;
    onFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    await waitForSynchronizedFunctions();
    scope.stop();

    expect(reader?.records.value).toStrictEqual(submittedRecords);
  });
});
