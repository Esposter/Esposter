// @vitest-environment happy-dom
import type { StrokeElement } from "vue-block-editor-headless";

import ResourceWhiteboardElementStroke from "@/components/Resource/Whiteboard/ElementStroke.vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";
import { PositionedElementType, StrokeWidth } from "vue-block-editor-headless";

describe("resourceWhiteboardElementStroke", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // A stroke with a quick turn at its middle point, which a polyline would draw as a corner
  const stroke: StrokeElement = {
    color: "",
    id: crypto.randomUUID(),
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ],
    strokeWidth: StrokeWidth.Medium,
    type: PositionedElementType.Stroke,
  };

  test("a freehand stroke draws smoothed", () => {
    expect.hasAssertions();

    const component = mount(ResourceWhiteboardElementStroke, { props: { stroke } });

    expect(component.find("path").attributes("d")).toBe("M0 0 Q100 0 100 50 L100 100");
  });
});
