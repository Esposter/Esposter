// @vitest-environment happy-dom
import ResourceWhiteboardElementStickyNote from "@/components/Resource/Whiteboard/ElementStickyNote.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { PositionedElementType } from "vue-block-editor-headless";

describe("resourceWhiteboardElementStickyNote", () => {
  test("a sticky note takes a fill and text", () => {
    expect.hasAssertions();
    const stickyNote = {
      fill: "#fde68a",
      height: 120,
      id: crypto.randomUUID(),
      text: "Review",
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
