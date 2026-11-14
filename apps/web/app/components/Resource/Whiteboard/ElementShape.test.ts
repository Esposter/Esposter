// @vitest-environment happy-dom
import ResourceWhiteboardElementShape from "@/components/Resource/Whiteboard/ElementShape.vue";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";
import {
  CornerStyle,
  DashPattern,
  EXPORT_LINE_COLOR,
  PositionedElementType,
  ShapeKind,
  SketchLevel,
  STROKE_DASH_LENGTH,
  STROKE_GAP_LENGTH,
  StrokeWidth,
  TextSize,
  toShapeSvg,
} from "vue-block-editor-headless";

// The value of an attribute the export writes on the outline, so the canvas can be checked against the export
const readExportAttribute = (svg: string, name: string): string | undefined =>
  new RegExp(`${name}="([^"]*)"`, "u").exec(svg)?.[1];

describe("resourceWhiteboardElementShape", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("a shape draws the same hand-drawn outline on every render", () => {
    expect.hasAssertions();
    const shape = {
      color: "",
      cornerStyle: CornerStyle.Sharp,
      dashPattern: DashPattern.Solid,
      fill: "#ffffff",
      height: 80,
      id: v7(),
      kind: ShapeKind.Process,
      sketchLevel: SketchLevel.Artist,
      strokeWidth: StrokeWidth.Medium,
      text: "",
      textSize: TextSize.Small,
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

  const shape = {
    color: "",
    cornerStyle: CornerStyle.Sharp,
    dashPattern: DashPattern.Solid,
    fill: "",
    height: 80,
    id: v7(),
    kind: ShapeKind.Process,
    sketchLevel: SketchLevel.Artist,
    strokeWidth: StrokeWidth.Medium,
    text: "Review",
    textSize: TextSize.Small,
    type: PositionedElementType.Shape,
    width: 120,
    x: 0,
    y: 0,
  } as const;

  test("a chosen colour draws the outline and the text", () => {
    expect.hasAssertions();

    const component = mount(ResourceWhiteboardElementShape, { props: { shape: { ...shape, color: "#ff0000" } } });

    expect(component.find("path").attributes("stroke")).toBe("#ff0000");
    expect(component.find("text").attributes("fill")).toBe("#ff0000");
  });

  test("an element with no colour draws in the page text colour", () => {
    expect.hasAssertions();

    const component = mount(ResourceWhiteboardElementShape, { props: { shape } });

    expect(component.find("path").attributes("stroke")).toBe("currentColor");
    expect(component.find("text").attributes("fill")).toBe("currentColor");
  });

  test("a shape with no fill draws an open outline", () => {
    expect.hasAssertions();

    const component = mount(ResourceWhiteboardElementShape, { props: { shape } });

    expect(component.find("path").attributes("fill")).toBe("none");
    expect(readExportAttribute(toShapeSvg(shape), "fill")).toBe("none");
  });

  test("an outline with no colour follows the theme on an open shape and is dark on a filled one, as the export draws it", () => {
    expect.hasAssertions();

    const filledShape = { ...shape, fill: "#ffffff" } as const;
    const openComponent = mount(ResourceWhiteboardElementShape, { props: { shape } });
    const filledComponent = mount(ResourceWhiteboardElementShape, { props: { shape: filledShape } });

    expect(openComponent.find("path").attributes("stroke")).toBe("currentColor");
    expect(filledComponent.find("path").attributes("stroke")).toBe(EXPORT_LINE_COLOR);
    expect(readExportAttribute(toShapeSvg(filledShape), "stroke")).toBe(EXPORT_LINE_COLOR);
  });

  test("a dashed outline draws with gaps on the canvas and in the export", () => {
    expect.hasAssertions();

    const dashedShape = { ...shape, dashPattern: DashPattern.Dashed } as const;
    const component = mount(ResourceWhiteboardElementShape, { props: { shape: dashedShape } });

    expect(component.find("path").attributes("stroke-dasharray")).toBe(`${STROKE_DASH_LENGTH} ${STROKE_GAP_LENGTH}`);
    expect(component.find("path").attributes("stroke-dasharray")).toBe(
      readExportAttribute(toShapeSvg(dashedShape), "stroke-dasharray"),
    );
  });

  test("a bold width draws the outline and the export at bold", () => {
    expect.hasAssertions();

    const boldShape = { ...shape, strokeWidth: StrokeWidth.Bold } as const;
    const component = mount(ResourceWhiteboardElementShape, { props: { shape: boldShape } });

    expect(component.find("path").attributes("stroke-width")).toBe(`${StrokeWidth.Bold}`);
    expect(readExportAttribute(toShapeSvg(boldShape), "stroke-width")).toBe(`${StrokeWidth.Bold}`);
  });

  test("architect draws a shape with straight edges", () => {
    expect.hasAssertions();

    const architectShape = { ...shape, sketchLevel: SketchLevel.Architect } as const;
    const component = mount(ResourceWhiteboardElementShape, { props: { shape: architectShape } });

    expect(component.find("path").attributes("d")).toBe("M0 0 L120 0 L120 80 L0 80 Z");
  });

  test("round corners curve the outline", () => {
    expect.hasAssertions();

    const roundShape = { ...shape, cornerStyle: CornerStyle.Round } as const;
    const outline = mount(ResourceWhiteboardElementShape, { props: { shape: roundShape } })
      .find("path")
      .attributes("d");

    expect(outline).toContain("Q");
    expect(outline).toBe(/<path d="(?<outline>[^"]*)"/u.exec(toShapeSvg(roundShape))?.groups?.outline);
  });
});
