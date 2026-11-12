// @vitest-environment happy-dom
import ResourceWhiteboardElementStickyNote from "@/components/Resource/Whiteboard/ElementStickyNote.vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";
import { DashPattern, PositionedElementType, SketchLevel, StrokeWidth, TextSize } from "vue-block-editor-headless";

describe("resourceWhiteboardElementStickyNote", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("a sticky note takes a fill and text", () => {
    expect.hasAssertions();
    const stickyNote = {
      color: "",
      dashPattern: DashPattern.Solid,
      fill: "#fde68a",
      height: 120,
      id: crypto.randomUUID(),
      sketchLevel: SketchLevel.Artist,
      strokeWidth: StrokeWidth.Medium,
      text: "Review",
      textSize: TextSize.Small,
      type: PositionedElementType.StickyNote,
      width: 160,
      x: 0,
      y: 0,
    } as const;

    const wrapper = mount(ResourceWhiteboardElementStickyNote, { props: { stickyNote } });

    expect(wrapper.find("path").attributes("fill")).toBe(stickyNote.fill);
    expect(wrapper.find("text").text()).toBe(stickyNote.text);
  });
});
