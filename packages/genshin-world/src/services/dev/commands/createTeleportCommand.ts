import type { DevCommand } from "#src/models/dev/DevCommand";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

import { findTeleportLandmark } from "#src/services/dev/findTeleportLandmark";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { z } from "zod";

const teleportArgs = z.object({ depth: z.string().optional(), height: z.string().optional(), place: z.string() });

// `teleport <place>` jumps to the landmark the place is named after, at the pose the map's own jump lands at. A place of
// Several words is quoted, as in `teleport "Liyue Harbor"`, and `teleport <x> <height> <depth>` jumps to the coordinates
// Given, the place being x
export const createTeleportCommand = ({
  catalogue,
  getLandmarks,
  jumpTo,
}: {
  catalogue: Catalogue;
  getLandmarks: () => readonly Landmark[];
  jumpTo: (pose: WorldJumpPose) => void;
}): DevCommand<typeof teleportArgs> => ({
  args: teleportArgs,
  argumentNames: ["place", "height", "depth"],
  name: "teleport",
  run: ({ depth, height, place }) => {
    if (height === undefined && depth === undefined) {
      const landmark = findTeleportLandmark(place, catalogue, getLandmarks());
      if (!landmark) return { error: `no landmark or region named ${place}`, ok: false };

      jumpTo(computeJumpPose(landmark));
      return { ok: true, value: place };
    }

    if (height === undefined || depth === undefined)
      return { error: "a teleport to coordinates needs x, height and depth", ok: false };

    const coordinates = { depth: Number(depth), height: Number(height), x: Number(place) };
    if (!Object.values(coordinates).every((value) => Number.isFinite(value)))
      return { error: "expected numbers for x, height and depth", ok: false };

    jumpTo({ heightOffset: coordinates.height, point: { x: coordinates.x, z: coordinates.depth }, yaw: 0 });
    return { ok: true, value: `${coordinates.x} ${coordinates.height} ${coordinates.depth}` };
  },
});
