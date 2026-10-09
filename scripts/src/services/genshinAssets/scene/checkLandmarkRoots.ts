import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { toRegionPlace } from "#src/services/genshinAssets/fit/toRegionPlace";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldPlacements } from "#src/services/genshinAssets/world/readWorldPlacements";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { getWorldHeight } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface RegionLandmarkData {
  heightOffset: number;
  id: string;
  position: { x: number; z: number };
}

// Each region landmark's root, where the scene stands it against where its export's root stands, in metres: the
// Landmark's place and height as its component draws it (the ground at its spot plus its heightOffset), and the
// Export's first place of its prefab round the same origin. The distance is the gap between the two roots
export const checkLandmarkRoots = async (
  component: DerivedAssetComponent,
  regionFile: string,
): Promise<{ distance: number; id: string }[]> => {
  const regionLandmarks = (await readWorldOptions(component))?.regionLandmarks ?? [];
  const [placements, origin, regionJson] = await Promise.all([
    readWorldPlacements(component),
    readWorldOrigin(component),
    readFile(join(WORLD_DATA_DIRECTORY, regionFile), "utf8"),
  ]);
  const [, originY] = origin;
  const { landmarks } = parseMachineJson<{ landmarks: RegionLandmarkData[] }>(regionJson);
  return regionLandmarks.map(({ id, pathId }) => {
    const landmark = landmarks.find((candidate) => candidate.id === id);
    if (!landmark) throw new InvalidOperationError(Operation.Read, regionFile, `has no landmark ${id}`);
    const place = placements.find(({ prefab }) => prefab.pathId === pathId)?.places[0];
    if (!place) throw new InvalidOperationError(Operation.Read, component, `places ${id}'s prefab nowhere`);
    const exportRoot = toRegionPlace(place, origin);
    const sceneHeight = getWorldHeight(landmark.position.x, landmark.position.z) + landmark.heightOffset;
    const exportHeight = place.position[1] - originY;
    const distance = Math.hypot(
      landmark.position.x - exportRoot.position.x,
      landmark.position.z - exportRoot.position.z,
      sceneHeight - exportHeight,
    );
    return { distance, id };
  });
};
