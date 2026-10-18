import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { ShrineKeySource } from "genshin-world";

import { SHRINE_KEY_NAME_PATTERN, SHRINE_KEY_REGIONS } from "#src/services/genshinAssets/puzzles/constants";
import { GameDataset } from "genshin-world";

// Each Shrine of Depths key a quest's reward names, as its own source filed under the key's region. A key is found by
// Its English name, and a key naming a region the map does not know is left out and noted
export const toShrineKeySources = ({
  englishTextMap,
  materials,
  quests,
  rewards,
}: {
  englishTextMap: ReadonlyMap<string, string>;
  materials: Pick<MaterialRow, "id" | "nameTextMapHash">[];
  quests: DumpedMainQuest[];
  rewards: ReadonlyMap<number, ExcelRewardRow>;
}): GameDataBuild => {
  const keyRegionNames = new Map(
    materials.flatMap(({ id, nameTextMapHash }) => {
      const regionName = SHRINE_KEY_NAME_PATTERN.exec(englishTextMap.get(String(nameTextMapHash)) ?? "")?.groups
        ?.regionName;
      return regionName === undefined ? [] : [[id, regionName] as const];
    }),
  );
  const notes: string[] = [];
  const sources: ShrineKeySource[] = [];
  for (const { id: questId, rewardIdList = [] } of quests.toSorted((a, b) => a.id - b.id))
    for (const rewardId of rewardIdList) {
      const reward = rewards.get(rewardId);
      if (!reward) continue;
      for (const { itemId } of reward.rewardItemList) {
        const regionName = keyRegionNames.get(itemId);
        if (regionName === undefined) continue;
        const keyRegion = SHRINE_KEY_REGIONS[regionName];
        if (keyRegion === undefined) {
          notes.push(
            `quest ${questId} gives a ${regionName} Shrine of Depths key, a region the map does not know; left out`,
          );
          continue;
        }
        sources.push({ id: `quest-${questId}-${itemId}`, keyItemId: itemId, keyRegion, questId, rewardId });
      }
    }
  const objects: Record<string, ShrineKeySource[]> = {};
  for (const source of sources) {
    const key = `${GameDataset.ShrineKeySources}/${source.keyRegion}`;
    objects[key] = [...(objects[key] ?? []), source];
  }
  return { notes, objects };
};
