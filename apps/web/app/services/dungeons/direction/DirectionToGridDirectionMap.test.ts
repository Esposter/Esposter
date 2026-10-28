import { Direction } from "#shared/models/dungeons/data/player/Direction";
import { DirectionToGridDirectionMap } from "@/services/dungeons/direction/DirectionToGridDirectionMap";
import { describe, expect, test } from "vitest";

describe("directionToGridDirectionMap", () => {
  test("maps each direction to grid-engine's member with the same value", () => {
    expect.hasAssertions();

    for (const direction of Object.values(Direction)) expect(DirectionToGridDirectionMap[direction]).toBe(direction);
  });
});
