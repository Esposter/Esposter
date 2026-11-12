import { whiteboardResourceSchema } from "#shared/models/resource/whiteboard/WhiteboardResource";
import { describe, expect, test } from "vitest";

describe("whiteboardResourceSchema", () => {
  test("a stored arrow end still holding the old arrowhead flag fails the parse, so the stored flag is rewritten before it is read", () => {
    expect.hasAssertions();

    const arrow = {
      color: "",
      dashPattern: "solid",
      end: { hasArrowhead: true, point: { x: 100, y: 0 } },
      id: crypto.randomUUID(),
      label: "",
      pathKind: "straight",
      sketchLevel: "artist",
      start: { point: { x: 0, y: 0 } },
      strokeWidth: 2,
      textSize: 16,
      type: "arrow",
    };

    expect(whiteboardResourceSchema.safeParse({ elements: [arrow] }).success).toBe(false);
  });
});
