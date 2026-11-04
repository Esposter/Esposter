// @vitest-environment nuxt
import type { useSurveyResponse } from "@/composables/survey/useSurveyResponse";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { DEFAULT_COMPLETED_MESSAGE, INVITE_ONLY_MESSAGE } from "#shared/services/resource/survey/constants";
import ResourceSurveyView from "@/components/Resource/Survey/View.vue";
import { createSurveyTestDocument } from "@/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "@/services/survey/createSurveyTestPage.test";
import { createSurveyTestQuestion } from "@/services/survey/createSurveyTestQuestion.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { SurveyResponseMode } from "@esposter/db-schema";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { surveyRootPropsSchema } from "headless-survey-engine";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { clearSurveyResponseIdMock, saveSurveyResponseMock } = vi.hoisted(() => ({
  clearSurveyResponseIdMock: vi.fn<() => void>(),
  saveSurveyResponseMock: vi.fn<ReturnType<typeof useSurveyResponse>["saveSurveyResponse"]>(),
}));

// The page's own behaviour is under test, and the composable's persistence has its own suite, so the save is replaced
// At this seam and each test says whether the save persisted
mockNuxtImport("useSurveyResponse", () => () => ({
  clearSurveyResponseId: clearSurveyResponseIdMock,
  resumeSurveyResponse: () => Promise.resolve(undefined),
  saveSurveyResponse: saveSurveyResponseMock,
  seed: "",
}));

describe("resourceSurveyView", () => {
  const { trpcMsw } = setupMswTrpc();
  const id = crypto.randomUUID();
  const name = "a";
  // A one-page survey, so its only button is the page's Complete
  const mockPublishedSurvey = (settings: object, completedHtml = "") => {
    trpcMsw.survey.readPublishedResourceContent.query(() => ({
      content: {
        document: {
          ...createSurveyTestDocument([createSurveyTestPage([createSurveyTestQuestion("first")])]),
          root: { props: surveyRootPropsSchema.parse({ completedHtml }) },
        },
        settings: surveySettingsSchema.parse(settings),
      },
      name,
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows the closed message when the survey is not accepting responses", async () => {
    expect.hasAssertions();

    mockPublishedSurvey({ closedMessage: "b", isAcceptingResponses: false });
    const component = await mountSuspended(ResourceSurveyView, { props: { id } });
    await flushPromises();

    expect(component.text()).toContain("b");
  });

  test("asks for the personal link when the survey is open to invited participants only", async () => {
    expect.hasAssertions();

    mockPublishedSurvey({ responseMode: SurveyResponseMode.Identified });
    const component = await mountSuspended(ResourceSurveyView, { props: { id } });
    await flushPromises();

    expect(component.text()).toContain(INVITE_ONLY_MESSAGE);
  });

  test("thanks the respondent after a submit that persisted", async () => {
    expect.hasAssertions();

    saveSurveyResponseMock.mockResolvedValue(true);
    mockPublishedSurvey({});
    const component = await mountSuspended(ResourceSurveyView, { props: { id } });
    await flushPromises();
    await component.get("button").trigger("click");
    await flushPromises();

    expect(component.text()).toContain(DEFAULT_COMPLETED_MESSAGE);
    expect(clearSurveyResponseIdMock).toHaveBeenCalledTimes(1);
  });

  test("does not thank the respondent after a submit that did not persist", async () => {
    expect.hasAssertions();

    saveSurveyResponseMock.mockResolvedValue(false);
    mockPublishedSurvey({});
    const component = await mountSuspended(ResourceSurveyView, { props: { id } });
    await flushPromises();
    await component.get("button").trigger("click");
    await flushPromises();

    expect(component.text()).not.toContain(DEFAULT_COMPLETED_MESSAGE);
    expect(component.find('[role="alert"]').exists()).toBe(true);
    expect(clearSurveyResponseIdMock).not.toHaveBeenCalled();
  });

  // The author's completion markup renders in this origin for anonymous respondents, so its script never reaches the page
  test("shows the author's completion message with its script removed", async () => {
    expect.hasAssertions();

    saveSurveyResponseMock.mockResolvedValue(true);
    mockPublishedSurvey({}, "<p>a</p><script></script>");
    const component = await mountSuspended(ResourceSurveyView, { props: { id } });
    await flushPromises();
    await component.get("button").trigger("click");
    await flushPromises();

    expect(component.find("script").exists()).toBe(false);
    expect(component.get("p").text()).toBe("a");
  });
});
