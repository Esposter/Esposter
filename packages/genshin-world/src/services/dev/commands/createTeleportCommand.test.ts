import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

import { createTeleportCommand } from "#src/services/dev/commands/createTeleportCommand";
import { DEV_CATALOGUE, DEV_LANDMARK } from "#src/services/dev/constants.test";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { describe, expect, test, vi } from "vitest";

describe(createTeleportCommand, () => {
  test("jumps to the landmark a place is named after, at the pose the map's jump lands at", () => {
    expect.hasAssertions();

    const jumpTo = vi.fn<(pose: WorldJumpPose) => void>();
    const result = createTeleportCommand({ catalogue: DEV_CATALOGUE, getLandmarks: () => [DEV_LANDMARK], jumpTo }).run({
      place: "Windrise",
    });

    expect({ result }).toStrictEqual({ result: { ok: true, value: "Windrise" } });
    expect(jumpTo).toHaveBeenCalledExactlyOnceWith(computeJumpPose(DEV_LANDMARK));
  });

  test("jumps to the coordinates the line gives, standing at their height above the ground", () => {
    expect.hasAssertions();

    const jumpTo = vi.fn<(pose: WorldJumpPose) => void>();
    const result = createTeleportCommand({ catalogue: DEV_CATALOGUE, getLandmarks: () => [], jumpTo }).run({
      depth: "-30",
      height: "4",
      place: "120",
    });

    expect({ result }).toStrictEqual({ result: { ok: true, value: "120 4 -30" } });
    expect(jumpTo).toHaveBeenCalledExactlyOnceWith({ heightOffset: 4, point: { x: 120, z: -30 }, yaw: 0 });
  });

  test("refuses coordinates that are incomplete or not numbers, and jumps nowhere", () => {
    expect.hasAssertions();

    const jumpTo = vi.fn<(pose: WorldJumpPose) => void>();
    const command = createTeleportCommand({ catalogue: DEV_CATALOGUE, getLandmarks: () => [], jumpTo });
    const incomplete = command.run({ height: "4", place: "120" });
    const notNumbers = command.run({ depth: "-30", height: "up", place: "120" });

    expect({ incomplete, notNumbers }).toStrictEqual({
      incomplete: { error: "a teleport to coordinates needs x, height and depth", ok: false },
      notNumbers: { error: "expected numbers for x, height and depth", ok: false },
    });
    expect(jumpTo).not.toHaveBeenCalled();
  });

  test("names no landmark or region the game has, and jumps nowhere", () => {
    expect.hasAssertions();

    const jumpTo = vi.fn<(pose: WorldJumpPose) => void>();
    const result = createTeleportCommand({ catalogue: DEV_CATALOGUE, getLandmarks: () => [DEV_LANDMARK], jumpTo }).run({
      place: "Nowhere",
    });

    expect(result).toStrictEqual({ error: "no landmark or region named Nowhere", ok: false });
    expect(jumpTo).not.toHaveBeenCalled();
  });
});
