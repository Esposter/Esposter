import { GridDirectionToDirectionMap } from "@/services/dungeons/direction/GridDirectionToDirectionMap";
import { Direction as GridDirection } from "grid-engine";
import { describe, expect, test } from "vitest";

describe("gridDirectionToDirectionMap", () => {
  test("maps each grid-engine direction to the member with the same value", () => {
    expect.hasAssertions();

    for (const gridDirection of Object.values(GridDirection))
      expect(GridDirectionToDirectionMap[gridDirection]).toBe(gridDirection);
  });
});
