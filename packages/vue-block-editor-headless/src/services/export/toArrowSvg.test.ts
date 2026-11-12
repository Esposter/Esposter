import type { ArrowElement } from "#src/models/ArrowElement";

import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { DashPattern } from "#src/models/DashPattern";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { SketchLevel } from "#src/models/SketchLevel";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { toArrowSvg } from "#src/services/export/toArrowSvg";
import { describe, expect, test } from "vitest";

describe(toArrowSvg, () => {
  test("an arrow route is drawn straight at the architect level", () => {
    expect.hasAssertions();

    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      end: { hasArrowhead: true, point: { x: 100, y: 0 } },
      id: crypto.randomUUID(),
      label: "",
      pathKind: ArrowPathKind.Straight,
      sketchLevel: SketchLevel.Architect,
      start: { hasArrowhead: false, point: { x: 0, y: 0 } },
      strokeWidth: StrokeWidth.Medium,
      type: PositionedElementType.Arrow,
    };

    expect(/<path d="(?<route>[^"]*)"/u.exec(toArrowSvg(arrow))?.groups?.route).toBe("M0 0 L100 0");
  });
});
