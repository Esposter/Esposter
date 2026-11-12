// @vitest-environment happy-dom
import type { TextElement } from "vue-block-editor-headless";

import { useWhiteboardTextEdit } from "@/composables/whiteboard/useWhiteboardTextEdit";
import {
  createWhiteboardEditState,
  pressKey,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
} from "@/services/whiteboard/constants.test";
import { getDraftPlacement } from "@/services/whiteboard/text/getDraftPlacement";
import { describe, expect, test } from "vitest";
import {
  getTextPlacement,
  getTextWidth,
  HorizontalAlignment,
  PositionedElementType,
  TextSize,
} from "vue-block-editor-headless";

describe(useWhiteboardTextEdit, () => {
  const processShape = { ...WHITEBOARD_PROCESS, text: "Review" };

  test("double clicking a shape edits its text in place", () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [processShape] }));
    const { draft, onBlur, startTextEdit } = useWhiteboardTextEdit(editState);

    startTextEdit(WHITEBOARD_PROCESS_ID);

    expect(draft.value).toBe("Review");

    draft.value = "Reviewed";
    onBlur();

    expect(editState.value.document).toStrictEqual({ elements: [{ ...processShape, text: "Reviewed" }] });
  });

  test("a composition writes its patch once, on commit, and not while it is composed", () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [processShape] }));
    const { draft, onCompositionEnd, onCompositionStart, onKeydown, startTextEdit } = useWhiteboardTextEdit(editState);

    startTextEdit(WHITEBOARD_PROCESS_ID);
    onCompositionStart();
    draft.value = "Revi";

    expect(editState.value.history.past).toHaveLength(0);

    onCompositionEnd();
    draft.value = "Reviewed";

    expect(editState.value.history.past).toHaveLength(0);

    onKeydown(pressKey({ key: "Enter" }));

    expect(editState.value.document).toStrictEqual({ elements: [{ ...processShape, text: "Reviewed" }] });
    expect(editState.value.history.past).toHaveLength(1);
  });

  test("enter during a composition does not commit the edit", () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [processShape] }));
    const { onCompositionStart, onKeydown, startTextEdit, textEdit } = useWhiteboardTextEdit(editState);

    startTextEdit(WHITEBOARD_PROCESS_ID);
    onCompositionStart();
    onKeydown(pressKey({ isComposing: true, key: "Enter" }));

    expect(textEdit.value).toStrictEqual({
      draft: "Review",
      elementId: WHITEBOARD_PROCESS_ID,
      isCommitPending: false,
      isComposing: true,
    });
    expect(editState.value.history.past).toHaveLength(0);
  });

  test("a blur during a composition commits once the composition ends", () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [processShape] }));
    const { draft, onBlur, onCompositionEnd, onCompositionStart, startTextEdit } = useWhiteboardTextEdit(editState);

    startTextEdit(WHITEBOARD_PROCESS_ID);
    onCompositionStart();
    draft.value = "Reviewed";
    onBlur();

    expect(editState.value.history.past).toHaveLength(0);

    onCompositionEnd();

    expect(editState.value.document).toStrictEqual({ elements: [{ ...processShape, text: "Reviewed" }] });
  });

  test("escape discards the edit, so the text it drafted is never written", () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [processShape] }));
    const { draft, onKeydown, startTextEdit, textEdit } = useWhiteboardTextEdit(editState);

    startTextEdit(WHITEBOARD_PROCESS_ID);
    draft.value = "Reviewed";
    onKeydown(pressKey({ key: "Escape" }));

    expect(textEdit.value).toBeUndefined();
    expect(editState.value.document).toStrictEqual({ elements: [processShape] });
    expect(editState.value.history.past).toHaveLength(0);
  });

  test("Auto width grows the box as a longer line is committed", () => {
    expect.hasAssertions();

    const textBox: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      isWrapped: false,
      text: "Review",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: getTextWidth("Review", TextSize.Small),
      x: 0,
      y: 0,
    };
    const editState = ref(createWhiteboardEditState({ elements: [textBox] }));
    const { draft, onBlur, startTextEdit } = useWhiteboardTextEdit(editState);

    startTextEdit(textBox.id);
    draft.value = "Review the order";
    onBlur();

    expect(editState.value.document).toStrictEqual({
      elements: [{ ...textBox, text: "Review the order", width: getTextWidth("Review the order", TextSize.Small) }],
    });
  });

  test("Escape returns the element to its committed text", () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [processShape] }));
    const { draft, onKeydown, startTextEdit, textEdit } = useWhiteboardTextEdit(editState);

    startTextEdit(WHITEBOARD_PROCESS_ID);
    draft.value = "Reviewed";
    onKeydown(pressKey({ key: "Escape" }));

    expect(textEdit.value).toBeUndefined();
    expect(editState.value.document).toStrictEqual({ elements: [processShape] });
  });

  test("Committing does not move the text", () => {
    expect.hasAssertions();

    // A right-aligned box is anchored at its right edge, so a box that grew on commit would move a text drawn from its old edge
    const textBox: TextElement = {
      color: "",
      horizontalAlignment: HorizontalAlignment.Right,
      id: crypto.randomUUID(),
      isWrapped: false,
      text: "Review",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: getTextWidth("Review", TextSize.Small),
      x: 200,
      y: 0,
    };
    const editState = ref(createWhiteboardEditState({ elements: [textBox] }));
    const { draft, onBlur, startTextEdit } = useWhiteboardTextEdit(editState);

    startTextEdit(textBox.id);
    draft.value = "Review the order";
    const draftPlacement = getDraftPlacement(textBox, draft.value);
    onBlur();

    expect(draftPlacement).toStrictEqual(getTextPlacement(editState.value.document.elements[0]));
  });
});
