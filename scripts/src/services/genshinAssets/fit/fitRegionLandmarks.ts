import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { toRegionPlace } from "#src/services/genshinAssets/fit/toRegionPlace";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { readRegionLandmarkSources } from "#src/services/genshinAssets/shared/readRegionLandmarkSources";
import { toHeightOffset } from "#src/services/genshinAssets/shared/toHeightOffset";
import { toLandmarkArrival } from "#src/services/genshinAssets/shared/toLandmarkArrival";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readSceneTransportPoints } from "#src/services/genshinAssets/world/readSceneTransportPoints";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { LandmarkKind } from "genshin-world";

// A region data file's landmarks the world places, each stood where its prefab's first place stands and turned as it
// Turns, round the world's origin. Its height over the ground is the export root's height less our ground's at its spot,
// So the landmark's root stands where the game's does and no hand offset sets it. A statue also gets its arrival, the
// Game's transport place and turn for the scene point it stands at, which a jump lands at. Every other field is the
// Region's own. A landmark the world names that the file lacks, or a prefab placed nowhere, is an error. Returns the
// File's path
export const fitRegionLandmarks = async (
  component: DerivedAssetComponent,
  regionFile: string,
  { isDryRun }: { isDryRun: boolean },
): Promise<string> => {
  const { getWorldHeight, origin, placements, regionJson, regionLandmarks } = await readRegionLandmarkSources(
    component,
    regionFile,
  );
  const [, originY] = origin;
  // The world package's region data, whose fields beyond each landmark's id are carried through as the file holds them
  const regionData = parseMachineJson<{ landmarks: { id: string; kind: string }[] }>(regionJson);
  const missing = regionLandmarks.find(({ id }) => !regionData.landmarks.some((landmark) => landmark.id === id));
  if (missing) throw new InvalidOperationError(Operation.Read, regionFile, `has no landmark ${missing.id}`);
  const transportPoints = await readSceneTransportPoints();
  const landmarks = regionData.landmarks.map((landmark) => {
    const regionLandmark = regionLandmarks.find(({ id }) => id === landmark.id);
    if (!regionLandmark) return landmark;
    const place = placements.find(({ prefab }) => prefab.pathId === regionLandmark.pathId)?.places[0];
    if (!place) throw new InvalidOperationError(Operation.Read, component, `places ${landmark.id}'s prefab nowhere`);
    const { position, rotation } = toRegionPlace(place, origin);
    const heightOffset = toHeightOffset(place.position[1], originY, position, getWorldHeight);
    if (landmark.kind !== LandmarkKind.StatueOfTheSeven) return { ...landmark, heightOffset, position, rotation };
    const scenePointId = DerivedAssetComponentMap[component].world?.points.find(
      ({ prefab }) => prefab.pathId === regionLandmark.pathId,
    )?.id;
    const transportPoint = transportPoints.find(({ id }) => id === scenePointId);
    if (!transportPoint)
      throw new InvalidOperationError(Operation.Read, component, `has no transport point for ${landmark.id}`);
    const arrival = toLandmarkArrival(transportPoint, origin, getWorldHeight);
    return { ...landmark, arrival, heightOffset, position, rotation };
  });
  return writeWorldData(regionFile, { ...regionData, landmarks }, { isDryRun });
};
