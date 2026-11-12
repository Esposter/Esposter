import type { JsonPatchOperation } from "@esposter/shared";
import type { ArrowElement, ShapeElement } from "vue-block-editor-headless";

import { applyResourceContentPatches } from "#server/services/resource/applyResourceContentPatches";
import { requireAgentWritableOperations } from "#server/services/resource/requireAgentWritableOperations";
import { ResourceType } from "@esposter/db-schema";
import { JsonPatchOperationType } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { ArrowPathKind, DashPattern, PositionedElementType, ShapeKind, StrokeWidth } from "vue-block-editor-headless";

describe(applyResourceContentPatches, () => {
  const rectangleId = crypto.randomUUID();
  const rectangle: ShapeElement = {
    color: "",
    dashPattern: DashPattern.Solid,
    fill: "#ffffff",
    height: 100,
    id: rectangleId,
    kind: ShapeKind.Rectangle,
    strokeWidth: StrokeWidth.Medium,
    text: "",
    type: PositionedElementType.Shape,
    width: 100,
    x: 0,
    y: 0,
  };
  // An arrow bound at its start to the rectangle's bottom point, free at its end
  const arrow: ArrowElement = {
    color: "",
    dashPattern: DashPattern.Solid,
    end: { hasArrowhead: true, point: { x: 150, y: 250 } },
    id: crypto.randomUUID(),
    label: "",
    pathKind: ArrowPathKind.Straight,
    start: {
      binding: { connectionPointIndex: 2, elementId: rectangleId },
      hasArrowhead: false,
      point: { x: 50, y: 100 },
    },
    strokeWidth: StrokeWidth.Medium,
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
      { op: JsonPatchOperationType.Replace, path: "/elements/1/start/binding/elementId", value: crypto.randomUUID() },
    ];

    expect(() => applyResourceContentPatches(ResourceType.Whiteboard, { elements: [rectangle, arrow] }, operations))
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: ✖ binds no connection point of a shape in the document
        → at elements[1].start.binding]
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
