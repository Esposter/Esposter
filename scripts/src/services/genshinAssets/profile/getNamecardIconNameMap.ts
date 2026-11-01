import type { ExcelNamecardMaterialRow } from "#src/models/genshinAssets/profile/ExcelNamecardMaterialRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelFetterCharacterCardRow } from "#src/models/genshinAssets/shared/ExcelFetterCharacterCardRow";

import { NAMECARD_MATERIAL_TYPE } from "#src/services/genshinAssets/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The namecard of each character the game's card table pays one, by the name of its icon: the material of the namecard
// Kind among the items of the rewards its card rows name. A character with no card row, the Traveler among them, has
// None. A character two namecards are paid is refused, naming it, since no single icon then names its card
export const getNamecardIconNameMap = (
  cardRows: ExcelFetterCharacterCardRow[],
  rewardMap: Map<number, ExcelRewardRow>,
  materialRows: ExcelNamecardMaterialRow[],
): Map<number, string> => {
  const namecardIconNameMap = new Map(
    materialRows.flatMap(({ icon, id, materialType }): [number, string][] =>
      materialType === NAMECARD_MATERIAL_TYPE && icon !== undefined ? [[id, icon]] : [],
    ),
  );
  const characterNamecardIconNameMap = new Map<number, string>();
  for (const { avatarId, rewardId } of cardRows)
    for (const { itemId } of rewardMap.get(rewardId)?.rewardItemList ?? []) {
      const namecardIconName = namecardIconNameMap.get(itemId);
      if (namecardIconName === undefined) continue;
      const heldIconName = characterNamecardIconNameMap.get(avatarId);
      if (heldIconName !== undefined && heldIconName !== namecardIconName)
        throw new InvalidOperationError(Operation.Read, String(avatarId), "is paid more than one namecard");
      characterNamecardIconNameMap.set(avatarId, namecardIconName);
    }
  return characterNamecardIconNameMap;
};
