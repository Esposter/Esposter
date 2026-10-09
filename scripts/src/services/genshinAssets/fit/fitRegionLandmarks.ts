import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toRegionPlace } from "#src/services/genshinAssets/fit/toRegionPlace";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readWorldGroundHeight } from "#src/services/genshinAssets/shared/readWorldGroundHeight";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldPlacements } from "#src/services/genshinAssets/world/readWorldPlacements";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A region data file's landmarks the world places, each stood where its prefab's first place stands and turned as it
// Turns, round the world's origin. Its height over the ground is the export root's height less our ground's at its spot,
// So the landmark's root stands where the game's does and no hand offset sets it. Every other field is the region's own.
// A landmark the world names that the file lacks, or a prefab placed nowhere, is an error. Returns the file's path
export const fitRegionLandmarks = async (component: DerivedAssetComponent, regionFile: string): Promise<string> => {
  const regionLandmarks = (await readWorldOptions(component))?.regionLandmarks ?? [];
  const [placements, origin, regionJson, getWorldHeight] = await Promise.all([
    readWorldPlacements(component),
    readWorldOrigin(component),
    readFile(join(WORLD_DATA_DIRECTORY, regionFile), "utf8"),
    readWorldGroundHeight(),
  ]);
  const [, originY] = origin;
  // The world package's region data, whose fields beyond each landmark's id are carried through as the file holds them
  const regionData = parseMachineJson<{ landmarks: { id: string }[] }>(regionJson);
  const missing = regionLandmarks.find(({ id }) => !regionData.landmarks.some((landmark) => landmark.id === id));
  if (missing) throw new InvalidOperationError(Operation.Read, regionFile, `has no landmark ${missing.id}`);
  const landmarks = regionData.landmarks.map((landmark) => {
    const regionLandmark = regionLandmarks.find(({ id }) => id === landmark.id);
    if (!regionLandmark) return landmark;
    const place = placements.find(({ prefab }) => prefab.pathId === regionLandmark.pathId)?.places[0];
    if (!place) throw new InvalidOperationError(Operation.Read, component, `places ${landmark.id}'s prefab nowhere`);
    const { position, rotation } = toRegionPlace(place, origin);
    const heightOffset = roundFitted(place.position[1] - originY - getWorldHeight(position.x, position.z));
    return { ...landmark, heightOffset, position, rotation };
  });
  return writeWorldData(regionFile, { ...regionData, landmarks });
};
