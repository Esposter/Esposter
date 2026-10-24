// @vitest-environment nuxt
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import ResourceSurveyResponses from "@/components/Resource/Survey/Responses.vue";
import { useSession } from "@/services/auth/authClient.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { SurveyResponseMode } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe("resourceSurveyResponses", () => {
  const { trpcMsw } = setupMswTrpc();
  const surveyId = crypto.randomUUID();
  const question = "Favourite colour";
  const model = JSON.stringify({ elements: [{ name: "colour", title: question, type: "text" }] });
  const records: SurveyResponseRecords = {
    columns: [{ name: "colour", type: ColumnType.String }],
    rows: [{ colour: "Teal", rowKey: "response-1" }],
    totalRows: 1,
  };

  beforeEach(() => {
    // The blade reads its id off the resource page's route, which the auth middleware guards
    useSession.mockReturnValue({ data: ref({ user: { id: crypto.randomUUID() } }) });
    Object.assign(useRouter().currentRoute.value.params, { id: surveyId });
    trpcMsw.survey.readSurveyResponseRecords.query(() => records);
    trpcMsw.survey.readResourceContent.query(() => ({
      model,
      settings: surveySettingsSchema.parse({ responseMode: SurveyResponseMode.Identified }),
    }));
  });

  test("says there are no responses yet when the survey has none", async () => {
    expect.hasAssertions();

    trpcMsw.survey.readSurveyResponseRecords.query(() => ({ columns: records.columns, rows: [], totalRows: 0 }));
    const component = await mountSuspended(ResourceSurveyResponses, { route: RoutePath.Resource(surveyId) });

    expect(component.text()).toContain("No responses yet");
  });

  test("summarises each question the responses answer", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyResponses, { route: RoutePath.Resource(surveyId) });

    expect(component.text()).toContain(question);
    expect(component.text()).not.toContain("No responses yet");
  });

  // The survey is read only for the summary, so a survey that cannot be read leaves the responses to the Individual view
  test("keeps the individual responses when the survey itself cannot be read", async () => {
    expect.hasAssertions();

    trpcMsw.survey.readResourceContent.query(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Survey unavailable" });
    });
    const component = await mountSuspended(ResourceSurveyResponses, { route: RoutePath.Resource(surveyId) });
    const individualTab = component.findAll('[role="tab"]').find((tab) => tab.text() === "Individual");
    assert.exists(individualTab);
    expect(component.text()).toContain("Survey unavailable");
    await individualTab.trigger("click");
    await flushPromises();

    expect(component.text()).toContain("Teal");
  });
});
