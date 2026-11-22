// @vitest-environment happy-dom
import { useSurveyCanvasSelection } from "#src/composables/survey/useSurveyCanvasSelection";
import { createSurveyOnePageTestDocument } from "#src/services/survey/createSurveyOnePageTestDocument.test";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test } from "vitest";

describe(useSurveyCanvasSelection, () => {
  test("a click chooses its element, and Enter chooses it only from the element itself", () => {
    expect.hasAssertions();

    setActivePinia(createPinia());
    const surveyCreatorStore = useSurveyCreatorStore();
    const { selectedPointer } = storeToRefs(surveyCreatorStore);
    const { load } = surveyCreatorStore;
    // The selection is read off the document, so the element's pointer names a page the document holds
    load(createSurveyOnePageTestDocument([]));
    const { getSelectionBindings } = useSurveyCanvasSelection();
    const pointer = "/content/0";
    const bindings = getSelectionBindings(pointer);
    const element = window.document.createElement("div");
    const child = window.document.createElement("span");
    element.append(child);
    element.addEventListener("click", bindings.onClick);
    element.addEventListener("keydown", bindings.onKeydown);

    child.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));

    expect(selectedPointer.value).toBe("");

    element.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));

    expect(selectedPointer.value).toBe(pointer);
    expect(getSelectionBindings(pointer).class).toStrictEqual({ "ui-selected": true });

    selectedPointer.value = "";
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(selectedPointer.value).toBe(pointer);
  });
});
