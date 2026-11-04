// @vitest-environment nuxt
import { useSurveyCanvasSelection } from "@/composables/survey/useSurveyCanvasSelection";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { createPinia, setActivePinia } from "pinia";
import { surveyDocumentSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe(useSurveyCanvasSelection, () => {
  test("a click chooses its element, and Enter chooses it only from the element itself", () => {
    expect.hasAssertions();

    setActivePinia(createPinia());
    const surveyCreatorStore = useSurveyCreatorStore();
    // The selection is read off the document, so the element's pointer names a page the document holds
    surveyCreatorStore.load(
      surveyDocumentSchema.parse({
        content: [{ props: { children: [], id: "page" }, type: SurveyNodeType.Page }],
        root: { props: {} },
      }),
    );
    const { getSelectionBindings } = useSurveyCanvasSelection();
    const pointer = "/content/0";
    const bindings = getSelectionBindings(pointer);
    const element = window.document.createElement("div");
    const child = window.document.createElement("span");
    element.append(child);
    element.addEventListener("click", bindings.onClick);
    element.addEventListener("keydown", bindings.onKeydown);

    child.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));

    expect(surveyCreatorStore.selectedPointer).toBe("");

    element.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));

    expect(surveyCreatorStore.selectedPointer).toBe(pointer);
    expect(getSelectionBindings(pointer).class).toStrictEqual({ "ui-selected": true });

    surveyCreatorStore.selectedPointer = "";
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(surveyCreatorStore.selectedPointer).toBe(pointer);
  });
});
