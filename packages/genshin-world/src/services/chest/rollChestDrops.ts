import type { ChestKind } from "#src/models/chest/ChestKind";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ChestDropPoolMap } from "#src/services/chest/ChestDropPoolMap";
import { drawChestCount } from "#src/services/chest/drawChestCount";
import { takeOne } from "@esposter/shared";

// One piece of the artifact sets a pool names, the set drawn evenly among those the reliquary tables hold and then its
// Piece drawn evenly among the set's pieces. The wiki gives no chance of either, so both draws are provisional
const rollArtifactPiece = (artifactSets: readonly ReliquarySetData[], random: () => number): DroppedItem[] => {
  if (artifactSets.length === 0) return [];
  const { pieces } = takeOne(artifactSets, Math.floor(random() * artifactSets.length));
  return [{ count: 1, itemId: takeOne(pieces, Math.floor(random() * pieces.length)).itemId }];
};

// What one opening of a chest of a kind pours out: one weapon picked from its pool when the pool names any, one piece of
// An artifact set its pool names, and each material's count rolled within its range, a material that rolls none left out
export const rollChestDrops = (
  kind: ChestKind,
  random: () => number,
  reliquarySets: readonly ReliquarySetData[],
): DroppedItem[] => {
  const pool = ChestDropPoolMap[kind];
  if (!pool) return [];
  const weapons: DroppedItem[] =
    pool.weaponItemIds.length === 0
      ? []
      : [{ count: 1, itemId: takeOne(pool.weaponItemIds, Math.floor(random() * pool.weaponItemIds.length)) }];
  const artifacts = rollArtifactPiece(
    reliquarySets.filter(({ id }) => pool.artifactSetIds.includes(id)),
    random,
  );
  const materials = pool.materials.flatMap(({ count, itemId }) => {
    const drawnCount = drawChestCount(count, random);
    return drawnCount > 0 ? [{ count: drawnCount, itemId }] : [];
  });
  return [...weapons, ...artifacts, ...materials];
};
