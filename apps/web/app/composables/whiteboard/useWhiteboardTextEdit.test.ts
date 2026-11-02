// @vitest-environment happy-dom
import { useWhiteboardTextEdit } from "@/composables/whiteboard/useWhiteboardTextEdit";
import {
  createWhiteboardEditState,
  pressKey,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
} from "@/services/whiteboard/constants.test";
import { describe, expect, test } from "vitest";

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

    expect(textEdit.value).toBeDefined();
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

  test("a commit that leaves the text as it was writes no history entry", () => {
    expect.hasAssertions();

    const editState = ref(createWhiteboardEditState({ elements: [processShape] }));
    const { onBlur, startTextEdit } = useWhiteboardTextEdit(editState);

    startTextEdit(WHITEBOARD_PROCESS_ID);
    onBlur();

    expect(editState.value.history.past).toHaveLength(0);
  });
});
