import type { ArrowElement } from "vue-block-editor-headless";

import { getFreeEndHandleItems } from "@/services/whiteboard/gesture/getFreeEndHandleItems";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import {
  ArrowEndKey,
  ArrowPathKind,
  DashPattern,
  PositionedElementType,
  SketchLevel,
  StrokeWidth,
  TextSize,
} from "vue-block-editor-headless";

describe(getFreeEndHandleItems, () => {
  const ARROW_ID = v7();
  const createArrow = (start: ArrowElement["start"], end: ArrowElement["end"]): ArrowElement => ({
    color: "",
    dashPattern: DashPattern.Solid,
    end,
    id: ARROW_ID,
    label: "",
    pathKind: ArrowPathKind.Straight,
    sketchLevel: SketchLevel.Artist,
    start,
    strokeWidth: StrokeWidth.Medium,
    textSize: TextSize.Small,
    type: PositionedElementType.Arrow,
  });

  test("a selected arrow shows a handle on each end that is free", () => {
    expect.hasAssertions();

    const arrow = createArrow({ point: { x: 0, y: 0 } }, { point: { x: 100, y: 0 } });
    const items = getFreeEndHandleItems({ elements: [arrow] }, [ARROW_ID]);

    expect(items.map(({ endKey }) => endKey)).toStrictEqual([ArrowEndKey.Start, ArrowEndKey.End]);
  });

  test("a bound end shows no handle", () => {
    expect.hasAssertions();

    const arrow = createArrow(
      { binding: { connectionPointIndex: 2, elementId: v7() }, point: { x: 0, y: 0 } },
      { point: { x: 100, y: 0 } },
    );
    const items = getFreeEndHandleItems({ elements: [arrow] }, [ARROW_ID]);

    expect(items.map(({ endKey }) => endKey)).toStrictEqual([ArrowEndKey.End]);
  });
});
