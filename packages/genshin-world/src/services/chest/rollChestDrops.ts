import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { ChestKind } from "#src/models/chest/ChestKind";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { drawArtifactPiece } from "#src/services/artifact/drawArtifactPiece";
import { rollPieceArtifact } from "#src/services/artifact/rollPieceArtifact";
import { ChestDropPoolMap } from "#src/services/chest/ChestDropPoolMap";
import {
  CHEST_HIGH_RARITY_ARTIFACT_SET_IDS,
  CHEST_HIGH_RARITY_ARTIFACT_STARS,
  CHEST_LOW_RARITY_ARTIFACT_STARS,
} from "#src/services/chest/constants";
import { drawChestCount } from "#src/services/chest/drawChestCount";
import { takeOne } from "@esposter/shared";

// One artifact of the sets a pool names, rolled as the game drops one. Its set is drawn evenly among those the reliquary
// Tables hold, its slot evenly among the five and its stars evenly among those its set gives, and the artifact is rolled
// At them (see drawArtifactPiece). The wiki gives no chance of the set, the slot or the stars, so those draws are provisional
const rollArtifactDrop = (
  artifactSets: readonly ReliquarySetData[],
  random: () => number,
  tables: Pick<ArtifactDropTables, "artifactMainAffixPools" | "artifactRarityDataMap">,
): DroppedItem[] => {
  if (artifactSets.length === 0) return [];
  const set = takeOne(artifactSets, Math.floor(random() * artifactSets.length));
  const slots = Object.values(ArtifactSlot);
  const slot = takeOne(slots, Math.floor(random() * slots.length));
  const stars = CHEST_HIGH_RARITY_ARTIFACT_SET_IDS.includes(set.id)
    ? CHEST_HIGH_RARITY_ARTIFACT_STARS
    : CHEST_LOW_RARITY_ARTIFACT_STARS;
  const rarity = takeOne(stars, Math.floor(random() * stars.length));
  return [rollPieceArtifact(set.id, drawArtifactPiece(set, slot, rarity, random), random, tables)];
};

// What one opening of a chest of a kind pours out: one weapon picked from its pool when the pool names any, one artifact
// Of the sets its pool names, and each material's count rolled within its range, a material that rolls none left out
export const rollChestDrops = (
  kind: ChestKind,
  random: () => number,
  { artifactMainAffixPools, artifactRarityDataMap, reliquarySets }: ArtifactDropTables,
): DroppedItem[] => {
  const pool = ChestDropPoolMap[kind];
  if (!pool) return [];
  const weapons: DroppedItem[] =
    pool.weaponItemIds.length === 0
      ? []
      : [{ count: 1, itemId: takeOne(pool.weaponItemIds, Math.floor(random() * pool.weaponItemIds.length)) }];
  const artifacts = rollArtifactDrop(
    reliquarySets.filter(({ id }) => pool.artifactSetIds.includes(id)),
    random,
    { artifactMainAffixPools, artifactRarityDataMap },
  );
  const materials = pool.materials.flatMap(({ count, itemId }) => {
    const drawnCount = drawChestCount(count, random);
    return drawnCount > 0 ? [{ count: drawnCount, itemId }] : [];
  });
  return [...weapons, ...artifacts, ...materials];
};
