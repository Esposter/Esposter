import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { StickyNoteElement } from "#src/models/StickyNoteElement";
import type { StrokeElement } from "#src/models/StrokeElement";

import { DashPattern } from "#src/models/DashPattern";
import { HorizontalAlignment } from "#src/models/HorizontalAlignment";
import { positionedDocumentSchema } from "#src/models/PositionedDocument";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { SketchLevel } from "#src/models/SketchLevel";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { TextSize } from "#src/models/TextSize";
import { POSITIONED_FREE_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { JsonPatchOperationType } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const POSITIONED_STROKE: StrokeElement = {
  color: "",
  id: crypto.randomUUID(),
  points: [
    { x: 0, y: 0 },
    { x: 50, y: 50 },
  ],
  strokeWidth: StrokeWidth.Medium,
  type: PositionedElementType.Stroke,
};

describe("positionedDocumentSchema", () => {
  const POSITIONED_DOCUMENT: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_STROKE] };

  test("a document of typed elements parses back unchanged", () => {
    expect.hasAssertions();

    const stickyNoteId = crypto.randomUUID();
    const stickyNote: StickyNoteElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      fill: "#000000",
      height: 80,
      id: stickyNoteId,
      sketchLevel: SketchLevel.Artist,
      strokeWidth: StrokeWidth.Medium,
      text: "",
      textSize: TextSize.Small,
      type: PositionedElementType.StickyNote,
      width: 80,
      x: 300,
      y: 0,
    };
    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_FREE_ARROW, stickyNote] };
    const parsedDocument = positionedDocumentSchema.parse(document);

    expect(parsedDocument).toStrictEqual(document);
  });

  test("a repeated element id is refused", () => {
    expect.hasAssertions();

    const { error } = positionedDocumentSchema.safeParse({
      elements: [POSITIONED_RECTANGLE, { ...POSITIONED_RECTANGLE, kind: ShapeKind.Process }],
    });

    expect(error?.issues.map(({ path }) => path)).toStrictEqual([["elements", 1, "id"]]);
  });

  // An agent's patch names the element by its index and the property by its path, so each refusal is a patch the schema rejects
  test("a colour that is not a hex colour is refused", () => {
    expect.hasAssertions();

    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Replace, path: "/elements/0/color", value: "red" },
    ]);

    expect(editedDocument).toBeUndefined();
  });

  test("a width that is not one of the three is refused", () => {
    expect.hasAssertions();

    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Replace, path: "/elements/1/strokeWidth", value: 3 },
    ]);

    expect(editedDocument).toBeUndefined();
  });

  test("a dash pattern that is not one of the three is refused", () => {
    expect.hasAssertions();

    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Replace, path: "/elements/0/dashPattern", value: "wavy" },
    ]);

    expect(editedDocument).toBeUndefined();
  });

  test("a sketch level that is not one of the three is refused", () => {
    expect.hasAssertions();

    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Replace, path: "/elements/0/sketchLevel", value: "wobbly" },
    ]);

    expect(editedDocument).toBeUndefined();
  });

  test("a corner setting that is not sharp or round is refused", () => {
    expect.hasAssertions();

    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Replace, path: "/elements/0/cornerStyle", value: "pointed" },
    ]);

    expect(editedDocument).toBeUndefined();
  });

  test("a text size that is not one of the four is refused", () => {
    expect.hasAssertions();

    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Replace, path: "/elements/0/textSize", value: 17 },
    ]);
    // One of the four sizes passes the same check, so the refusal is the value and not the path
    const sizedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Replace, path: "/elements/0/textSize", value: TextSize.Large },
    ]);

    expect(editedDocument).toBeUndefined();
    expect(sizedDocument?.elements[0]).toStrictEqual({ ...POSITIONED_RECTANGLE, textSize: TextSize.Large });
  });

  test("an alignment that is not one of the choices is refused", () => {
    expect.hasAssertions();

    const editedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Add, path: "/elements/0/horizontalAlignment", value: "justify" },
    ]);
    // One of the choices passes the same check, so the refusal is the value and not the path
    const alignedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Add, path: "/elements/0/horizontalAlignment", value: HorizontalAlignment.Right },
    ]);

    expect(editedDocument).toBeUndefined();
    expect(alignedDocument?.elements[0]).toStrictEqual({
      ...POSITIONED_RECTANGLE,
      horizontalAlignment: HorizontalAlignment.Right,
    });
  });

  test("a fill that is neither a hex colour nor empty is refused", () => {
    expect.hasAssertions();

    const refusedDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Replace, path: "/elements/0/fill", value: "blue" },
    ]);
    // An empty fill is the one non-hex value a shape takes, the no fill it starts with
    const emptyFillDocument = applyPositionedEdit(POSITIONED_DOCUMENT, [
      { op: JsonPatchOperationType.Replace, path: "/elements/0/fill", value: "" },
    ]);

    expect(refusedDocument).toBeUndefined();
    expect(emptyFillDocument?.elements[0]).toStrictEqual({ ...POSITIONED_RECTANGLE, fill: "" });
  });

  test("a stored element without the new fields reads the defaults it draws at today", () => {
    expect.hasAssertions();

    const { elements } = positionedDocumentSchema.parse({
      elements: [
        {
          fill: "#ffffff",
          height: 100,
          id: POSITIONED_RECTANGLE.id,
          kind: ShapeKind.Rectangle,
          text: "",
          type: PositionedElementType.Shape,
          width: 100,
          x: 0,
          y: 0,
        },
      ],
    });

    expect(elements).toStrictEqual([POSITIONED_RECTANGLE]);
  });
});
