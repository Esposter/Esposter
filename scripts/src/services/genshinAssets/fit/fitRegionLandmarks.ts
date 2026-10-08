import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { toRegionPlace } from "#src/services/genshinAssets/fit/toRegionPlace";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readWorldPlacements } from "#src/services/genshinAssets/world/readWorldPlacements";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A region data file's landmarks the world places, each stood where its prefab's first place stands and turned as it
// Turns, round the world's origin. Every other field is the region's own, its height over the ground among them, since
// That is the kit's until its shape is derived. A landmark the world names that the file lacks, or a prefab placed
// Nowhere, is an error. Returns the file's path
export const fitRegionLandmarks = async (component: DerivedAssetComponent, regionFile: string): Promise<string> => {
  const regionLandmarks = (await readWorldOptions(component))?.regionLandmarks ?? [];
  const [placements, origin, regionJson] = await Promise.all([
    readWorldPlacements(component),
    readWorldOrigin(component),
    readFile(join(WORLD_DATA_DIRECTORY, regionFile), "utf8"),
  ]);
  // The world package's region data, whose fields beyond each landmark's id are carried through as the file holds them
  const regionData = parseMachineJson<{ landmarks: { id: string }[] }>(regionJson);
  const missing = regionLandmarks.find(({ id }) => !regionData.landmarks.some((landmark) => landmark.id === id));
  if (missing) throw new InvalidOperationError(Operation.Read, regionFile, `has no landmark ${missing.id}`);
  const landmarks = regionData.landmarks.map((landmark) => {
    const regionLandmark = regionLandmarks.find(({ id }) => id === landmark.id);
    if (!regionLandmark) return landmark;
    const place = placements.find(({ prefab }) => prefab.pathId === regionLandmark.pathId)?.places[0];
    if (!place) throw new InvalidOperationError(Operation.Read, component, `places ${landmark.id}'s prefab nowhere`);
    return { ...landmark, ...toRegionPlace(place, origin) };
  });
  return writeWorldData(regionFile, { ...regionData, landmarks });
};
