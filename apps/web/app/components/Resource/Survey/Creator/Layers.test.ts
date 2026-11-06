// @vitest-environment nuxt
import ResourceSurveyCreatorLayers from "@/components/Resource/Survey/Creator/Layers.vue";
import { createSurveyTestDocument } from "@/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "@/services/survey/createSurveyTestPage.test";
import { createSurveyTestQuestion } from "@/services/survey/createSurveyTestQuestion.test";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";
import { surveyDocumentSchema, SurveyNodeType } from "vue-survey-engine-headless";

const loadSurvey = () => {
  const surveyCreatorStore = useSurveyCreatorStore();
  surveyCreatorStore.load(
    surveyDocumentSchema.parse({
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    { props: { id: "colour", name: "colour", title: "Favourite colour" }, type: SurveyNodeType.Text },
                  ],
                  id: "panel",
                  title: "Panel",
                },
                type: SurveyNodeType.Panel,
              },
            ],
            id: "page",
          },
          type: SurveyNodeType.Page,
        },
      ],
      root: { props: {} },
    }),
  );
  return surveyCreatorStore;
};

describe("resourceSurveyCreatorLayers", () => {
  test("the tree lists every node in layer order, each row under its own pointer", async () => {
    expect.hasAssertions();

    loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorLayers);

    expect(component.findAll("[data-pointer]").map((row) => row.attributes("data-pointer"))).toStrictEqual([
      "/content/0",
      "/content/0/props/children/0",
      "/content/0/props/children/0/props/children/0",
    ]);

    component.unmount();
  });

  test("choosing a row selects its node", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorLayers);

    await component.get('[data-pointer="/content/0/props/children/0/props/children/0"]').trigger("click");

    expect(surveyCreatorStore.selectedPointer).toBe("/content/0/props/children/0/props/children/0");

    component.unmount();
  });

  test("an action the selection cannot take says why", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(
      createSurveyTestDocument([
        createSurveyTestPage([createSurveyTestQuestion("question1"), createSurveyTestQuestion("question2")]),
      ]),
    );
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/1");
    const component = await mountSuspended(ResourceSurveyCreatorLayers);
    await component.get('[aria-label="question2 actions"]').trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    const moveDown = component.findAll('[role="menuitem"]').find((item) => item.text().startsWith("Move down"));

    assert.exists(moveDown);
    expect(moveDown.attributes("aria-disabled")).toBe("true");
    expect(moveDown.text()).toBe("Move down It is last in its slot");

    component.unmount();
  });
});
