import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { ChestKind } from "#src/models/chest/ChestKind";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { getArtifactRarityData } from "#src/services/artifact/getArtifactRarityData";
import { rollArtifact } from "#src/services/artifact/rollArtifact";
import { ChestDropPoolMap } from "#src/services/chest/ChestDropPoolMap";
import {
  CHEST_HIGH_RARITY_ARTIFACT_SET_IDS,
  CHEST_HIGH_RARITY_ARTIFACT_STARS,
  CHEST_INITIAL_MINOR_AFFIX_COUNT_WEIGHTS,
  CHEST_LOW_RARITY_ARTIFACT_STARS,
} from "#src/services/chest/constants";
import { drawChestCount } from "#src/services/chest/drawChestCount";
import { drawWeightedValue } from "#src/services/shared/drawWeightedValue";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// One artifact of the sets a pool names, rolled as the game drops one. Its set is drawn evenly among those the reliquary
// Tables hold, its slot evenly among the five, its stars evenly among those its set gives and its starting minor affix
// Count by the wiki's distribution for those stars. The piece is the reliquary row that matches all four, which names the
// Artifact, and the artifact's stats roll from its slot's main affix pool and its stars' rarity data. The wiki gives no
// Chance of the set, the slot or the stars, so those draws are provisional
const rollArtifactDrop = (
  artifactSets: readonly ReliquarySetData[],
  random: () => number,
  {
    artifactMainAffixPools,
    artifactRarityDataMap,
  }: Pick<ArtifactDropTables, "artifactMainAffixPools" | "artifactRarityDataMap">,
): DroppedItem[] => {
  if (artifactSets.length === 0) return [];
  const { id, pieces } = takeOne(artifactSets, Math.floor(random() * artifactSets.length));
  const slots = Object.values(ArtifactSlot);
  const slot = takeOne(slots, Math.floor(random() * slots.length));
  const stars = CHEST_HIGH_RARITY_ARTIFACT_SET_IDS.includes(id)
    ? CHEST_HIGH_RARITY_ARTIFACT_STARS
    : CHEST_LOW_RARITY_ARTIFACT_STARS;
  const rarity = takeOne(stars, Math.floor(random() * stars.length));
  const minorAffixCountWeights = CHEST_INITIAL_MINOR_AFFIX_COUNT_WEIGHTS[rarity];
  if (minorAffixCountWeights === undefined)
    throw new InvalidOperationError(Operation.Read, rollArtifactDrop.name, `no minor affix count for ${rarity} stars`);
  const minorAffixCount = drawWeightedValue(minorAffixCountWeights, random);
  const piece = pieces.find(
    (candidate) =>
      candidate.slot === slot && candidate.rarity === rarity && candidate.startingMinorCount === minorAffixCount,
  );
  if (piece === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      String(id),
      `holds no ${slot} piece of ${rarity} stars with ${minorAffixCount} minor affixes`,
    );
  const mainAffixPool = artifactMainAffixPools.find((pool) => pool.slot === slot);
  if (mainAffixPool === undefined)
    throw new InvalidOperationError(Operation.Read, rollArtifactDrop.name, `no main affix pool for ${slot}`);
  const artifact = rollArtifact({
    mainAffixPool,
    minorAffixCount,
    random,
    rarityData: getArtifactRarityData(artifactRarityDataMap, rarity),
    setId: id,
  });
  return [{ artifact, count: 1, itemId: piece.itemId }];
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
