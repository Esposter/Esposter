// @vitest-environment happy-dom
import type { ArrowElement } from "vue-block-editor-headless";

import ResourceWhiteboardElementArrow from "@/components/Resource/Whiteboard/ElementArrow.vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";
import {
  ArrowPathKind,
  DashPattern,
  PositionedElementType,
  STROKE_GAP_LENGTH,
  StrokeWidth,
} from "vue-block-editor-headless";

describe("resourceWhiteboardElementArrow", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const arrow: ArrowElement = {
    color: "",
    dashPattern: DashPattern.Solid,
    end: { hasArrowhead: true, point: { x: 100, y: 0 } },
    id: crypto.randomUUID(),
    label: "",
    pathKind: ArrowPathKind.Straight,
    start: { hasArrowhead: false, point: { x: 0, y: 0 } },
    strokeWidth: StrokeWidth.Medium,
    type: PositionedElementType.Arrow,
  };

  test("a new arrow draws at medium width", () => {
    expect.hasAssertions();

    const component = mount(ResourceWhiteboardElementArrow, { props: { arrow } });

    expect(component.find("path").attributes("stroke-width")).toBe(`${StrokeWidth.Medium}`);
  });

  test("an arrow route draws dotted when the owner chooses dotted", () => {
    expect.hasAssertions();

    const component = mount(ResourceWhiteboardElementArrow, {
      props: { arrow: { ...arrow, dashPattern: DashPattern.Dotted } },
    });

    expect(component.find("path").attributes("stroke-dasharray")).toBe(`0 ${STROKE_GAP_LENGTH}`);
    expect(component.find("path").attributes("stroke-linecap")).toBe("round");
    // The arrowhead is a filled polygon, which no dash pattern reaches
    expect(component.find("polygon").attributes("stroke-dasharray")).toBeUndefined();
    expect(component.find("polygon").attributes("fill")).toBe("currentColor");
  });
});
