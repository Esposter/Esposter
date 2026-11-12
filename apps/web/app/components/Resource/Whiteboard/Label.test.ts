// @vitest-environment happy-dom
import ResourceWhiteboardLabel from "@/components/Resource/Whiteboard/Label.vue";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";
import {
  DashPattern,
  PositionedElementType,
  ShapeKind,
  StrokeWidth,
  toElementTextSvg,
} from "vue-block-editor-headless";

describe("resourceWhiteboardLabel", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("the editor draws a label's lines where the export breaks them", () => {
    expect.hasAssertions();
    const shape = {
      color: "",
      dashPattern: DashPattern.Solid,
      fill: "#ffffff",
      height: 100,
      id: crypto.randomUUID(),
      kind: ShapeKind.Process,
      strokeWidth: StrokeWidth.Medium,
      text: "a b c d",
      type: PositionedElementType.Shape,
      width: 24,
      x: 0,
      y: 0,
    } as const;
    const editorLines = mount(ResourceWhiteboardLabel, { props: { element: shape } })
      .findAll("tspan")
      .map((tspan) => tspan.text());
    const exportLines = Array.from(
      toElementTextSvg(shape).matchAll(/<tspan[^>]*>(?<line>[^<]*)<\/tspan>/gu),
      ({ groups }) => groups?.line,
    );

    expect(editorLines).toStrictEqual(["a b", "c d"]);
    expect(editorLines).toStrictEqual(exportLines);
  });

  test("a label is not drawn while its element's text is edited in place, so the editor is the only copy", async () => {
    expect.hasAssertions();
    const shape = {
      color: "",
      dashPattern: DashPattern.Solid,
      fill: "#ffffff",
      height: 100,
      id: crypto.randomUUID(),
      kind: ShapeKind.Process,
      strokeWidth: StrokeWidth.Medium,
      text: "a",
      type: PositionedElementType.Shape,
      width: 100,
      x: 0,
      y: 0,
    } as const;
    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { setTextEditElementId } = whiteboardEditorStore;
    const component = mount(ResourceWhiteboardLabel, { props: { element: shape } });

    expect(component.findAll("text")).toHaveLength(1);

    setTextEditElementId(shape.id);
    await nextTick();

    expect(component.findAll("text")).toHaveLength(0);
  });
});
