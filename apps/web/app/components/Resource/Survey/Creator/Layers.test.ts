// @vitest-environment nuxt
import ResourceSurveyCreatorLayers from "@/components/Resource/Survey/Creator/Layers.vue";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { surveyDocumentSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

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
});
