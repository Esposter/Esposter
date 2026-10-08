import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";
import type { DumpedVector } from "#src/models/genshinAssets/world/DumpedVector";
import type { GaussianHills, GroundPoint, PlateauFeature } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { RegionCapitalMap } from "#src/services/genshinAssets/fit/RegionCapitalMap";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { computeUpperMedian } from "#src/services/genshinAssets/shared/computeUpperMedian";
import {
  SCENE_POINT_AREA_FIELD,
  WORLD_AREAS_PATH,
  WORLD_DATA_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage } from "genshin-text";
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
// Turn and the plateau's reach among them. A capital with no waypoint is an error, and one set by hand writes its landmark alone. Returns the files written
export const fitRegionCapitals = async (): Promise<string[]> => {
  const statuePoint = DerivedAssetComponentMap[DerivedAssetComponent.Windrise].world?.points[0];
  if (!statuePoint) throw new InvalidOperationError(Operation.Read, DerivedAssetComponent.Windrise, "has no point");
  const [areasJson, pointsJson, [originX, originY, originZ], windriseGroundJson] = await Promise.all([
    readFile(WORLD_AREAS_PATH, "utf8"),
    readFile(join(GAME_TEXT_DIRECTORY, statuePoint.file), "utf8"),
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFile(join(WORLD_DATA_DIRECTORY, "windrise", "ground.json"), "utf8"),
  ]);
  const textMap = readTextMap(GameLanguage.English);
  const areas = parseMachineJson<WorldArea[]>(areasJson);
  const categoryPoints =
    parseMachineJson<Record<string, Record<string, DumpedScenePoint> | undefined>>(pointsJson)[statuePoint.category] ??
    {};
  const waypointType = categoryPoints[statuePoint.id]?.$type;
  if (waypointType === undefined)
    throw new InvalidOperationError(Operation.Read, statuePoint.file, `has no point ${statuePoint.id}`);
  const { base } = parseMachineJson<GaussianHills>(windriseGroundJson);
  const writtenPaths = await Promise.all(
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
      if ("position" in capital) return [await writeLandmark(capital.position)];
      const { areaNames } = capital;
      const capitalAreaNames = new Set(areaNames);
      const areaIds = new Set(
        areas
          .filter(({ areaNameTextMapHash }) => capitalAreaNames.has(textMap.get(String(areaNameTextMapHash)) ?? ""))
          .map(({ areaID2 }) => areaID2),
      );
      const waypoints = Object.values(categoryPoints).flatMap((point): DumpedVector[] => {
        const area = point[SCENE_POINT_AREA_FIELD];
        const position = point[statuePoint.position];
        return point.$type === waypointType &&
          typeof area === "number" &&
          areaIds.has(area) &&
          typeof position === "object"
          ? [position]
          : [];
      });
      if (waypoints.length === 0)
        throw new InvalidOperationError(Operation.Read, landmarkId, `has no waypoint in ${areaNames.join(", ")}`);
      const position: GroundPoint = {
        x: roundFitted(computeUpperMedian(waypoints.map(({ _x = 0 }) => _x)) - originX),
        z: roundFitted(originZ - computeUpperMedian(waypoints.map(({ _z = 0 }) => _z))),
      };
      const height = roundFitted(computeUpperMedian(waypoints.map(({ _y = 0 }) => _y)) - originY - base);
      const groundFile = join(region, "ground.json");
      const paths = [await writeLandmark(position)];
      if (!existsSync(join(WORLD_DATA_DIRECTORY, groundFile))) return paths;
      const regionGround = parseMachineJson<{ features: PlateauFeature[] }>(
        await readFile(join(WORLD_DATA_DIRECTORY, groundFile), "utf8"),
      );
      const features = regionGround.features.map((feature, index) =>
        index === 0 ? { ...feature, height, ...position } : feature,
      );
      paths.push(await writeWorldData(groundFile, { ...regionGround, features }));
      return paths;
    }),
  );
  return writtenPaths.flat();
};
