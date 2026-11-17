// @vitest-environment nuxt
import type { WhiteboardEditState } from "#src/models/whiteboard/WhiteboardEditState";
import type { ArrowElement, ImageElement, ShapeElement, TextElement } from "vue-block-editor-headless";

import { useWhiteboardStyleKeyboard } from "#src/composables/whiteboard/useWhiteboardStyleKeyboard";
import {
  createWhiteboardEditState,
  pressKey,
  WHITEBOARD_ARROW,
  WHITEBOARD_PROCESS,
} from "#src/services/whiteboard/constants.test";
import { undoWhiteboardEdit } from "#src/services/whiteboard/edit/undoWhiteboardEdit";
import { useWhiteboardStyleClipboardStore } from "#src/store/resource/whiteboard/styleClipboard";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import {
  ArrowheadKind,
  CornerStyle,
  DashPattern,
  HorizontalAlignment,
  PositionedElementType,
  ShapeKind,
  SketchLevel,
  StrokeWidth,
  TextSize,
} from "vue-block-editor-headless";

// The style keys mounted as a surface, so their commands are bound for as long as the mount lasts
const mountStyleKeyboard = (editState: Ref<WhiteboardEditState>, selectedIds: Ref<string[]>) =>
  mountSuspended(
    defineComponent({
      render: () => h("div"),
      setup: () => {
        useWhiteboardStyleKeyboard(editState, selectedIds, ref(false));
      },
    }),
  );

const createShape = (id: string, changes: Partial<ShapeElement> = {}): ShapeElement => ({
  ...WHITEBOARD_PROCESS,
  id,
  ...changes,
});

const createArrow = (id: string, start: ArrowElement["start"], end: ArrowElement["end"]): ArrowElement => ({
  ...WHITEBOARD_ARROW,
  end,
  id,
  start,
});

describe(useWhiteboardStyleKeyboard, () => {
  const COPY_KEYS: KeyboardEventInit = { altKey: true, bubbles: true, code: "KeyC", ctrlKey: true, key: "c" };
  const PASTE_KEYS: KeyboardEventInit = { altKey: true, bubbles: true, code: "KeyV", ctrlKey: true, key: "v" };
  const FIRST_ID = v7();
  const SECOND_ID = v7();
  const THIRD_ID = v7();
  const FOURTH_ID = v7();
  const IMAGE_ID = v7();

  test("copy style takes the look of the selected element", async () => {
    expect.hasAssertions();

    const whiteboardStyleClipboardStore = useWhiteboardStyleClipboardStore();
    const { copiedStyle } = storeToRefs(whiteboardStyleClipboardStore);
    const shape = createShape(FIRST_ID, {
      color: "#ef4444",
      cornerStyle: CornerStyle.Round,
      dashPattern: DashPattern.Dashed,
      fill: "#3b82f6",
    });
    const editState = ref(createWhiteboardEditState({ elements: [shape] }));
    const selectedIds = ref([FIRST_ID]);
    await mountStyleKeyboard(editState, selectedIds);

    pressKey(COPY_KEYS);

    expect(copiedStyle.value).toStrictEqual([
      { property: "color", value: "#ef4444" },
      { property: "strokeWidth", value: StrokeWidth.Medium },
      { property: "dashPattern", value: DashPattern.Dashed },
      { property: "sketchLevel", value: SketchLevel.Artist },
      { property: "fill", value: "#3b82f6" },
      { property: "cornerStyle", value: CornerStyle.Round },
      { property: "textSize", value: TextSize.Small },
    ]);
  });

  test("copying an image copies no look", async () => {
    expect.hasAssertions();

    const whiteboardStyleClipboardStore = useWhiteboardStyleClipboardStore();
    const { copiedStyle } = storeToRefs(whiteboardStyleClipboardStore);
    const image: ImageElement = {
      altText: "",
      fileId: "0".repeat(64),
      height: 50,
      id: IMAGE_ID,
      type: PositionedElementType.Image,
      width: 50,
      x: 0,
      y: 0,
    };
    const elements = [createShape(FIRST_ID, { fill: "#3b82f6" }), image];
    const editState = ref(createWhiteboardEditState({ elements }));
    const selectedIds = ref([FIRST_ID]);
    await mountStyleKeyboard(editState, selectedIds);
    pressKey(COPY_KEYS);
    const shapeLook = copiedStyle.value;

    expect(shapeLook).not.toStrictEqual([]);

    selectedIds.value = [IMAGE_ID];
    await nextTick();
    pressKey(COPY_KEYS);

    expect(copiedStyle.value).toStrictEqual([]);

    selectedIds.value = [FIRST_ID];
    await nextTick();
    pressKey(PASTE_KEYS);

    expect(editState.value.document).toStrictEqual({ elements });
  });

  test("copy style needs exactly one selected element", async () => {
    expect.hasAssertions();

    const whiteboardStyleClipboardStore = useWhiteboardStyleClipboardStore();
    const { copiedStyle } = storeToRefs(whiteboardStyleClipboardStore);
    const first = createShape(FIRST_ID, { color: "#ef4444" });
    const second = createShape(SECOND_ID, { color: "#22c55e" });
    const editState = ref(createWhiteboardEditState({ elements: [first, second] }));
    const selectedIds = ref([SECOND_ID]);
    await mountStyleKeyboard(editState, selectedIds);
    pressKey(COPY_KEYS);
    const copiedBefore = copiedStyle.value;

    // The first element in the document is the one a copy of several would take, and its colour differs from the copied look
    selectedIds.value = [FIRST_ID, SECOND_ID];
    await nextTick();
    pressKey(COPY_KEYS);

    expect(copiedStyle.value).toStrictEqual(copiedBefore);
  });

  test("paste style gives each element the fields its kind holds", async () => {
    expect.hasAssertions();

    const source = createShape(FIRST_ID, {
      color: "#ef4444",
      dashPattern: DashPattern.Dashed,
      fill: "#3b82f6",
      horizontalAlignment: HorizontalAlignment.Center,
      kind: ShapeKind.Rectangle,
      textSize: TextSize.Large,
    });
    const rectangle = createShape(SECOND_ID, { kind: ShapeKind.Rectangle, x: 200 });
    const textBox: TextElement = {
      color: "",
      id: THIRD_ID,
      isWrapped: true,
      text: "Notes",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: 120,
      x: 400,
      y: 0,
    };
    const editState = ref(createWhiteboardEditState({ elements: [source, rectangle, textBox] }));
    const selectedIds = ref([FIRST_ID]);
    await mountStyleKeyboard(editState, selectedIds);
    pressKey(COPY_KEYS);
    selectedIds.value = [SECOND_ID, THIRD_ID];
    await nextTick();

    pressKey(PASTE_KEYS);

    expect(editState.value.document.elements).toStrictEqual([
      source,
      {
        ...rectangle,
        color: "#ef4444",
        dashPattern: DashPattern.Dashed,
        fill: "#3b82f6",
        horizontalAlignment: HorizontalAlignment.Center,
        textSize: TextSize.Large,
      },
      { ...textBox, color: "#ef4444", horizontalAlignment: HorizontalAlignment.Center, textSize: TextSize.Large },
    ]);
  });

  test("paste style clears an arrowhead the copied arrow lacks", async () => {
    expect.hasAssertions();

    const copiedArrow = createArrow(
      FIRST_ID,
      { point: { x: 0, y: 0 } },
      { arrowhead: ArrowheadKind.Triangle, point: { x: 100, y: 0 } },
    );
    const arrow = createArrow(
      SECOND_ID,
      { arrowhead: ArrowheadKind.Triangle, point: { x: 0, y: 50 } },
      { point: { x: 100, y: 50 } },
    );
    const editState = ref(createWhiteboardEditState({ elements: [copiedArrow, arrow] }));
    const selectedIds = ref([FIRST_ID]);
    await mountStyleKeyboard(editState, selectedIds);
    pressKey(COPY_KEYS);
    selectedIds.value = [SECOND_ID];
    await nextTick();

    pressKey(PASTE_KEYS);

    expect(editState.value.document.elements[1]).toStrictEqual({
      ...arrow,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 100, y: 50 } },
      start: { point: { x: 0, y: 50 } },
    });
  });

  test("paste style is one undo step", async () => {
    expect.hasAssertions();

    const source = createShape(FIRST_ID, { color: "#ef4444", fill: "#3b82f6" });
    const targets = [createShape(SECOND_ID), createShape(THIRD_ID), createShape(FOURTH_ID)];
    const elements = [source, ...targets];
    const editState = ref(createWhiteboardEditState({ elements }));
    const selectedIds = ref([FIRST_ID]);
    await mountStyleKeyboard(editState, selectedIds);
    pressKey(COPY_KEYS);
    selectedIds.value = [SECOND_ID, THIRD_ID, FOURTH_ID];
    await nextTick();

    pressKey(PASTE_KEYS);

    expect(editState.value.document.elements.slice(1)).toStrictEqual(
      targets.map((target) => ({ ...target, color: "#ef4444", fill: "#3b82f6" })),
    );
    expect(undoWhiteboardEdit(editState.value).document).toStrictEqual({ elements });
  });

  test("paste style with nothing copied changes nothing", async () => {
    expect.hasAssertions();

    const state = createWhiteboardEditState({ elements: [createShape(FIRST_ID)] });
    const editState = ref(state);
    const selectedIds = ref([FIRST_ID]);
    await mountStyleKeyboard(editState, selectedIds);

    pressKey(PASTE_KEYS);

    expect(editState.value).toStrictEqual(state);
  });

  test("a copied style pastes onto another whiteboard", async () => {
    expect.hasAssertions();

    const source = createShape(FIRST_ID, { color: "#ef4444", fill: "#3b82f6" });
    const firstBoard = ref(createWhiteboardEditState({ elements: [source] }));
    const firstWrapper = await mountStyleKeyboard(firstBoard, ref([FIRST_ID]));
    pressKey(COPY_KEYS);
    firstWrapper.unmount();

    const target = createShape(SECOND_ID);
    const secondBoard = ref(createWhiteboardEditState({ elements: [target] }));
    await mountStyleKeyboard(secondBoard, ref([SECOND_ID]));

    pressKey(PASTE_KEYS);

    expect(secondBoard.value.document.elements).toStrictEqual([{ ...target, color: "#ef4444", fill: "#3b82f6" }]);
  });
});
