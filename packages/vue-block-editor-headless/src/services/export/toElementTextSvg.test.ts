import type { ShapeElement } from "#src/models/ShapeElement";
import type { TextElement } from "#src/models/TextElement";

import { HorizontalAlignment } from "#src/models/HorizontalAlignment";
import { positionedElementSchema } from "#src/models/PositionedElement";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { TextSize } from "#src/models/TextSize";
import { VerticalAlignment } from "#src/models/VerticalAlignment";
import { getTextWidth } from "#src/services/export/getTextWidth";
import { toElementTextSvg } from "#src/services/export/toElementTextSvg";
import { POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { describe, expect, test } from "vitest";

// The lines an export writes for a text, each one the text of a tspan
const readLines = (svg: string): string[] =>
  Array.from(svg.matchAll(/<tspan[^>]*>(?<line>[^<]*)<\/tspan>/gu), ({ groups }) => groups?.line ?? "");
// An attribute of the text element an export writes, and not of one of its tspans
const readTextAttribute = (svg: string, name: string): string | undefined =>
  new RegExp(`<text\\b[^>]*\\s${name}="([^"]*)"`, "u").exec(svg)?.[1];

describe(toElementTextSvg, () => {
  test("a larger size draws and wraps the text larger", () => {
    expect.hasAssertions();

    // Two narrow characters at the smallest size fit a line of this width, but only one at the largest
    const shape: ShapeElement = {
      ...POSITIONED_RECTANGLE,
      text: "a b c d",
      width: getTextWidth("a b", TextSize.Small),
    };
    const smallestLines = readLines(toElementTextSvg(shape));
    const largestSvg = toElementTextSvg({ ...shape, textSize: TextSize.ExtraLarge });

    expect(smallestLines).toStrictEqual(["a b", "c d"]);
    expect(readTextAttribute(largestSvg, "font-size")).toBe(`${TextSize.ExtraLarge}`);
    expect(readLines(largestSvg)).toStrictEqual(["a", "b", "c", "d"]);
  });

  test("text draws at the smallest size until a size is chosen", () => {
    expect.hasAssertions();

    // A stored shape with no size reads the smallest, the size its text drew at before a size could be chosen
    const storedShape = positionedElementSchema.parse({
      fill: "#ffffff",
      height: 100,
      id: crypto.randomUUID(),
      kind: ShapeKind.Rectangle,
      text: "Review",
      type: PositionedElementType.Shape,
      width: 100,
      x: 0,
      y: 0,
    });

    expect(readTextAttribute(toElementTextSvg(storedShape), "font-size")).toBe(`${TextSize.Small}`);
  });

  test("shape text aligns to the left and the top", () => {
    expect.hasAssertions();

    const shape: ShapeElement = {
      ...POSITIONED_RECTANGLE,
      horizontalAlignment: HorizontalAlignment.Left,
      text: "Review",
      verticalAlignment: VerticalAlignment.Top,
    };
    const svg = toElementTextSvg(shape);

    expect(readTextAttribute(svg, "text-anchor")).toBe("start");
    expect(readTextAttribute(svg, "x")).toBe("0");
    // The first baseline sits a size below the top edge, where a line of text starts
    expect(readTextAttribute(svg, "y")).toBe(`${TextSize.Small}`);
  });

  test("shape text aligns to the bottom", () => {
    expect.hasAssertions();

    const middleY = readTextAttribute(toElementTextSvg({ ...POSITIONED_RECTANGLE, text: "Review" }), "y");
    const bottomY = readTextAttribute(
      toElementTextSvg({ ...POSITIONED_RECTANGLE, text: "Review", verticalAlignment: VerticalAlignment.Bottom }),
      "y",
    );

    expect(Number(bottomY)).toBeGreaterThan(Number(middleY));
  });

  test("text box text aligns to the right", () => {
    expect.hasAssertions();

    const text: TextElement = {
      color: "",
      horizontalAlignment: HorizontalAlignment.Right,
      id: crypto.randomUUID(),
      isWrapped: true,
      text: "Review",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: 100,
      x: 200,
      y: 0,
    };
    const svg = toElementTextSvg(text);

    expect(readTextAttribute(svg, "text-anchor")).toBe("end");
    // The text ends at the box's right edge, which is its left edge plus its width
    expect(readTextAttribute(svg, "x")).toBe("300");
  });

  test("shape text is centred until an alignment is chosen", () => {
    expect.hasAssertions();

    const svg = toElementTextSvg({ ...POSITIONED_RECTANGLE, text: "Review" });

    expect(readTextAttribute(svg, "text-anchor")).toBe("middle");
    expect(readTextAttribute(svg, "x")).toBe("50");
  });

  test("a long label wraps inside its shape", () => {
    expect.hasAssertions();

    const lines = readLines(toElementTextSvg({ ...POSITIONED_RECTANGLE, text: "a long label that must wrap" }));

    expect(lines.length).toBeGreaterThan(1);
    expect(Math.max(...lines.map((line) => getTextWidth(line, TextSize.Small)))).toBeLessThanOrEqual(
      POSITIONED_RECTANGLE.width,
    );
  });

  test("an unwrapped text box breaks its text only at its newlines", () => {
    expect.hasAssertions();

    const text: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      isWrapped: false,
      text: "a b c d\ne f",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: getTextWidth("a b", TextSize.Small),
      x: 0,
      y: 0,
    };

    expect(readLines(toElementTextSvg(text))).toStrictEqual(["a b c d", "e f"]);
  });
});
