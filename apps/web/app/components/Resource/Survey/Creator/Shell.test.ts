// @vitest-environment nuxt
import ResourceSurveyCreatorCanvas from "@/components/Resource/Survey/Creator/Canvas.vue";
import ResourceSurveyCreatorShell from "@/components/Resource/Survey/Creator/Shell.vue";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { SurveyNodeType, surveyDocumentSchema } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCreatorShell", () => {
  const loadSurvey = () => {
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
    return surveyCreatorStore;
  };

  test("choosing an element in the canvas selects the same row of the layers tree", async () => {
    expect.hasAssertions();

    loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorShell);
    // The canvas draws the page first, then its two questions
    await component.getComponent(ResourceSurveyCreatorCanvas).findAll('[tabindex="0"]').at(2)?.trigger("click");

    expect(component.get('[data-pointer="/content/0/props/children/1"]').attributes("aria-current")).toBe("true");

    component.unmount();
  });

  test("Alt+ArrowUp moves the selected question above the one before it", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey();
    const { select } = useSurveyCreatorCommands();
    select("/content/0/props/children/1");
    const component = await mountSuspended(ResourceSurveyCreatorShell);

    document.body.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, key: "ArrowUp" }));

    expect(surveyCreatorStore.document.content[0]?.props.children.map(({ props }) => props.id)).toStrictEqual([
      "second",
      "first",
    ]);

    component.unmount();
  });
});
