// @vitest-environment nuxt
import type { SurveyDropSlot } from "@/models/resource/survey/SurveyDropSlot";
import type { SurveyPageNode, SurveyPlaceableNode, SurveyTextNode } from "headless-survey-engine";

import { useSurveyCreatorCommands } from "@/composables/survey/useSurveyCreatorCommands";
import { useSurveyCreatorDrag } from "@/composables/survey/useSurveyCreatorDrag";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { createSurveyDocument, SurveyNodeType, surveyNodeTypeDefinitionMap } from "headless-survey-engine";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test } from "vitest";

const createQuestion = (name: string): SurveyTextNode => ({
  props: { ...surveyNodeTypeDefinitionMap[SurveyNodeType.Text].createDefaultProps(), id: crypto.randomUUID(), name },
  type: SurveyNodeType.Text,
});
const createPage = (children: SurveyPlaceableNode[]): SurveyPageNode => ({
  props: {
    ...surveyNodeTypeDefinitionMap[SurveyNodeType.Page].createDefaultProps(),
    children,
    id: crypto.randomUUID(),
  },
  type: SurveyNodeType.Page,
});
// The slot of a page holding two questions, each a 40 high row stacked from the top of the page's 300 high box
const createPageSlot = (): SurveyDropSlot => ({
  acceptedTypes: [SurveyNodeType.Text, SurveyNodeType.Rating],
  box: { height: 300, left: 0, top: 0, width: 400 },
  childBoxes: [
    { height: 40, left: 0, top: 0, width: 400 },
    { height: 40, left: 0, top: 40, width: 400 },
  ],
  slotPointer: "/content/0/props/children",
});
const createPointerEvent = (type: string, clientX: number, clientY: number) =>
  new PointerEvent(type, { bubbles: true, cancelable: true, clientX, clientY, pointerId: 1, pointerType: "mouse" });
// Loads a survey of the pages given, then hands back the drag with the store's refs and the commands the assertions read
const setup = (content: SurveyPageNode[]) => {
  setActivePinia(createPinia());
  const surveyCreatorStore = useSurveyCreatorStore();
  const { document, isUndoable } = storeToRefs(surveyCreatorStore);
  const original = { ...createSurveyDocument(), content };
  surveyCreatorStore.load(original);
  return { document, isUndoable, original, ...useSurveyCreatorCommands(), ...useSurveyCreatorDrag() };
};

describe(useSurveyCreatorDrag, () => {
  test("a palette kind released over a slot is inserted there, and one undo takes it back out", () => {
    expect.hasAssertions();

    const { document, original, registerSlots, startPaletteDrag, undo } = setup([
      createPage([createQuestion("question1"), createQuestion("question2")]),
    ]);
    registerSlots(() => [createPageSlot()]);
    startPaletteDrag(SurveyNodeType.Rating, createPointerEvent("pointerdown", 200, 10));
    window.dispatchEvent(createPointerEvent("pointermove", 200, 30));
    window.dispatchEvent(createPointerEvent("pointerup", 200, 30));

    expect(document.value.content[0]?.props.children.map(({ type }) => type)).toStrictEqual([
      SurveyNodeType.Text,
      SurveyNodeType.Rating,
      SurveyNodeType.Text,
    ]);

    undo();

    expect(document.value).toStrictEqual(original);
  });

  test("a release over no slot changes nothing and records nothing", () => {
    expect.hasAssertions();

    const { document, isUndoable, original, registerSlots, startPaletteDrag } = setup([
      createPage([createQuestion("question1"), createQuestion("question2")]),
    ]);
    registerSlots(() => [createPageSlot()]);
    startPaletteDrag(SurveyNodeType.Rating, createPointerEvent("pointerdown", 200, 10));
    window.dispatchEvent(createPointerEvent("pointermove", 500, 30));
    window.dispatchEvent(createPointerEvent("pointerup", 500, 30));

    expect(document.value).toStrictEqual(original);
    expect(isUndoable.value).toBe(false);
  });

  test("Escape ends a drag in progress, so the release after it inserts nothing", () => {
    expect.hasAssertions();

    const { document, isDragging, original, registerSlots, startPaletteDrag } = setup([
      createPage([createQuestion("question1"), createQuestion("question2")]),
    ]);
    registerSlots(() => [createPageSlot()]);
    startPaletteDrag(SurveyNodeType.Rating, createPointerEvent("pointerdown", 200, 10));
    window.dispatchEvent(createPointerEvent("pointermove", 200, 30));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(isDragging.value).toBe(false);

    window.dispatchEvent(createPointerEvent("pointerup", 200, 30));

    expect(document.value).toStrictEqual(original);
  });
});
