import { PaletteColor, PaletteColors } from "@/models/agentConsole/PaletteColor";
import { DOOR_CLOSED_BOX } from "@/services/agentConsole/world/constants";
import { createVoxelWorld } from "@/services/agentConsole/world/createVoxelWorld.test";
import { getWorldVoxel } from "@/services/agentConsole/world/getWorldVoxel";
import { stampDoor } from "@/services/agentConsole/world/stampDoor";
import { describe, expect, test } from "vitest";

describe(stampDoor, () => {
  const [x, y, z] = DOOR_CLOSED_BOX.max;

  test("makes the doorway solid while the door is closed, and clears it once it is open", () => {
    expect.hasAssertions();

    const voxelWorld = createVoxelWorld([]);
    stampDoor(voxelWorld, false);
    const closedVoxel = getWorldVoxel(voxelWorld, x, y, z);
    stampDoor(voxelWorld, true);
    const openVoxel = getWorldVoxel(voxelWorld, x, y, z);

    expect(closedVoxel).toBe(PaletteColors.indexOf(PaletteColor.Door) + 1);
    expect(openVoxel).toBe(0);
  });
});
