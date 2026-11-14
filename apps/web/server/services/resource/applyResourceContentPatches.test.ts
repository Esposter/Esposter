import type { JsonPatchOperation } from "@esposter/shared";
import type { ArrowElement, ShapeElement } from "vue-block-editor-headless";

import { applyResourceContentPatches } from "#server/services/resource/applyResourceContentPatches";
import { requireAgentWritableOperations } from "#server/services/resource/requireAgentWritableOperations";
import { ResourceType } from "@esposter/db-schema";
import { JsonPatchOperationType } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import {
  ArrowheadKind,
  ArrowPathKind,
  CornerStyle,
  DashPattern,
  PositionedElementType,
  ShapeKind,
  SketchLevel,
  StrokeWidth,
  TextSize,
} from "vue-block-editor-headless";

describe(applyResourceContentPatches, () => {
  const rectangleId = v7();
  const rectangle: ShapeElement = {
    color: "",
    cornerStyle: CornerStyle.Sharp,
    dashPattern: DashPattern.Solid,
    fill: "#ffffff",
    height: 100,
    id: rectangleId,
    kind: ShapeKind.Rectangle,
    sketchLevel: SketchLevel.Artist,
    strokeWidth: StrokeWidth.Medium,
    text: "",
    textSize: TextSize.Small,
    type: PositionedElementType.Shape,
    width: 100,
    x: 0,
    y: 0,
  };
  // An arrow bound at its start to the rectangle's bottom point, free at its end
  const arrow: ArrowElement = {
    color: "",
    dashPattern: DashPattern.Solid,
    end: { arrowhead: ArrowheadKind.Triangle, point: { x: 150, y: 250 } },
    id: v7(),
    label: "",
    pathKind: ArrowPathKind.Straight,
    sketchLevel: SketchLevel.Artist,
    start: { binding: { connectionPointIndex: 2, elementId: rectangleId }, point: { x: 50, y: 100 } },
    strokeWidth: StrokeWidth.Medium,
    textSize: TextSize.Small,
    type: PositionedElementType.Arrow,
  };

  test("an agent adds an arrow bound to a shape by patch", () => {
    expect.hasAssertions();

    const operations: JsonPatchOperation[] = [{ op: JsonPatchOperationType.Add, path: "/elements/-", value: arrow }];
    requireAgentWritableOperations(ResourceType.Whiteboard, operations);
    const { document } = applyResourceContentPatches(ResourceType.Whiteboard, { elements: [rectangle] }, operations);

    expect(document).toStrictEqual({ elements: [rectangle, arrow] });
  });

  test("a patch leaving a dangling binding is refused", () => {
    expect.hasAssertions();

    const operations: JsonPatchOperation[] = [
      { op: JsonPatchOperationType.Replace, path: "/elements/1/start/binding/elementId", value: v7() },
    ];

    expect(() => applyResourceContentPatches(ResourceType.Whiteboard, { elements: [rectangle, arrow] }, operations))
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: ✖ binds no connection point of a shape in the document
        → at elements[1].start.binding]
    `);
  });

  test("a patch naming an unknown arrowhead is refused", () => {
    expect.hasAssertions();

    // The arrowhead is one of the four kinds, so a fifth name fails the parse, and the refused patch leaves no document to save
    const operations: JsonPatchOperation[] = [
      { op: JsonPatchOperationType.Replace, path: "/elements/1/end/arrowhead", value: "star" },
    ];

    expect(() => applyResourceContentPatches(ResourceType.Whiteboard, { elements: [rectangle, arrow] }, operations))
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: ✖ Invalid option: expected one of "bar"|"circle"|"diamond"|"triangle"
        → at elements[1].end.arrowhead]
    `);
  });

  test("an arrow end's connection point is read-only to an agent", () => {
    expect.hasAssertions();

    const operations: JsonPatchOperation[] = [
      { op: JsonPatchOperationType.Replace, path: "/elements/1/start/point/x", value: 0 },
    ];

    expect(() => {
      requireAgentWritableOperations(ResourceType.Whiteboard, operations);
    }).toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: /elements/1/start/point/x, the path is read-only or undescribed]`,
    );
  });
});
