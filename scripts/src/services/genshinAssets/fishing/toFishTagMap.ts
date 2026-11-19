import type { ExcelFeatureTagGroupRow } from "#src/models/genshinAssets/fishing/ExcelFeatureTagGroupRow";
import type { ExcelMonsterRow } from "#src/models/genshinAssets/fishing/ExcelMonsterRow";
import type { Fish } from "genshin-world";

// Each fish's feature tags, read off the feature tag group its monster names. The group is the monster's own, not the
// Monster's id, which is the group for most fish and not for two homeworld fish; a fish whose monster names none has no tags
export const toFishTagMap = (
  fishRows: readonly Pick<Fish, "id" | "monsterId">[],
  monsterRows: readonly ExcelMonsterRow[],
  groupRows: readonly ExcelFeatureTagGroupRow[],
): Map<number, Set<number>> => {
  const monsterGroupIdMap = new Map(monsterRows.map(({ featureTagGroupID, id }) => [id, featureTagGroupID]));
  const groupTagsMap = new Map(
    groupRows.map(({ groupID, tagIDs }) => [groupID, new Set(tagIDs.filter((tag) => tag !== 0))]),
  );
  return new Map(
    fishRows.map(({ id, monsterId }) => {
      const groupId = monsterGroupIdMap.get(monsterId);
      return [id, (groupId === undefined ? undefined : groupTagsMap.get(groupId)) ?? new Set<number>()];
    }),
  );
};
