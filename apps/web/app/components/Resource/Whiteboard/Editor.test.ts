// @vitest-environment nuxt
import type { WhiteboardElement } from "#shared/models/resource/whiteboard/WhiteboardElement";
import type { DOMWrapper, VueWrapper } from "@vue/test-utils";
import type { ArrowElement, Point, ShapeElement } from "headless-block-editor";
import type { Except } from "type-fest";

import { MimeType } from "#shared/models/file/MimeType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceWhiteboardEditor from "@/components/Resource/Whiteboard/Editor.vue";
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { pressKey, WHITEBOARD_ARROW, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { getFitViewport } from "@/services/whiteboard/viewport/getFitViewport";
import { useResourceStore } from "@/store/resource";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { ArrowPathKind, getExportBounds, PositionedElementType } from "headless-block-editor";
import { beforeEach, describe, expect, onTestFinished, test, vi } from "vitest";

const { uploadResourceFileMock } = vi.hoisted(() => ({
  uploadResourceFileMock: vi.fn<(file: File) => Promise<string>>(),
}));

// The upload is covered by useUploadResourceFile's own suite, so it is mocked at its seam here, and a paste reaches it
vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({
  useUploadResourceFile: () => uploadResourceFileMock,
}));

const createShape = (id: string, x: number): ShapeElement => ({ ...WHITEBOARD_PROCESS, id, x });
// The canvas is the one application-role surface, where every pointer and key of a gesture lands
const getCanvas = (component: VueWrapper) => component.get('[role="application"]');

describe("resourceWhiteboardEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const POINTER_ID = 1;
  const FIRST_SHAPE_ID = crypto.randomUUID();
  const SECOND_SHAPE_ID = crypto.randomUUID();
  const THIRD_SHAPE_ID = crypto.randomUUID();
  // The process shape's bottom point is where a right-angled arrow starts, bound to it, and its far end is free
  const RIGHT_ANGLED_ARROW: ArrowElement = { ...WHITEBOARD_ARROW, pathKind: ArrowPathKind.RightAngled };
  const CANVAS_RECT = { height: 600, width: 800, x: 0, y: 0 };

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Whiteboard }),
      publication: null,
    }));
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  const mountEditor = (elements: WhiteboardElement[]) => {
    trpcMsw.whiteboard.readResourceContent.query(() => ({ elements }));
    return mountSuspended(ResourceWhiteboardEditor);
  };
  const sendPointer = (canvas: Except<DOMWrapper<Element>, "exists">, type: string, point: Point) =>
    canvas.trigger(type, { button: 0, clientX: point.x, clientY: point.y, pointerId: POINTER_ID });
  // A press on one point, then a drag to another, released there, as one pointer's whole gesture
  const drag = async (canvas: Except<DOMWrapper<Element>, "exists">, origin: Point, destination: Point) => {
    await sendPointer(canvas, "pointerdown", origin);
    await sendPointer(canvas, "pointermove", destination);
    await sendPointer(canvas, "pointerup", destination);
  };

  // The arrow bound to the moved shape is rerouted from the shape's new bottom point, in the same edit as the move
  test("moving a shape keeps its arrows attached in the editor", async () => {
    expect.hasAssertions();

    const component = await mountEditor([WHITEBOARD_PROCESS, RIGHT_ANGLED_ARROW]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    await flushPromises();
    await drag(getCanvas(component), { x: 50, y: 50 }, { x: 80, y: 70 });

    expect(whiteboard.value.elements).toStrictEqual([
      { ...WHITEBOARD_PROCESS, x: 40, y: 20 },
      { ...RIGHT_ANGLED_ARROW, start: { ...RIGHT_ANGLED_ARROW.start, point: { x: 90, y: 120 } } },
    ]);
  });

  test("undo reverts a move and its reroute together in the editor", async () => {
    expect.hasAssertions();

    const component = await mountEditor([WHITEBOARD_PROCESS, RIGHT_ANGLED_ARROW]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    await flushPromises();
    const canvas = getCanvas(component);
    await drag(canvas, { x: 50, y: 50 }, { x: 80, y: 70 });
    pressKey({ bubbles: true, ctrlKey: true, key: "z" });

    expect(whiteboard.value.elements).toStrictEqual([WHITEBOARD_PROCESS, RIGHT_ANGLED_ARROW]);
  });

  test("a marquee selects every shape it covers in the editor", async () => {
    expect.hasAssertions();

    const component = await mountEditor([
      createShape(FIRST_SHAPE_ID, 0),
      createShape(SECOND_SHAPE_ID, 200),
      createShape(THIRD_SHAPE_ID, 400),
    ]);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { selectedIds } = storeToRefs(whiteboardEditorStore);
    await flushPromises();
    await drag(getCanvas(component), { x: -10, y: -10 }, { x: 310, y: 110 });

    expect(selectedIds.value).toStrictEqual([FIRST_SHAPE_ID, SECOND_SHAPE_ID]);
  });

  test("double clicking a shape edits its text in place in the editor", async () => {
    expect.hasAssertions();

    const shape = { ...WHITEBOARD_PROCESS, text: "a" };
    const component = await mountEditor([shape]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    await flushPromises();
    await getCanvas(component).trigger("dblclick", { clientX: 50, clientY: 50 });
    const textarea = component.get("textarea");
    await textarea.setValue("b");
    await textarea.trigger("keydown", { key: "Enter" });

    expect(whiteboard.value.elements).toStrictEqual([{ ...shape, text: "b" }]);
    expect(component.findAll("textarea")).toHaveLength(0);
    expect(
      getCanvas(component)
        .findAll("text")
        .map((label) => label.text()),
    ).toStrictEqual(["b"]);
  });

  // A paste is an image file's clipboard event, which the canvas inserts unless the paste comes from the text box being edited
  test("pasting an image into the text box being edited adds no image to the canvas", async () => {
    expect.hasAssertions();

    const file = new File(["a"], "a", { type: MimeType.Png });
    uploadResourceFileMock.mockResolvedValue(" ");
    const component = await mountEditor([WHITEBOARD_PROCESS]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    await flushPromises();
    await getCanvas(component).trigger("dblclick", { clientX: 50, clientY: 50 });
    const paste = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(paste, "clipboardData", { value: { files: [file], getData: () => "" } });
    component.get("textarea").element.dispatchEvent(paste);
    await flushPromises();

    expect(whiteboard.value.elements).toStrictEqual([WHITEBOARD_PROCESS]);
    expect(uploadResourceFileMock).not.toHaveBeenCalled();
  });

  test("deleting a shape from the canvas asks first and then removes its arrows in the editor", async () => {
    expect.hasAssertions();

    const component = await mountEditor([WHITEBOARD_PROCESS, RIGHT_ANGLED_ARROW]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    await flushPromises();
    const canvas = getCanvas(component);
    await drag(canvas, { x: 50, y: 50 }, { x: 50, y: 50 });
    pressKey({ bubbles: true, key: "Delete" });
    await flushPromises();
    const deleteDialog = component.getComponent(UiConfirmDialog);

    expect(deleteDialog.props("modelValue")).toBe(true);
    expect(whiteboard.value.elements).toStrictEqual([WHITEBOARD_PROCESS, RIGHT_ANGLED_ARROW]);

    await deleteDialog.props("confirm")();

    expect(whiteboard.value.elements).toStrictEqual([]);
  });

  // The text box takes its own Escape, so no window shortcut hears it: the edit is discarded and the selection stays
  test("escape in the text box being edited discards the edit and keeps the selection in the editor", async () => {
    expect.hasAssertions();

    const shape = { ...WHITEBOARD_PROCESS, text: "a" };
    const component = await mountEditor([shape]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { selectedIds } = storeToRefs(whiteboardEditorStore);
    await flushPromises();
    await drag(getCanvas(component), { x: 50, y: 50 }, { x: 50, y: 50 });
    await getCanvas(component).trigger("dblclick", { clientX: 50, clientY: 50 });
    const textarea = component.get("textarea");
    await textarea.setValue("b");
    const onWindowKeydown = vi.fn<(event: KeyboardEvent) => void>();
    window.addEventListener("keydown", onWindowKeydown);
    onTestFinished(() => {
      window.removeEventListener("keydown", onWindowKeydown);
    });
    pressKey({ bubbles: true, key: "Escape" }, textarea.element);
    await flushPromises();

    expect(component.findAll("textarea")).toHaveLength(0);
    expect(whiteboard.value.elements).toStrictEqual([shape]);
    expect(selectedIds.value).toStrictEqual([shape.id]);
    expect(onWindowKeydown).not.toHaveBeenCalled();
  });

  test("a freehand stroke follows the pointer in the editor", async () => {
    expect.hasAssertions();

    const component = await mountEditor([]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    await flushPromises();
    await component.get('button[aria-label="Freehand"]').trigger("click");
    const canvas = getCanvas(component);
    await sendPointer(canvas, "pointerdown", { x: 10, y: 10 });
    await sendPointer(canvas, "pointermove", { x: 20, y: 10 });
    await sendPointer(canvas, "pointermove", { x: 20, y: 20 });
    await sendPointer(canvas, "pointerup", { x: 30, y: 30 });
    const [stroke] = whiteboard.value.elements;

    expect(stroke?.type).toBe(PositionedElementType.Stroke);
    expect(stroke).toHaveProperty("points", [
      { x: 10, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 20 },
      { x: 30, y: 30 },
    ]);
  });

  test("a whiteboard with content opens fitted to the canvas, once", async () => {
    expect.hasAssertions();

    await mountEditor([WHITEBOARD_PROCESS]);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { setCanvasRect } = whiteboardEditorStore;
    const { viewport } = storeToRefs(whiteboardEditorStore);
    await flushPromises();
    setCanvasRect(CANVAS_RECT);
    await flushPromises();
    const fittedViewport = getFitViewport(getExportBounds({ elements: [WHITEBOARD_PROCESS] }), CANVAS_RECT);

    expect(viewport.value).toStrictEqual(fittedViewport);

    setCanvasRect({ ...CANVAS_RECT, width: CANVAS_RECT.width / 2 });
    await flushPromises();

    expect(viewport.value).toStrictEqual(fittedViewport);
  });

  test("placing a text box from the palette adds a text box", async () => {
    expect.hasAssertions();

    const component = await mountEditor([]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { setCanvasRect } = whiteboardEditorStore;
    await flushPromises();
    setCanvasRect(CANVAS_RECT);
    // The id the palette gives the new text box is fixed, so the element is read back exactly
    const insertedId = crypto.randomUUID();
    const randomUuidSpy = vi.spyOn(crypto, "randomUUID").mockReturnValueOnce(insertedId);
    onTestFinished(() => {
      randomUuidSpy.mockRestore();
    });
    await component.get('button[aria-label="Text box"]').trigger("click");

    expect(whiteboard.value.elements).toStrictEqual([
      { id: insertedId, text: "Text", type: PositionedElementType.Text, width: 160, x: 320, y: 280 },
    ]);
  });

  test("bringing a shape forward draws it above the next element", async () => {
    expect.hasAssertions();

    const component = await mountEditor([createShape(FIRST_SHAPE_ID, 0), createShape(SECOND_SHAPE_ID, 200)]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { selectElement } = whiteboardEditorStore;
    await flushPromises();
    selectElement(FIRST_SHAPE_ID);
    await flushPromises();
    await component.get('button[aria-label="Bring forward"]').trigger("click");

    expect(whiteboard.value.elements.map(({ id }) => id)).toStrictEqual([SECOND_SHAPE_ID, FIRST_SHAPE_ID]);
  });

  test("the first element cannot be sent further back", async () => {
    expect.hasAssertions();

    const component = await mountEditor([createShape(FIRST_SHAPE_ID, 0), createShape(SECOND_SHAPE_ID, 200)]);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { selectElement } = whiteboardEditorStore;
    await flushPromises();
    selectElement(FIRST_SHAPE_ID);
    await flushPromises();

    expect(component.get('button[aria-label="Send backward"]').attributes("disabled")).toBeDefined();
    expect(component.get('button[aria-label="Send to back"]').attributes("disabled")).toBeDefined();
  });
});
