// @vitest-environment nuxt
import Runner from "@/components/Resource/Survey/Runner.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { createSurveyTestDocument } from "@/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "@/services/survey/createSurveyTestPage.test";
import { createSurveyTestQuestion } from "@/services/survey/createSurveyTestQuestion.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("runner", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("a next button blocked by a required question shows the error", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: {
          document: createSurveyTestDocument([
            createSurveyTestPage([createSurveyTestQuestion("first", { isRequired: true })]),
            createSurveyTestPage([createSurveyTestQuestion("second")]),
          ]),
        },
      });
      await component.get("button").trigger("click");

      expect(component.find('[role="alert"]').exists()).toBe(true);
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
  });
});
