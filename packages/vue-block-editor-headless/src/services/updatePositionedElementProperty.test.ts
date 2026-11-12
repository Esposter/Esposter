import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { StrokeElement } from "#src/models/StrokeElement";

import { ArrowEndKey } from "#src/models/ArrowEndKey";
import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { DashPattern } from "#src/models/DashPattern";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { StrokeWidth } from "#src/models/StrokeWidth";
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

  test("setting an arrow's route replaces its path kind", () => {
    expect.hasAssertions();

    const operations = updatePositionedElementProperty(POSITIONED_DOCUMENT, 1, {
      property: "pathKind",
      value: ArrowPathKind.Curved,
    });
    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, operations);

    expect(editedDocument?.elements[1]).toStrictEqual({ ...POSITIONED_ARROW, pathKind: ArrowPathKind.Curved });
  });

  test("setting an arrowhead replaces the flag at its end only", () => {
    expect.hasAssertions();

    const operations = updatePositionedElementProperty(POSITIONED_DOCUMENT, 1, {
      end: ArrowEndKey.End,
      property: "hasArrowhead",
      value: false,
    });
    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, operations);

    expect(editedDocument?.elements[1]).toStrictEqual({
      ...POSITIONED_ARROW,
      end: { ...POSITIONED_ARROW.end, hasArrowhead: false },
    });
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
});
