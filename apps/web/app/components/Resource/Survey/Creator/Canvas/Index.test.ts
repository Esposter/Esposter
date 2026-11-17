// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import ResourceSurveyCreatorCanvas from "#src/components/Resource/Survey/Creator/Canvas/Index.vue";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { beforeAll, describe, expect, test } from "vitest";
import { surveyDocumentSchema, SurveyNodeType } from "vue-survey-engine-headless";

const findButton = (component: VueWrapper, text: string) =>
  component.findAll("button").find((button) => button.text() === text);
const textQuestion = (name: string) => ({ props: { id: name, name }, type: SurveyNodeType.Text });
// The question names and types of a page's children, in order
const getChildren = (children: ReturnType<typeof surveyDocumentSchema.parse>["content"][number]["props"]["children"]) =>
  children.map(({ props, type }) => [type, "name" in props ? props.name : ""]);

describe("resourceSurveyCreatorCanvasIndex", () => {
  // A field loads on demand through a dynamic import, which is module I/O rather than a microtask
  beforeAll(async () => {
    await import("#src/components/Resource/Survey/Field/Text.vue");
  });

  test("the add control inserts at the end of its page", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(
      surveyDocumentSchema.parse({
        content: [
          {
            props: { children: [textQuestion("first"), textQuestion("second")], enableIf: "", id: "page" },
            type: SurveyNodeType.Page,
          },
        ],
        root: { props: { backgroundImage: "" } },
      }),
    );
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await findButton(component, "Add question")?.trigger("click");
    await flushPromises();

    const children = surveyCreatorStore.document.content[0]?.props.children ?? [];
    expect(getChildren(children)).toStrictEqual([
      [SurveyNodeType.Text, "first"],
      [SurveyNodeType.Text, "second"],
      [SurveyNodeType.Text, "question1"],
    ]);
    expect(surveyCreatorStore.selectedPointer).toBe("/content/0/props/children/2");
  });

  test("the skeleton adds a page", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = useSurveyCreatorStore();
    surveyCreatorStore.load(
      surveyDocumentSchema.parse({
        content: [
          { props: { children: [textQuestion("first")], enableIf: "", id: "page" }, type: SurveyNodeType.Page },
        ],
        root: { props: { backgroundImage: "" } },
      }),
    );
    const component = await mountSuspended(ResourceSurveyCreatorCanvas);
    await findButton(component, "Add page")?.trigger("click");
    await flushPromises();

    expect(surveyCreatorStore.document.content).toHaveLength(2);
    expect(surveyCreatorStore.selectedPointer).toBe("/content/1");
  });
});
