import type { Seelie } from "#src/models/puzzle/Seelie";
import type { GroundPoint } from "genshin-engine";

// Where a Seelie stands on its route: its start moved toward its court by its progress along the route
export const computeSeeliePosition = ({ court, progress, start }: Seelie): GroundPoint => ({
  x: start.x + (court.x - start.x) * progress,
  z: start.z + (court.z - start.z) * progress,
});
