// @vitest-environment nuxt
import type { GesturePointerEvent } from "@/models/whiteboard/GesturePointerEvent";

import { useWhiteboardGesture } from "@/composables/whiteboard/useWhiteboardGesture";
import { UiToken } from "@/models/ui/UiToken";
import { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import {
  createWhiteboardEditState,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
} from "@/services/whiteboard/constants.test";
import { PRIMARY_BUTTON } from "@/services/whiteboard/gesture/constants";
import { useAlertStore } from "@/store/alert";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("uuid"), async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, v7: vi.fn<() => string>(actual.v7) };
});

describe(useWhiteboardGesture, () => {
  const POINTER_ID = 0;
  const createPointer = (action: GesturePointerAction): GesturePointerEvent => ({
    action,
    button: PRIMARY_BUTTON,
    isAltKey: false,
    isShiftKey: false,
    pointerId: POINTER_ID,
    screen: { x: 200, y: 125 },
  });

  afterEach(() => {
    vi.mocked<() => string>(v7).mockRestore();
  });

  test("a placement the document check refuses leaves the document unchanged", () => {
    expect.hasAssertions();

    // The placed shape takes the id of the process already on the canvas, which the document check refuses
    vi.mocked<() => string>(v7).mockReturnValue(WHITEBOARD_PROCESS_ID);
    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    const document = { elements: [WHITEBOARD_PROCESS] };
    editState.value = createWhiteboardEditState(document);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { tool } = storeToRefs(whiteboardEditorStore);
    tool.value = GestureTool.Shape;
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { onPointer } = useWhiteboardGesture();

    onPointer(createPointer(GesturePointerAction.Down));
    onPointer(createPointer(GesturePointerAction.Up));

    expect(editState.value.document).toStrictEqual(document);
    expect(alerts.value).toHaveLength(1);
    expect(takeOne(alerts.value, 0)).toHaveProperty("type", UiToken.Error);
  });

  test("a refused commit drops the selected ids the document never took", () => {
    expect.hasAssertions();

    vi.mocked<() => string>(v7).mockReturnValue(WHITEBOARD_PROCESS_ID);
    const whiteboardStore = useWhiteboardStore();
    const { editState } = storeToRefs(whiteboardStore);
    editState.value = createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] });
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { selectedIds, tool } = storeToRefs(whiteboardEditorStore);
    tool.value = GestureTool.Shape;
    selectedIds.value = [WHITEBOARD_PROCESS_ID, "a copy an Alt press named"];
    const { onPointer } = useWhiteboardGesture();

    onPointer(createPointer(GesturePointerAction.Down));
    onPointer(createPointer(GesturePointerAction.Up));

    expect(selectedIds.value).toStrictEqual([WHITEBOARD_PROCESS_ID]);
  });
});
