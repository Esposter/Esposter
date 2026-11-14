// @vitest-environment happy-dom
import ResourceWhiteboardEditorTextEdit from "@/components/Resource/Whiteboard/EditorTextEdit.vue";
import { WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";
import { HorizontalAlignment, PositionedElementType, TextSize } from "vue-block-editor-headless";

describe("resourceWhiteboardEditorTextEdit", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("the editor is set over the shape's text at its size, scaled with the zoom, centred on the shape's middle", () => {
    expect.hasAssertions();

    const whiteboardEditorStore = useWhiteboardEditorStore();
    const { viewport } = storeToRefs(whiteboardEditorStore);
    viewport.value = { scale: 2, x: 0, y: 0 };
    const shape = { ...WHITEBOARD_PROCESS, textSize: TextSize.Large };
    const { element } = mount(ResourceWhiteboardEditorTextEdit, { props: { element: shape, modelValue: "a" } }).get(
      "textarea",
    );

    expect(element.style.fontSize).toBe(`${TextSize.Large * 2}px`);
    expect(element.style.textAlign).toBe("center");
    expect(element.style.transform).toBe("translate(-50%, -50%)");
    expect(element.style.left).toBe(`${(shape.x + shape.width / 2) * 2}px`);
  });

  test("an unwrapped text box's editor sizes itself by its text and hangs from its left edge", () => {
    expect.hasAssertions();

    const textBox = {
      color: "",
      horizontalAlignment: HorizontalAlignment.Left,
      id: v7(),
      isWrapped: false,
      text: "",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: 10,
      x: 5,
      y: 5,
    } as const;
    const { element } = mount(ResourceWhiteboardEditorTextEdit, { props: { element: textBox, modelValue: "a b" } }).get(
      "textarea",
    );

    expect(element.style.width).toBe("");
    expect(element.style.whiteSpace).toBe("pre");
    expect(element.style.textAlign).toBe("left");
    expect(element.style.transform).toBe("translate(0, 0)");
  });
});
