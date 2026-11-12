import type { ImageElement } from "#src/models/ImageElement";
import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { StrokeElement } from "#src/models/StrokeElement";
import type { TextElement } from "#src/models/TextElement";

import { ArrowEndKey } from "#src/models/ArrowEndKey";
import { ArrowheadKind } from "#src/models/ArrowheadKind";
import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { CornerStyle } from "#src/models/CornerStyle";
import { DashPattern } from "#src/models/DashPattern";
import { HorizontalAlignment } from "#src/models/HorizontalAlignment";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { TextSize } from "#src/models/TextSize";
import { getTextWidth } from "#src/services/export/getTextWidth";
import { POSITIONED_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { updatePositionedElementProperty } from "#src/services/updatePositionedElementProperty";
import { describe, expect, test } from "vitest";

describe(updatePositionedElementProperty, () => {
  const POSITIONED_DOCUMENT: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_ARROW] };

  test("setting a shape's fill replaces it and leaves the shape in place", () => {
    expect.hasAssertions();

    const operations = updatePositionedElementProperty(POSITIONED_DOCUMENT, 0, { property: "fill", value: "#fde68a" });
    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, operations);

    expect(editedDocument?.elements).toStrictEqual([{ ...POSITIONED_RECTANGLE, fill: "#fde68a" }, POSITIONED_ARROW]);
  });

  test("setting an image's alt text replaces it, and no other element holds one", () => {
    expect.hasAssertions();

    const image: ImageElement = {
      altText: "",
      fileId: "0".repeat(64),
      height: 50,
      id: crypto.randomUUID(),
      type: PositionedElementType.Image,
      width: 50,
      x: 0,
      y: 0,
    };
    const imageDocument: PositionedDocument = { elements: [image, POSITIONED_RECTANGLE] };
    const operations = updatePositionedElementProperty(imageDocument, 0, {
      property: "altText",
      value: "Quarterly chart",
    });
    const editedDocument = applyPositionedEdit(imageDocument, operations);

    expect(editedDocument?.elements[0]).toStrictEqual({ ...image, altText: "Quarterly chart" });
    expect(
      updatePositionedElementProperty(imageDocument, 1, { property: "altText", value: "Quarterly chart" }),
    ).toStrictEqual([]);
  });

  test("setting an arrow's route replaces its path kind", () => {
    expect.hasAssertions();

    const operations = updatePositionedElementProperty(POSITIONED_DOCUMENT, 1, {
      property: "pathKind",
      value: ArrowPathKind.Curved,
    });
    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, operations);

    expect(editedDocument?.elements[1]).toStrictEqual({ ...POSITIONED_ARROW, pathKind: ArrowPathKind.Curved });
  });

  test("setting an arrowhead adds it to its end only", () => {
    expect.hasAssertions();

    // The start has no arrowhead, so setting one adds it there and leaves the end's triangle alone
    const operations = updatePositionedElementProperty(POSITIONED_DOCUMENT, 1, {
      end: ArrowEndKey.Start,
      property: "arrowhead",
      value: ArrowheadKind.Diamond,
    });
    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, operations);

    expect(editedDocument?.elements[1]).toStrictEqual({
      ...POSITIONED_ARROW,
      start: { ...POSITIONED_ARROW.start, arrowhead: ArrowheadKind.Diamond },
    });
  });

  test("clearing an arrowhead removes it from its end only", () => {
    expect.hasAssertions();

    const operations = updatePositionedElementProperty(POSITIONED_DOCUMENT, 1, {
      end: ArrowEndKey.End,
      property: "arrowhead",
    });
    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, operations);

    expect(editedDocument?.elements[1]).toStrictEqual({
      ...POSITIONED_ARROW,
      end: { point: POSITIONED_ARROW.end.point },
    });
  });

  test("clearing an end that has no arrowhead leaves the document unchanged", () => {
    expect.hasAssertions();

    expect(
      updatePositionedElementProperty(POSITIONED_DOCUMENT, 1, { end: ArrowEndKey.Start, property: "arrowhead" }),
    ).toStrictEqual([]);
  });

  test("a property the element does not hold leaves the document unchanged", () => {
    expect.hasAssertions();

    expect(
      updatePositionedElementProperty(POSITIONED_DOCUMENT, 1, { property: "fill", value: "#fde68a" }),
    ).toStrictEqual([]);
  });

  test("a freehand stroke takes a colour and a width, but no dash pattern", () => {
    expect.hasAssertions();

    const stroke: StrokeElement = {
      color: "",
      id: crypto.randomUUID(),
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      strokeWidth: StrokeWidth.Medium,
      type: PositionedElementType.Stroke,
    };
    const strokeDocument: PositionedDocument = { elements: [stroke] };

    expect(
      updatePositionedElementProperty(strokeDocument, 0, { property: "dashPattern", value: DashPattern.Dashed }),
    ).toStrictEqual([]);
    const editedDocument = applyPositionedEdit(
      strokeDocument,
      updatePositionedElementProperty(strokeDocument, 0, { property: "color", value: "#ff0000" }),
    );

    expect(editedDocument?.elements[0]).toStrictEqual({ ...stroke, color: "#ff0000" });
  });

  test("an ellipse holds no corner setting, so setting one makes no operation", () => {
    expect.hasAssertions();

    const ellipseDocument: PositionedDocument = { elements: [{ ...POSITIONED_RECTANGLE, kind: ShapeKind.Ellipse }] };

    expect(
      updatePositionedElementProperty(ellipseDocument, 0, { property: "cornerStyle", value: CornerStyle.Round }),
    ).toStrictEqual([]);
  });

  test("turning off a text box's wrap sets its width to its widest line", () => {
    expect.hasAssertions();

    const textBox: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      isWrapped: true,
      text: "ab\nabcd",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: 200,
      x: 0,
      y: 0,
    };
    const document: PositionedDocument = { elements: [textBox] };
    const editedDocument = applyPositionedEdit(
      document,
      updatePositionedElementProperty(document, 0, { property: "isWrapped", value: false }),
    );

    expect(editedDocument?.elements).toStrictEqual([
      { ...textBox, isWrapped: false, width: getTextWidth("abcd", TextSize.Small) },
    ]);
  });

  test("returning a text box to a wrapped width keeps the width it has", () => {
    expect.hasAssertions();

    const textBox: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      isWrapped: false,
      text: "ab",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: 200,
      x: 0,
      y: 0,
    };
    const document: PositionedDocument = { elements: [textBox] };
    const editedDocument = applyPositionedEdit(
      document,
      updatePositionedElementProperty(document, 0, { property: "isWrapped", value: true }),
    );

    expect(editedDocument?.elements).toStrictEqual([{ ...textBox, isWrapped: true }]);
  });

  test("a size change on an unwrapped text box sets the width its text takes at that size", () => {
    expect.hasAssertions();

    const textBox: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      isWrapped: false,
      text: "abcd",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: getTextWidth("abcd", TextSize.Small),
      x: 0,
      y: 0,
    };
    const document: PositionedDocument = { elements: [textBox] };
    const editedDocument = applyPositionedEdit(
      document,
      updatePositionedElementProperty(document, 0, { property: "textSize", value: TextSize.ExtraLarge }),
    );

    expect(editedDocument?.elements).toStrictEqual([
      { ...textBox, textSize: TextSize.ExtraLarge, width: getTextWidth("abcd", TextSize.ExtraLarge) },
    ]);
  });

  test("a wrap is held by a text box alone", () => {
    expect.hasAssertions();

    expect(
      updatePositionedElementProperty(POSITIONED_DOCUMENT, 0, { property: "isWrapped", value: false }),
    ).toStrictEqual([]);
  });

  test("setting an alignment a text box has not set adds it, and a later one replaces it", () => {
    expect.hasAssertions();

    const textBox: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      isWrapped: true,
      text: "ab",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: 200,
      x: 0,
      y: 0,
    };
    const document: PositionedDocument = { elements: [textBox] };
    const alignedDocument = applyPositionedEdit(
      document,
      updatePositionedElementProperty(document, 0, {
        property: "horizontalAlignment",
        value: HorizontalAlignment.Right,
      }),
    );
    const realignedDocument = applyPositionedEdit(
      alignedDocument ?? document,
      updatePositionedElementProperty(alignedDocument ?? document, 0, {
        property: "horizontalAlignment",
        value: HorizontalAlignment.Center,
      }),
    );

    expect(alignedDocument?.elements).toStrictEqual([{ ...textBox, horizontalAlignment: HorizontalAlignment.Right }]);
    expect(realignedDocument?.elements).toStrictEqual([
      { ...textBox, horizontalAlignment: HorizontalAlignment.Center },
    ]);
  });
});
