// @vitest-environment nuxt
import ResourceSurveyCreatorCanvas from "@/components/Resource/Survey/Creator/Canvas.vue";
import ResourceSurveyCreatorShell from "@/components/Resource/Survey/Creator/Shell.vue";
import ResourceSurveyRunner from "@/components/Resource/Survey/Runner.vue";
import { SurveyEditorSelectionKind } from "@/models/resource/survey/SurveyEditorSelectionKind";
import { SurveyEditorRegion } from "@/models/resource/survey/SurveyEditorRegion";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { SurveyEditorLayout } from "@/services/resource/survey/SurveyEditorLayout";
import { SurveyEditorRegionNameMap } from "@/services/resource/survey/SurveyEditorRegionNameMap";
import { SurveyEditorRegistry } from "@/services/resource/survey/SurveyEditorRegistry";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { surveyDocumentSchema, SurveyNodeType } from "vue-survey-engine-headless";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { checkLayout } from "vue-editor-layout-headless";

// The size class is read from the display composable, so a test says how small the window is before the shell mounts
const display = vi.hoisted(() => ({ isCompact: false, isMobile: false }));
vi.mock(import("@/composables/ui/useUiDisplay"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useUiDisplay: () => ({
      ...actual.useUiDisplay(),
      isMobile: shallowRef(display.isMobile),
      xs: shallowRef(display.isCompact),
    }),
  };
});

const loadSurvey = () => {
  const surveyCreatorStore = useSurveyCreatorStore();
  // The store keeps its preview across tests, so each survey starts in Design
  surveyCreatorStore.isPreview = false;
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

describe("resourceSurveyCreatorShell", () => {
  const firstQuestionPointer = "/content/0/props/children/0";
  const secondQuestionPointer = "/content/0/props/children/1";
  const structureSelector = 'aside[aria-label="Structure"]';
  const inspectorSelector = 'aside[aria-label="Inspector"]';

  beforeEach(() => {
    display.isCompact = false;
    display.isMobile = false;
    localStorage.clear();
  });

  test("choosing an element in the canvas selects the same row of the layers tree", async () => {
    expect.hasAssertions();

    loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorShell);
    // The canvas draws the page first, then its two questions
    await component.getComponent(ResourceSurveyCreatorCanvas).findAll('[tabindex="0"]').at(2)?.trigger("click");

    expect(component.get(`[data-pointer="${secondQuestionPointer}"]`).attributes("aria-current")).toBe("true");

    component.unmount();
  });

  test("moves the selected question above the one before it on Alt+ArrowUp", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey();
    const { select } = useSurveyCreatorCommands();
    select(secondQuestionPointer);
    const component = await mountSuspended(ResourceSurveyCreatorShell);

    // A key press bubbles to the window, where the commands bind their shortcuts
    document.body.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, bubbles: true, key: "ArrowUp" }));

    expect(surveyCreatorStore.document.content[0]?.props.children.map(({ props }) => props.id)).toStrictEqual([
      "second",
      "first",
    ]);

    component.unmount();
  });

  test("the survey's layout passes the layout check", () => {
    expect.hasAssertions();

    expect(
      checkLayout(SurveyEditorLayout, ["", SurveyEditorSelectionKind.Node], Object.keys(SurveyEditorRegistry)),
    ).toStrictEqual([]);
  });

  test("preview removes the editing regions", async () => {
    expect.hasAssertions();

    const surveyCreatorStore = loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorShell);

    expect(component.find(structureSelector).exists()).toBe(true);
    expect(component.find(inspectorSelector).exists()).toBe(true);

    surveyCreatorStore.isPreview = true;
    await nextTick();

    expect(component.findComponent(ResourceSurveyRunner).exists()).toBe(true);
    expect(component.find(structureSelector).exists()).toBe(false);
    expect(component.find(inspectorSelector).exists()).toBe(false);

    component.unmount();
  });

  test("the structure region has two tabs", async () => {
    expect.hasAssertions();

    loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorShell);

    expect(component.findAll(`${structureSelector} [role="tab"]`).map((tab) => tab.text())).toStrictEqual([
      "Outline",
      "Add",
    ]);

    component.unmount();
  });

  test("nothing selected offers the theme tab", async () => {
    expect.hasAssertions();

    loadSurvey();
    const component = await mountSuspended(ResourceSurveyCreatorShell);

    expect(component.findAll(`${inspectorSelector} [role="tab"]`).map((tab) => tab.text())).toStrictEqual([
      "Survey",
      "Logic",
      "Theme",
    ]);

    component.unmount();
  });

  test("a node selection offers no theme tab", async () => {
    expect.hasAssertions();

    loadSurvey();
    const { select } = useSurveyCreatorCommands();
    select(firstQuestionPointer);
    const component = await mountSuspended(ResourceSurveyCreatorShell);

    expect(component.findAll(`${inspectorSelector} [role="tab"]`).map((tab) => tab.text())).toStrictEqual([
      "Properties",
      "Logic",
    ]);

    component.unmount();
  });

  // Last, since a sheet a reader opens is kept in the reader's state, which the tests after it would start from
  test("a compact window opens the inspector as a sheet", async () => {
    expect.hasAssertions();

    display.isCompact = true;
    display.isMobile = true;
    loadSurvey();
    const { select } = useSurveyCreatorCommands();
    select(firstQuestionPointer);
    const component = await mountSuspended(ResourceSurveyCreatorShell);
    const inspectorSheet = component.get<HTMLDialogElement>(`dialog[data-placement="${UiDialogPlacement.DrawerEnd}"]`);

    expect(inspectorSheet.element.open).toBe(false);

    // The shell draws a button for each sheet, named by the region it opens
    await component
      .findAll("button")
      .find((button) => button.text() === SurveyEditorRegionNameMap[SurveyEditorRegion.Inspector])
      ?.trigger("click");
    await flushPromises();

    expect(inspectorSheet.element.open).toBe(true);
    expect(component.findComponent(ResourceSurveyCreatorCanvas).exists()).toBe(true);

    component.unmount();
  });
});
