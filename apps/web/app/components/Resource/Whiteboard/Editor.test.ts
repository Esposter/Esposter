// @vitest-environment nuxt
import type { WhiteboardElement } from "#shared/models/resource/whiteboard/WhiteboardElement";
import type { DOMWrapper, VueWrapper } from "@vue/test-utils";
import type { Except } from "type-fest";
import type { ArrowElement, Point, ShapeElement } from "vue-block-editor-headless";

import { MimeType } from "#shared/models/file/MimeType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceWhiteboardEditor from "@/components/Resource/Whiteboard/Editor.vue";
import ResourceWhiteboardEditorPropertiesArrow from "@/components/Resource/Whiteboard/EditorPropertiesArrow.vue";
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import UiPalette from "@/components/Ui/Palette/Index.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { pressKey, WHITEBOARD_ARROW, WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { getFitViewport } from "@/services/whiteboard/viewport/getFitViewport";
import { useResourceStore } from "@/store/resource";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { ArrowPathKind, getExportBounds, PositionedElementType } from "vue-block-editor-headless";

const { display, uploadResourceFileMock } = vi.hoisted(() => ({
  display: { isCompact: false, isMobile: false },
  uploadResourceFileMock: vi.fn<(file: File) => Promise<string>>(),
}));

// The upload is covered by useUploadResourceFile's own suite, so it is mocked at its seam here, and a paste reaches it
vi.mock(import("@/composables/resource/useUploadResourceFile"), () => ({
  useUploadResourceFile: () => uploadResourceFileMock,
}));
// The editor's size class is read from the display composable, so a test says how small the window is before the editor mounts
vi.mock(import("@/composables/ui/useUiDisplay"), async (importOriginal) => {
  const { useUiDisplay } = await importOriginal();
  return {
    useUiDisplay: () => ({
      ...useUiDisplay(),
      isMobile: shallowRef(display.isMobile),
      xs: shallowRef(display.isCompact),
    }),
  };
});

const createShape = (id: string, x: number): ShapeElement => ({ ...WHITEBOARD_PROCESS, id, x });
// The canvas is the one application-role surface, where every pointer and key of a gesture lands
const getCanvas = (component: VueWrapper) => component.get('[role="application"]');

describe("resourceWhiteboardEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const POINTER_ID = 1;
  const FIRST_SHAPE_ID = crypto.randomUUID();
  const SECOND_SHAPE_ID = crypto.randomUUID();
  // The process shape's bottom point is where a right-angled arrow starts, bound to it, and its far end is free
  const RIGHT_ANGLED_ARROW: ArrowElement = { ...WHITEBOARD_ARROW, pathKind: ArrowPathKind.RightAngled };
  const CANVAS_RECT = { height: 600, width: 800, x: 0, y: 0 };
  // The middle of the canvas, where a click places the element a text tool draws
  const CANVAS_CENTRE: Point = { x: 400, y: 300 };

  beforeEach(async () => {
    display.isCompact = false;
    display.isMobile = false;
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

  test("dragging a shape on the canvas moves it in the editor", async () => {
    expect.hasAssertions();

    const component = await mountEditor([WHITEBOARD_PROCESS]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    await flushPromises();
    await drag(getCanvas(component), { x: 50, y: 50 }, { x: 80, y: 70 });

    expect(whiteboard.value.elements).toStrictEqual([{ ...WHITEBOARD_PROCESS, x: 30, y: 20 }]);
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

  test("the canvas Delete opens the confirmation instead of deleting in the editor", async () => {
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

  test("the Freehand button draws a stroke on the canvas in the editor", async () => {
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

  test("placing a text box with the text tool adds a text box", async () => {
    expect.hasAssertions();

    const component = await mountEditor([]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { setCanvasRect } = whiteboardEditorStore;
    await flushPromises();
    setCanvasRect(CANVAS_RECT);
    // The id the placement gives the new text box is fixed, so the element is read back exactly
    const insertedId = crypto.randomUUID();
    const randomUuidSpy = vi.spyOn(crypto, "randomUUID").mockReturnValueOnce(insertedId);
    onTestFinished(() => {
      randomUuidSpy.mockRestore();
    });
    await component.get('button[aria-label="Text"]').trigger("click");
    await drag(getCanvas(component), CANVAS_CENTRE, CANVAS_CENTRE);

    expect(whiteboard.value.elements).toStrictEqual([
      { id: insertedId, text: "Text", type: PositionedElementType.Text, width: 160, x: 320, y: 280 },
    ]);
  });

  test("every tool is in the top toolbar", async () => {
    expect.hasAssertions();

    const component = await mountEditor([]);
    await flushPromises();
    const toolbar = component.get('[role="toolbar"]');
    const toolTitles = [
      "Select",
      "Hand",
      "Shape",
      "Arrow",
      "Freehand",
      "Text",
      "Sticky note",
      "Image",
      "Lock the tool",
    ];

    expect(toolTitles.filter((title) => toolbar.find(`[aria-label="${title}"]`).exists())).toStrictEqual(toolTitles);
    expect(component.findComponent(UiPalette).exists()).toBe(false);
  });

  test("the image tool opens the file picker", async () => {
    expect.hasAssertions();

    const click = vi.spyOn(HTMLInputElement.prototype, "click");
    onTestFinished(() => {
      click.mockRestore();
    });
    const file = new File(["a"], "a", { type: MimeType.Png });
    // The file's bytes are hashed before the upload, a step a flush does not outlast, so the test awaits the upload itself
    const { promise: isUploaded, resolve: onUploaded } = Promise.withResolvers<void>();
    uploadResourceFileMock.mockImplementationOnce(() => {
      onUploaded();
      return Promise.resolve(" ");
    });
    const component = await mountEditor([]);
    await flushPromises();
    await component.get('[aria-label="Image"]').trigger("click");
    const input = component.get('input[type="file"]');
    Object.defineProperty(input.element, "files", { value: [file] });
    await input.trigger("change");
    await isUploaded;

    expect(click).toHaveBeenCalledTimes(1);
    expect(uploadResourceFileMock).toHaveBeenCalledTimes(1);
  });

  test("undo and redo are buttons beside zoom", async () => {
    expect.hasAssertions();

    const component = await mountEditor([]);
    const whiteboardStore = useWhiteboardStore();
    await flushPromises();
    whiteboardStore.insertElement(WHITEBOARD_PROCESS);
    await flushPromises();
    const view = component.get('[aria-label="View"]');

    expect(view.find('[aria-label="Zoom in"]').exists()).toBe(true);
    expect(view.get('[aria-label="Undo"]').attributes("disabled")).toBeUndefined();
    expect(view.get('[aria-label="Redo"]').attributes("disabled")).toBe("");
  });

  test("a redo restores the undone edit", async () => {
    expect.hasAssertions();

    const component = await mountEditor([]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    await flushPromises();
    whiteboardStore.insertElement(WHITEBOARD_PROCESS);
    await flushPromises();
    await component.get('[aria-label="Undo"]').trigger("click");
    await component.get('[aria-label="Redo"]').trigger("click");

    expect(whiteboard.value.elements).toStrictEqual([WHITEBOARD_PROCESS]);
  });

  test("the panel shows an arrow's route", async () => {
    expect.hasAssertions();

    const component = await mountEditor([WHITEBOARD_PROCESS, WHITEBOARD_ARROW]);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { selectElement } = whiteboardEditorStore;
    await flushPromises();
    selectElement(WHITEBOARD_ARROW.id);
    await flushPromises();

    expect(component.findComponent(ResourceWhiteboardEditorPropertiesArrow).props("arrow")).toStrictEqual(
      WHITEBOARD_ARROW,
    );
  });

  test("the properties panel is absent with nothing selected", async () => {
    expect.hasAssertions();

    const component = await mountEditor([WHITEBOARD_PROCESS]);
    await flushPromises();

    expect(component.find('[aria-label="Properties"]').exists()).toBe(false);
  });

  test("a compact window moves the toolbar to the bottom", async () => {
    expect.hasAssertions();

    display.isCompact = true;
    const component = await mountEditor([]);
    await flushPromises();
    const tools = component.get('[aria-label="Tools"]');
    const canvas = getCanvas(component);

    // A bottom bar is drawn after the canvas and outside it, where a region over the canvas sits inside it
    expect(canvas.element.contains(tools.element)).toBe(false);
    expect(canvas.element.compareDocumentPosition(tools.element) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
  });

  test("the first element cannot be sent further back", async () => {
    expect.hasAssertions();

    const component = await mountEditor([createShape(FIRST_SHAPE_ID, 0), createShape(SECOND_SHAPE_ID, 200)]);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { selectElement } = whiteboardEditorStore;
    await flushPromises();
    selectElement(FIRST_SHAPE_ID);
    await flushPromises();

    expect(component.get('button[aria-label="Send backward"]').attributes("disabled")).toBe("");
    expect(component.get('button[aria-label="Send to back"]').attributes("disabled")).toBe("");
    expect(component.get('button[aria-label="Bring forward"]').attributes("disabled")).toBeUndefined();

    await component.get('button[aria-label="Bring forward"]').trigger("click");

    expect(whiteboard.value.elements.map(({ id }) => id)).toStrictEqual([SECOND_SHAPE_ID, FIRST_SHAPE_ID]);
  });
});
