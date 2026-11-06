// @vitest-environment happy-dom
import ResourceWhiteboardLabel from "@/components/Resource/Whiteboard/Label.vue";
import { mount } from "@vue/test-utils";
import { PositionedElementType, ShapeKind, toElementTextSvg } from "vue-block-editor-headless";
import { describe, expect, test } from "vitest";

describe("resourceWhiteboardLabel", () => {
  test("the editor draws a label's lines where the export breaks them", () => {
    expect.hasAssertions();
    const shape = {
      fill: "#ffffff",
      height: 100,
      id: crypto.randomUUID(),
      kind: ShapeKind.Process,
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
});
