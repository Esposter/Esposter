import type { GroundPoint } from "genshin-engine";

import { readWindrisePlantPlacements } from "#src/services/genshinAssets/fit/readWindrisePlantPlacements";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toRegionPlace } from "#src/services/genshinAssets/fit/toRegionPlace";
import { toWorldQuaternion } from "#src/services/genshinAssets/world/toWorldQuaternion";

// A plant prefab's name and every place it stands, in our region's axes, each with the scale its placement holds
interface FittedPlant {
  name: string;
  places: { position: GroundPoint; rotation: number; scale: number[] }[];
}
// Windrise's plants as stand-ins: each prefab's places in our region's axes round the origin with their scales, from
// The placements `readWindrisePlantPlacements` reads off the streams
export const fitWindrisePlants = async (): Promise<{ plants: FittedPlant[] }> => {
  const { origin, plants } = await readWindrisePlantPlacements();
  return {
    plants: plants.map(({ name, places }) => ({
      name,
      places: places.map(({ position, rotation, scale: [scaleX, scaleY, scaleZ] }) => ({
        ...toRegionPlace({ position, rotation: toWorldQuaternion(rotation) }, origin),
        scale: [roundFitted(scaleX), roundFitted(scaleY), roundFitted(scaleZ)],
      })),
    })),
  };
};
