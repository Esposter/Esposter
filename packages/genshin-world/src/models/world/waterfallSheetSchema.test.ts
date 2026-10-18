import { waterfallSheetSchema } from "#src/models/world/waterfallSheetSchema";
import { describe, expect, test } from "vitest";

describe(waterfallSheetSchema, () => {
  test("reads a sheet whose across is a unit direction and refuses one whose across is none", () => {
    expect.hasAssertions();

    const sheet = { across: { x: 0.6, y: 0, z: 0.8 }, drop: 3, lip: { x: 1, y: 2, z: 3 }, width: 4 };

    expect({
      accepted: waterfallSheetSchema.safeParse(sheet).success,
      refused: waterfallSheetSchema.safeParse({ ...sheet, across: { x: 0, y: 0, z: 0 } }).success,
    }).toStrictEqual({ accepted: true, refused: false });
  });
});
