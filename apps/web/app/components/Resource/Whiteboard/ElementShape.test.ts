// @vitest-environment happy-dom
import ResourceWhiteboardElementShape from "@/components/Resource/Whiteboard/ElementShape.vue";
import { mount } from "@vue/test-utils";
import { PositionedElementType, ShapeKind, toShapeSvg } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe("resourceWhiteboardElementShape", () => {
  test("a shape draws the same hand-drawn outline on every render", () => {
    expect.hasAssertions();
    const shape = {
      fill: "#ffffff",
      height: 80,
      id: crypto.randomUUID(),
      kind: ShapeKind.Process,
      text: "",
      type: PositionedElementType.Shape,
      width: 120,
      x: 0,
      y: 0,
    } as const;
    const renderOutline = () =>
      mount(ResourceWhiteboardElementShape, { props: { shape } }).find("path").attributes("d");

    const firstOutline = renderOutline();
    const secondOutline = renderOutline();
    const exportedOutline = /<path d="(?<outline>[^"]*)"/u.exec(toShapeSvg(shape))?.groups?.outline;

    expect(secondOutline).toBe(firstOutline);
    expect(firstOutline).toBe(exportedOutline);
  });
});
