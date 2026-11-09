// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { SurveyPanelDynamicNode, SurveyPanelNode, SurveyTemplateNode } from "vue-survey-engine-headless";

import Runner from "@/components/Resource/Survey/Runner.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { createSurveyTestDocument } from "@/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "@/services/survey/createSurveyTestPage.test";
import { createSurveyTestQuestion } from "@/services/survey/createSurveyTestQuestion.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, beforeAll, describe, expect, test } from "vitest";
import {
  SURVEY_REQUIRED_MESSAGE,
  SurveyNodeType,
  surveyPanelDynamicNodePropsSchema,
  surveyPanelNodeType,
  SurveyProgressBarPlacement,
} from "vue-survey-engine-headless";

// A dynamic panel named "rows" of two panels over the template, on a page of its own
const createRowsDocument = (template: SurveyTemplateNode[]) => {
  const panel: SurveyPanelDynamicNode = {
    props: {
      ...surveyPanelDynamicNodePropsSchema.parse({ name: "rows", panelCount: 2 }),
      id: crypto.randomUUID(),
      template,
    },
    type: SurveyNodeType.PanelDynamic,
  };

  return createSurveyTestDocument([createSurveyTestPage([panel])]);
};
// A panel's row is a child of the dynamic panel's group, so the group's divs are the rows in order
const findRows = (component: VueWrapper) => component.findAll('[role="group"] > div');
const findRowLabels = (component: VueWrapper) =>
  findRows(component).map((row) => row.findAll("label").map((label) => label.text()));
// A question's label starts with its title, and carries the required mark once the question is required
const findLabel = (component: VueWrapper, title: string) =>
  component.findAll("label").find((label) => label.text().startsWith(title));
const findButton = (component: VueWrapper, text: string) =>
  component.findAll("button").find((button) => button.text() === text);

describe("runner", () => {
  // A field loads on demand through a dynamic import, which is module I/O rather than a microtask
  // So the text field's and the dynamic panel's modules are awaited once up front, and each mount then resolves them within its flush
  beforeAll(async () => {
    await import("@/components/Resource/Survey/Field/PanelDynamic.vue");
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

    test("a question whose requiring condition holds draws the required mark and blocks the next page", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: {
          document: createSurveyTestDocument([
            createSurveyTestPage([
              createSurveyTestQuestion("a"),
              createSurveyTestQuestion("b", { requiredIf: "{a} = 'yes'" }),
            ]),
            createSurveyTestPage([createSurveyTestQuestion("c")]),
          ]),
        },
      });
      await flushPromises();
      await component.get("input").setValue("yes");
      await flushPromises();

      const label = findLabel(component, "b");
      assert.exists(label);
      expect(label.text()).toContain("*");

      const nextButton = findButton(component, "Next");
      assert.exists(nextButton);
      await nextButton.trigger("click");
      await flushPromises();

      expect(component.get('[role="alert"]').text()).toBe(SURVEY_REQUIRED_MESSAGE);
      expect(findLabel(component, "c")).toBeUndefined();

      const requiredInput = component.findAll("input")[1];
      assert.exists(requiredInput);
      await requiredInput.setValue("answered");
      await nextButton.trigger("click");
      await flushPromises();

      expect(findLabel(component, "c")).toBeDefined();
    });

    test("a question stops drawing the required mark when its requiring condition stops holding", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: {
          document: createSurveyTestDocument([
            createSurveyTestPage([
              createSurveyTestQuestion("a"),
              createSurveyTestQuestion("b", { requiredIf: "{a} = 'yes'" }),
            ]),
            createSurveyTestPage([createSurveyTestQuestion("c")]),
          ]),
          initialAnswers: { a: "yes" },
        },
      });
      await flushPromises();
      await component.get("input").setValue("no");
      await flushPromises();

      const label = findLabel(component, "b");
      assert.exists(label);
      expect(label.text()).not.toContain("*");

      const nextButton = findButton(component, "Next");
      assert.exists(nextButton);
      await nextButton.trigger("click");
      await flushPromises();

      expect(findLabel(component, "c")).toBeDefined();
    });

    test("a row shows only the template question its own answer shows", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: {
          document: createRowsDocument([
            createSurveyTestQuestion("a"),
            createSurveyTestQuestion("b", { visibleIf: "{panel.a} = 'yes'" }),
          ]),
          initialAnswers: { rows: [{ a: "yes" }, { a: "no" }] },
        },
      });
      await flushPromises();

      expect(findRowLabels(component)).toStrictEqual([["a", "b"], ["a"]]);
    });

    test("a row disables a template question its own answer does not enable", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: {
          document: createRowsDocument([
            createSurveyTestQuestion("a"),
            createSurveyTestQuestion("b", { enableIf: "{panel.a} = 'yes'" }),
          ]),
          initialAnswers: { rows: [{ a: "yes" }, { a: "no" }] },
        },
      });
      await flushPromises();

      const [firstRow, secondRow] = findRows(component);
      assert.exists(firstRow);
      assert.exists(secondRow);
      const [, firstRowInput] = firstRow.findAll("input");
      const [, secondRowInput] = secondRow.findAll("input");
      assert.exists(firstRowInput);
      assert.exists(secondRowInput);
      expect(firstRowInput.attributes("disabled")).toBeUndefined();
      expect(secondRowInput.attributes("disabled")).toBe("");
    });

    test("a row marks a template question required when its own answer requires it", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: {
          document: createRowsDocument([
            createSurveyTestQuestion("a"),
            createSurveyTestQuestion("b", { requiredIf: "{panel.a} = 'yes'" }),
          ]),
          initialAnswers: { rows: [{ a: "yes" }, { a: "no" }] },
        },
      });
      await flushPromises();

      const [firstRow, secondRow] = findRows(component);
      assert.exists(firstRow);
      assert.exists(secondRow);
      expect(firstRow.text()).toContain("*");
      expect(secondRow.text()).not.toContain("*");

      const completeButton = findButton(component, "Complete");
      assert.exists(completeButton);
      await completeButton.trigger("click");
      await flushPromises();

      expect(component.get('[role="alert"]').text()).toBe(SURVEY_REQUIRED_MESSAGE);
    });

    test("answering a row's question reveals the question in that row only", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(Runner, {
        props: {
          document: createRowsDocument([
            createSurveyTestQuestion("a"),
            createSurveyTestQuestion("b", { visibleIf: "{panel.a} = 'yes'" }),
          ]),
        },
      });
      await flushPromises();
      const [, secondRow] = findRows(component);
      assert.exists(secondRow);
      const [answerInput] = secondRow.findAll("input");
      assert.exists(answerInput);
      await answerInput.setValue("yes");
      await flushPromises();

      expect(findRowLabels(component)).toStrictEqual([["a"], ["a", "b"]]);
    });

    test("a panel is a group named by its title", async () => {
      expect.hasAssertions();

      const panel: SurveyPanelNode = {
        props: {
          ...surveyPanelNodeType.createDefaultProps(),
          children: [createSurveyTestQuestion("first")],
          id: crypto.randomUUID(),
          title: "Contact",
        },
        type: SurveyNodeType.Panel,
      };
      const component = await mountSuspended(Runner, {
        props: { document: createSurveyTestDocument([createSurveyTestPage([panel])]) },
      });
      const labelledBy = component.get('[role="group"]').attributes("aria-labelledby");

      expect(component.get(`[id="${labelledBy}"]`).text()).toBe("Contact");
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
