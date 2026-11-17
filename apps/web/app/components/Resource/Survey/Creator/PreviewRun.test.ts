// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { SurveyRatingNode } from "vue-survey-engine-headless";

import ResourceSurveyCreatorPreviewRun from "#src/components/Resource/Survey/Creator/PreviewRun.vue";
import { createSurveyTestDocument } from "#src/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "#src/services/survey/createSurveyTestPage.test";
import { createSurveyTestQuestion } from "#src/services/survey/createSurveyTestQuestion.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { jsonDateParse } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, beforeAll, describe, expect, test } from "vitest";
import { SURVEY_REQUIRED_MESSAGE, SurveyNodeType, surveyRatingNodeType } from "vue-survey-engine-headless";

// A rating question built from its kind's default props, so a fixture holds the shape the schemas parse
const createRatingQuestion = (name: string): SurveyRatingNode => ({
  props: { ...surveyRatingNodeType.createDefaultProps(), id: v7(), name },
  type: SurveyNodeType.Rating,
});
// A one-page survey of a text question and a rating question, the two answers the preview tests give
const createTwoQuestionDocument = () =>
  createSurveyTestDocument([createSurveyTestPage([createSurveyTestQuestion("first"), createRatingQuestion("second")])]);

const findButton = (component: VueWrapper, text: string) =>
  component.findAll("button").find((button) => button.text() === text);
const findTab = (component: VueWrapper, text: string) =>
  component.findAll('[role="tab"]').find((tab) => tab.text() === text);
// The one-page survey of a text question answered "Ana" and a rating answered four, completed through its Complete button
const completeFirstPage = async (component: VueWrapper) => {
  await component.get("input").setValue("Ana");
  await findButton(component, "4")?.trigger("click");
  await findButton(component, "Complete")?.trigger("click");
  await flushPromises();
};

describe("resourceSurveyCreatorPreviewRun", () => {
  // A field loads on demand through a dynamic import, so the fields the tests answer are awaited once up front
  beforeAll(async () => {
    await import("#src/components/Resource/Survey/Field/Rating.vue");
    await import("#src/components/Resource/Survey/Field/Text.vue");
  });
  const { server } = setupMswTrpc();

  test("completing a preview shows its answers as a table", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyCreatorPreviewRun, {
      props: { document: createTwoQuestionDocument() },
    });
    await flushPromises();
    await completeFirstPage(component);

    expect(component.findAll("th").map((header) => header.text())).toStrictEqual(["first", "second"]);
    expect(component.findAll("td").map((cell) => cell.text())).toStrictEqual(["Ana", "4"]);
  });

  test("the JSON view shows the same answers", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyCreatorPreviewRun, {
      props: { document: createTwoQuestionDocument() },
    });
    await flushPromises();
    await completeFirstPage(component);
    await findTab(component, "JSON")?.trigger("click");

    expect(jsonDateParse(component.get("pre").text())).toStrictEqual({ first: "Ana", second: 4 });
  });

  test("a calculated value flagged for the result is in the results", async () => {
    expect.hasAssertions();

    const document = createTwoQuestionDocument();
    const component = await mountSuspended(ResourceSurveyCreatorPreviewRun, {
      props: {
        document: {
          ...document,
          root: {
            props: {
              ...document.root.props,
              calculatedValues: [{ expression: "{second} * 2", includeIntoResult: true, name: "third" }],
            },
          },
        },
      },
    });
    await flushPromises();
    await completeFirstPage(component);

    expect(component.findAll("th").map((header) => header.text())).toStrictEqual(["first", "second", "third"]);
    expect(component.findAll("td").map((cell) => cell.text())).toStrictEqual(["Ana", "4", "8"]);
  });

  test("preview Survey Again starts the survey from its first page", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyCreatorPreviewRun, {
      props: {
        document: createSurveyTestDocument([
          createSurveyTestPage([createSurveyTestQuestion("first")]),
          createSurveyTestPage([createSurveyTestQuestion("second")]),
        ]),
      },
    });
    await flushPromises();
    await component.get("input").setValue("Ana");
    await findButton(component, "Next")?.trigger("click");
    await findButton(component, "Complete")?.trigger("click");
    await flushPromises();
    await findButton(component, "Preview Survey Again")?.trigger("click");
    await flushPromises();

    expect(component.get("label").text()).toBe("first");
    expect(component.get<HTMLInputElement>("input").element.value).toBe("");
    expect(component.find("table").exists()).toBe(false);
  });

  test("a preview blocked by an error shows the error and no results", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyCreatorPreviewRun, {
      props: {
        document: createSurveyTestDocument([
          createSurveyTestPage([createSurveyTestQuestion("first")]),
          createSurveyTestPage([createSurveyTestQuestion("second", { isRequired: true })]),
        ]),
      },
    });
    await flushPromises();
    await findButton(component, "Next")?.trigger("click");
    await findButton(component, "Complete")?.trigger("click");
    await flushPromises();

    assert.exists(component.find('[role="alert"]').element);
    expect(component.get('[role="alert"]').text()).toBe(SURVEY_REQUIRED_MESSAGE);
    expect(component.find("table").exists()).toBe(false);
  });

  test("completing a preview saves no response", async () => {
    expect.hasAssertions();

    const requestUrls: string[] = [];
    const onRequestStart = ({ request }: { request: Request }) => {
      requestUrls.push(request.url);
    };
    server.events.on("request:start", onRequestStart);
    const component = await mountSuspended(ResourceSurveyCreatorPreviewRun, {
      props: { document: createTwoQuestionDocument() },
    });
    await flushPromises();
    await completeFirstPage(component);
    server.events.removeListener("request:start", onRequestStart);

    expect(requestUrls).toStrictEqual([]);
  });
});
