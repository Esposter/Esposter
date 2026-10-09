import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { GaussianHills, GroundPoint, PlateauFeature } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { RegionCapitalMap } from "#src/services/genshinAssets/fit/RegionCapitalMap";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { computeUpperMedian } from "#src/services/genshinAssets/shared/computeUpperMedian";
import { WORLD_AREAS_PATH, WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readSceneTransportPoints } from "#src/services/genshinAssets/world/readSceneTransportPoints";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage } from "genshin-text";
import { GameDataset } from "genshin-world";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// An area of the game's own table as the community's dump writes one: its id among the scene points, and its name's
// Text id
interface WorldArea {
  areaID2: number;
  areaNameTextMapHash: number;
}
// Each region's first landmark stood at its capital, round the world's origin at the oak's foot: the median place of
// The waypoints the game's area table files under the capital's areas, a waypoint being a point of the kind
// Windrise's statue is. Where the region's ground is its own file, its first plateau, the capital's, is centred there
// And raised to the waypoints' median height over the world's base. Every other field stays the files', the landmark's
// Turn and the plateau's reach among them. A capital with no waypoint is an error, and one set by hand writes its
// Landmark alone. Both files stay written, as the sources people edit, and each ground rewritten is also its record
// `ground/<region>`, with the paths written as the notes
export const fitRegionCapitals = async (): Promise<GameDataBuild> => {
  const [areasJson, transportPoints, [originX, originY, originZ], { base }] = await Promise.all([
    readFile(WORLD_AREAS_PATH, "utf8"),
    readSceneTransportPoints(),
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readWorldData<GaussianHills>("windrise/base-ground.json"),
  ]);
  const textMap = readTextMap(GameLanguage.English);
  const areas = parseMachineJson<WorldArea[]>(areasJson);
  return mergeGameDataBuilds(
    await Promise.all(
      Object.entries(RegionCapitalMap).map(async ([region, capital]) => {
        const { landmarkId } = capital;
        const regionFile = join("regions", `${region}.json`);
        const regionData = parseMachineJson<{ landmarks: { id: string }[] }>(
          await readFile(join(WORLD_DATA_DIRECTORY, regionFile), "utf8"),
        );
        if (!regionData.landmarks.some(({ id }) => id === landmarkId))
          throw new InvalidOperationError(Operation.Read, regionFile, `has no landmark ${landmarkId}`);
        const writeLandmark = (position: GroundPoint) => {
          const landmarks = regionData.landmarks.map((landmark) =>
            landmark.id === landmarkId ? { ...landmark, position } : landmark,
          );
          return writeWorldData(regionFile, { ...regionData, landmarks });
        };
        // A capital the dump holds no areas for stands at the place its entry sets, so only its landmark is written: its
        // Plateau's height is the region's own ground fit's, which no waypoint gives it
        if ("position" in capital) return { notes: [await writeLandmark(capital.position)], objects: {} };
        const { areaNames } = capital;
        const capitalAreaNames = new Set(areaNames);
        const areaIds = new Set(
          areas
            .filter(({ areaNameTextMapHash }) => capitalAreaNames.has(textMap.get(String(areaNameTextMapHash)) ?? ""))
            .map(({ areaID2 }) => areaID2),
        );
        const waypoints = transportPoints.filter(({ area }) => area !== undefined && areaIds.has(area));
        if (waypoints.length === 0)
          throw new InvalidOperationError(Operation.Read, landmarkId, `has no waypoint in ${areaNames.join(", ")}`);
        const position: GroundPoint = {
          x: roundFitted(computeUpperMedian(waypoints.map((waypoint) => waypoint.position.x)) - originX),
          z: roundFitted(originZ - computeUpperMedian(waypoints.map((waypoint) => waypoint.position.z))),
        };
        const height = roundFitted(computeUpperMedian(waypoints.map((waypoint) => waypoint.height)) - originY - base);
        const groundFile = join(region, "ground.json");
        const landmarkPath = await writeLandmark(position);
        if (!existsSync(join(WORLD_DATA_DIRECTORY, groundFile))) return { notes: [landmarkPath], objects: {} };
        const regionGround = parseMachineJson<{ features: PlateauFeature[] }>(
          await readFile(join(WORLD_DATA_DIRECTORY, groundFile), "utf8"),
        );
        const features = regionGround.features.map((feature, index) =>
          index === 0 ? { ...feature, height, ...position } : feature,
        );
        const ground = { ...regionGround, features };
        return {
          notes: [landmarkPath, await writeWorldData(groundFile, ground)],
          objects: { [`${GameDataset.Ground}/${region}`]: ground },
        };
      }),
    ),
  );
};
