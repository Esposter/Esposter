// @vitest-environment nuxt
import Runner from "@/components/Resource/Survey/Runner.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { createSurveyTestDocument } from "@/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "@/services/survey/createSurveyTestPage.test";
import { createSurveyTestQuestion } from "@/services/survey/createSurveyTestQuestion.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { SURVEY_REQUIRED_MESSAGE, SurveyProgressBarPlacement } from "survey-engine";
import { assert, beforeAll, describe, expect, test } from "vitest";

describe("runner", () => {
  // A field loads on demand through a dynamic import, which is module I/O rather than a microtask
  // So the text field's module is awaited once up front, and each mount then resolves it within its flush
  beforeAll(async () => {
    await import("@/components/Resource/Survey/Field/Text.vue");
  });

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("a failed next shows its message and moves focus to the page's first blocking question", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        attachTo: document.body,
        props: {
          document: createSurveyTestDocument([
            createSurveyTestPage([
              createSurveyTestQuestion("first", { isRequired: true }),
              createSurveyTestQuestion("second", { isRequired: true }),
            ]),
            createSurveyTestPage([createSurveyTestQuestion("third")]),
          ]),
        },
      });
      await flushPromises();
      await component.get("button").trigger("click");

      expect(component.get('[role="alert"]').text()).toBe(SURVEY_REQUIRED_MESSAGE);
      expect(document.activeElement).toBe(component.get("[data-pointer] input").element);
    });

    test("walks a two-page document forward and back, keeping the first page's answer, and offers Complete on the last page", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: {
          document: createSurveyTestDocument([
            createSurveyTestPage([createSurveyTestQuestion("first")]),
            createSurveyTestPage([createSurveyTestQuestion("second")]),
          ]),
        },
      });
      await flushPromises();
      await component.get("input").setValue("a");
      await component.get("button").trigger("click");
      await flushPromises();

      expect(component.get("label").text()).toBe("second");
      expect(component.findAll("button").map((button) => button.text())).toStrictEqual(["Previous", "Complete"]);

      const previousButton = component.findAll("button").find((button) => button.text() === "Previous");
      assert.exists(previousButton);
      await previousButton.trigger("click");
      await flushPromises();

      expect(component.get<HTMLInputElement>("input").element.value).toBe("a");
    });

    test("completing a page that passes emits its answers", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: {
          document: createSurveyTestDocument([createSurveyTestPage([createSurveyTestQuestion("first")])]),
          initialAnswers: { first: "a" },
        },
      });
      await component.get("button").trigger("click");

      expect(component.emitted("complete")).toStrictEqual([[{ first: "a" }]]);
    });

    test("a question whose condition hides it is not rendered", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: {
          document: createSurveyTestDocument([
            createSurveyTestPage([
              createSurveyTestQuestion("first"),
              createSurveyTestQuestion("second", { visibleIf: "{first} = 'show'" }),
            ]),
          ]),
        },
      });

      expect(component.findAll("[data-pointer]")).toHaveLength(1);
    });

    test("a progress bar set to the bottom is drawn after the page's questions", async () => {
      expect.hasAssertions();

      const surveyDocument = createSurveyTestDocument([createSurveyTestPage([createSurveyTestQuestion("first")])]);
      surveyDocument.root.props.showProgressBar = SurveyProgressBarPlacement.Bottom;
      const component = await mountSuspended(Runner, { props: { document: surveyDocument } });

      expect(component.element.lastElementChild?.contains(component.get('[role="progressbar"]').element)).toBe(true);
    });

    test("a progress bar set to the top is drawn before the page", async () => {
      expect.hasAssertions();

      const surveyDocument = createSurveyTestDocument([createSurveyTestPage([createSurveyTestQuestion("first")])]);
      surveyDocument.root.props.showProgressBar = SurveyProgressBarPlacement.Top;
      const component = await mountSuspended(Runner, { props: { document: surveyDocument } });

      expect(component.element.firstElementChild?.contains(component.get('[role="progressbar"]').element)).toBe(true);
    });

    test("a survey with its progress bar off shows none", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: { document: createSurveyTestDocument([createSurveyTestPage([createSurveyTestQuestion("first")])]) },
      });

      expect(component.find('[role="progressbar"]').exists()).toBe(false);
    });
  });
});
