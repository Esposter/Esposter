// @vitest-environment nuxt
import ResourceSurveyCreatorPalette from "@/components/Resource/Survey/Creator/Palette.vue";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { surveyDocumentSchema, SurveyNodeType, surveyNodeTypeDefinitionMap } from "headless-survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorPalette", () => {
  test("the palette offers every kind but the page, each under its own label", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyCreatorPalette);
    const kinds = Object.values(SurveyNodeType).filter((type) => type !== SurveyNodeType.Page);

    expect(
      component
        .findAll("button")
        .map((button) => button.text())
        .toSorted(),
    ).toStrictEqual(
      kinds
        .map((type) => surveyNodeTypeDefinitionMap[type].label)
        .toSorted((firstLabel, secondLabel) => firstLabel.localeCompare(secondLabel)),
    );
  });

  test("choosing a kind inserts it after the selected question", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(
      surveyDocumentSchema.parse({
        content: [
          {
            props: {
              children: [
                { props: { id: "first", name: "first" }, type: SurveyNodeType.Text },
                { props: { id: "second", name: "second" }, type: SurveyNodeType.Text },
              ],
              id: "page",
            },
            type: SurveyNodeType.Page,
          },
        ],
        root: { props: {} },
      }),
    );
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0");
    const component = await mountSuspended(ResourceSurveyCreatorPalette);

    await component
      .findAll("button")
      .find((button) => button.text() === surveyNodeTypeDefinitionMap[SurveyNodeType.Rating].label)
      ?.trigger("click");

    expect(surveyCreatorStore.document.content[0]?.props.children.map(({ type }) => type)).toStrictEqual([
      SurveyNodeType.Text,
      SurveyNodeType.Rating,
      SurveyNodeType.Text,
    ]);
  });
});
