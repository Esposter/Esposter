import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { WorldPrefabPlacements } from "#src/models/genshinAssets/world/WorldPrefabPlacements";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { UNITY_EULER_ORDER } from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseStreamingIndex } from "#src/services/genshinAssets/world/parseStreamingIndex";
import { parseStreamingPlacements } from "#src/services/genshinAssets/world/parseStreamingPlacements";
import { GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Euler, MathUtils, Quaternion } from "three";

// A vector as the community's dump writes one
interface DumpedVector {
  _x?: number;
  _y?: number;
  _z?: number;
}
const toQuaternion = ([x, y, z]: readonly [number, number, number]): [number, number, number, number] =>
  new Quaternion()
    .setFromEuler(new Euler(MathUtils.degToRad(x), MathUtils.degToRad(y), MathUtils.degToRad(z), UNITY_EULER_ORDER))
    .toArray();
const toVector = ({ _x = 0, _y = 0, _z = 0 }: DumpedVector): [number, number, number] => [_x, _y, _z];
// Every place a part of the open world sets each of its prefabs down: where each scene point stands, read from the
// Community's dump by the fields its map names, and each StreamGen placement of a prefab's id, read from the blob and
// Index `extract` wrote. A point or a field the dump does not hold is an error, so a dump that renamed its fields is
// Caught rather than read as the origin
export const readWorldPlacements = async (component: DerivedAssetComponent): Promise<WorldPrefabPlacements[]> => {
  const { world } = DerivedAssetComponentMap[component];
  if (!world) return [];
  const directory = getComponentDirectory(component);
  const pointPlacements = await Promise.all(
    world.points.map(async ({ category, file, id, position, prefab, rotation }) => {
      const points = parseMachineJson<Record<string, Record<string, Record<string, DumpedVector> | undefined>>>(
        await readFile(join(GAME_TEXT_DIRECTORY, file), "utf8"),
      );
      const point = points[category]?.[id];
      const pointPosition = point?.[position];
      const pointRotation = point?.[rotation];
      if (!pointPosition || !pointRotation)
        throw new InvalidOperationError(Operation.Read, file, `has no point ${id} with ${position} and ${rotation}`);
      return {
        places: [
          { position: toVector(pointPosition), rotation: toQuaternion(toVector(pointRotation)), scale: [1, 1, 1] },
        ],
        prefab,
      } satisfies WorldPrefabPlacements;
    }),
  );
  const streamPlacements = await Promise.all(
    world.streams.map(async ({ blob, index, prefabs }) => {
      const [blobBytes, indexBytes] = await Promise.all([
        readFile(join(directory.world, AssetType.MiHoYoBinData, `${blob.name}.dat`)),
        readFile(join(directory.world, AssetType.MonoBehaviour, `${index.name}.dat`)),
      ]);
      const placements = parseStreamingPlacements(blobBytes, parseStreamingIndex(indexBytes));
      return prefabs.map(({ prefab, prefabId }) => ({
        places: placements
          .filter((placement) => placement.prefabId === prefabId)
          .map(({ position, rotation, scale }) => ({ position, rotation: toQuaternion(rotation), scale })),
        prefab,
      }));
    }),
  );
  return [...pointPlacements, ...streamPlacements.flat()];
};
