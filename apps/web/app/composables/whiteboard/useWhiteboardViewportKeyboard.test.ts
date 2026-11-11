// @vitest-environment nuxt
import { useWhiteboardViewportKeyboard } from "@/composables/whiteboard/useWhiteboardViewportKeyboard";
import {
  createWhiteboardEditState,
  pressKey,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
} from "@/services/whiteboard/constants.test";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, onTestFinished, test } from "vitest";

// The viewport keyboard mounted as a surface, so its commands and key listeners are bound for as long as the mount lasts
const mountViewportKeyboard = () =>
  mountSuspended(
    defineComponent({
      render: () => h("div"),
      setup: () => {
        useWhiteboardViewportKeyboard();
      },
    }),
  );

describe(useWhiteboardViewportKeyboard, () => {
  // A canvas 400 units square, so a 100-unit process fits it at full size
  const CANVAS_RECT = { height: 400, width: 400, x: 0, y: 0 };
  const FAR_PROCESS_ID = crypto.randomUUID();
  // A process a thousand units from the origin, outside the view a fresh viewport shows
  const FAR_PROCESS = { ...WHITEBOARD_PROCESS, id: FAR_PROCESS_ID, x: 1000, y: 1000 };
  const INITIAL_VIEWPORT = { scale: 1, x: 0, y: 0 };

  test("shift and 1 fit the content", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { viewport } = storeToRefs(whiteboardEditorStore);
    const { setCanvasRect } = whiteboardEditorStore;
    editState.value = createWhiteboardEditState({ elements: [FAR_PROCESS] });
    setCanvasRect(CANVAS_RECT);
    viewport.value = INITIAL_VIEWPORT;
    await mountViewportKeyboard();

    // Shift turns the digit key into its symbol, so the key read is the exclamation mark
    pressKey({ bubbles: true, key: "!", shiftKey: true });

    // The process and its padding centre the view on it, and at full size it sits inside the canvas
    expect(viewport.value).toStrictEqual({ scale: 1, x: 850, y: 850 });
  });

  test("fitting an empty board changes nothing", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { viewport } = storeToRefs(whiteboardEditorStore);
    const { setCanvasRect } = whiteboardEditorStore;
    editState.value = createWhiteboardEditState({ elements: [] });
    setCanvasRect(CANVAS_RECT);
    viewport.value = INITIAL_VIEWPORT;
    await mountViewportKeyboard();

    pressKey({ bubbles: true, key: "!", shiftKey: true });

    expect(viewport.value).toStrictEqual(INITIAL_VIEWPORT);
  });

  test("shift and 2 fit the selection", async () => {
    expect.hasAssertions();

    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { selectedIds, viewport } = storeToRefs(whiteboardEditorStore);
    const { setCanvasRect } = whiteboardEditorStore;
    editState.value = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS, FAR_PROCESS] });
    selectedIds.value = [WHITEBOARD_PROCESS_ID];
    setCanvasRect(CANVAS_RECT);
    viewport.value = INITIAL_VIEWPORT;
    await mountViewportKeyboard();

    pressKey({ bubbles: true, key: "@", shiftKey: true });

    // Only the selected process is fitted, so the view centres on it rather than on both processes
    expect(viewport.value).toStrictEqual({ scale: 1, x: -150, y: -150 });
  });

  test("ctrl and 0 reset the zoom about the view centre", async () => {
    expect.hasAssertions();

    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { viewport } = storeToRefs(whiteboardEditorStore);
    const { setCanvasRect } = whiteboardEditorStore;
    setCanvasRect(CANVAS_RECT);
    viewport.value = { scale: 2, x: 0, y: 0 };
    await mountViewportKeyboard();

    pressKey({ bubbles: true, ctrlKey: true, key: "0" });

    // At scale 2 the canvas centre sits over the document point 100 across and down, and that point stays under the centre at scale 1
    expect(viewport.value).toStrictEqual({ scale: 1, x: -100, y: -100 });
  });

  test("space held pans until it is released", async () => {
    expect.hasAssertions();

    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { isSpaceHeld } = storeToRefs(whiteboardEditorStore);
    await mountViewportKeyboard();

    pressKey({ bubbles: true, code: "Space", key: " " });

    expect(isSpaceHeld.value).toBe(true);

    document.body.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, code: "Space", key: " " }));

    expect(isSpaceHeld.value).toBe(false);
  });

  test("space on a focused button presses the button", async () => {
    expect.hasAssertions();

    const button = document.createElement("button");
    document.body.append(button);
    onTestFinished(() => {
      button.remove();
    });
    button.focus();
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { isSpaceHeld } = storeToRefs(whiteboardEditorStore);
    await mountViewportKeyboard();

    pressKey({ bubbles: true, cancelable: true, code: "Space", key: " " }, button);

    expect(isSpaceHeld.value).toBe(false);
  });

  test("space typed into a text field is text", async () => {
    expect.hasAssertions();

    const textarea = document.createElement("textarea");
    document.body.append(textarea);
    onTestFinished(() => {
      textarea.remove();
    });
    textarea.focus();
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { isSpaceHeld } = storeToRefs(whiteboardEditorStore);
    await mountViewportKeyboard();

    pressKey({ bubbles: true, code: "Space", key: " " }, textarea);

    expect(isSpaceHeld.value).toBe(false);
  });
});
