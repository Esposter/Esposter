// @vitest-environment nuxt
import ResourceSurveyCreatorPalette from "@/components/Resource/Survey/Creator/Palette.vue";
import { createSurveyTestDocument } from "@/services/survey/createSurveyTestDocument.test";
import { createSurveyTestPage } from "@/services/survey/createSurveyTestPage.test";
import { createSurveyTestPanelDynamic } from "@/services/survey/createSurveyTestPanelDynamic.test";
import { createSurveyTestQuestion } from "@/services/survey/createSurveyTestQuestion.test";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  createSurveyDocument,
  surveyDocumentSchema,
  SurveyNodeType,
  surveyNodeTypeDefinitionMap,
} from "vue-survey-engine-headless";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorPalette", () => {
  test("the palette offers every kind but the page, each under its own label", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyCreatorPalette);
    const kinds = Object.values(SurveyNodeType).filter((type) => type !== SurveyNodeType.Page);

    expect(
      component
        .findAll("button:not([aria-expanded])")
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
      .findAll("button:not([aria-expanded])")
      .find((button) => button.text() === surveyNodeTypeDefinitionMap[SurveyNodeType.Rating].label)
      ?.trigger("click");

    expect(surveyCreatorStore.document.content[0]?.props.children.map(({ type }) => type)).toStrictEqual([
      SurveyNodeType.Text,
      SurveyNodeType.Rating,
      SurveyNodeType.Text,
    ]);
  });

  test("An insertion menu offers only the kinds the slot accepts", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(
      createSurveyTestDocument([
        createSurveyTestPage([createSurveyTestPanelDynamic("panel", [createSurveyTestQuestion("question1")])]),
      ]),
    );
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/0/props/template/0");
    const component = await mountSuspended(ResourceSurveyCreatorPalette);
    // A dynamic panel's template takes every kind but a page and the two panels
    const untakenKinds: SurveyNodeType[] = [SurveyNodeType.Page, SurveyNodeType.Panel, SurveyNodeType.PanelDynamic];
    const kinds = Object.values(SurveyNodeType).filter((type) => !untakenKinds.includes(type));

    expect(
      component
        .findAll("button:not([aria-expanded])")
        .map((button) => button.text())
        .toSorted((firstLabel, secondLabel) => firstLabel.localeCompare(secondLabel)),
    ).toStrictEqual(
      kinds
        .map((type) => surveyNodeTypeDefinitionMap[type].label)
        .toSorted((firstLabel, secondLabel) => firstLabel.localeCompare(secondLabel)),
    );
  });

  test("A kind no slot accepts here is absent", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    // A survey with no page has nothing selected to insert after, so the insertion point is the survey's top level, which takes pages alone
    surveyCreatorStore.load({ ...createSurveyDocument(), content: [] });
    const component = await mountSuspended(ResourceSurveyCreatorPalette);

    expect(component.findAll("button:not([aria-expanded])").map((button) => button.text())).toStrictEqual([]);
  });
});
