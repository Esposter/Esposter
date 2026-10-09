import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DumpedVector } from "#src/models/genshinAssets/world/DumpedVector";
import type { WorldPrefabPlacements } from "#src/models/genshinAssets/world/WorldPrefabPlacements";

import { readStreamPlacements } from "#src/services/genshinAssets/world/readStreamPlacements";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { toWorldQuaternion } from "#src/services/genshinAssets/world/toWorldQuaternion";
import { GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const toVector = ({ _x = 0, _y = 0, _z = 0 }: DumpedVector): [number, number, number] => [_x, _y, _z];
// Every place a part of the open world sets each of its prefabs down: where each scene point stands, read from the
// Community's dump by the fields its map names, and each StreamGen placement of a prefab's id, read from the blob and
// Index `extract` wrote. A point or a field the dump does not hold is an error, so a dump that renamed its fields is
// Caught rather than read as the origin
export const readWorldPlacements = async (component: DerivedAssetComponent): Promise<WorldPrefabPlacements[]> => {
  const world = await readWorldOptions(component);
  if (!world) return [];
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
          { position: toVector(pointPosition), rotation: toWorldQuaternion(toVector(pointRotation)), scale: [1, 1, 1] },
        ],
        prefab,
      } satisfies WorldPrefabPlacements;
    }),
  );
  const streamPlacements = await Promise.all(
    world.streams.map(async (stream) => {
      const placements = await readStreamPlacements(component, stream);
      return stream.prefabs.map(({ prefab, prefabId }) => ({
        places: placements
          .filter((placement) => placement.prefabId === prefabId)
          .map(({ position, rotation, scale }) => ({ position, rotation: toWorldQuaternion(rotation), scale })),
        prefab,
      }));
    }),
  );
  return [...pointPlacements, ...streamPlacements.flat()];
};
