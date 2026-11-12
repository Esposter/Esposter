import { arrowEndSchema } from "#src/models/ArrowEnd";
import { describe, expect, test } from "vitest";

describe("arrowEndSchema", () => {
  test("an end still holding the old arrowhead flag fails its parse, so the stored flag is rewritten before it is read", () => {
    expect.hasAssertions();

    expect(arrowEndSchema.safeParse({ hasArrowhead: true, point: { x: 0, y: 0 } }).success).toBe(false);
  });
});
