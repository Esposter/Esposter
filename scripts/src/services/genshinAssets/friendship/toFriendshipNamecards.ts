import type { ExcelFetterCharacterCardRow } from "#src/models/genshinAssets/friendship/ExcelFetterCharacterCardRow";
import type { FriendshipNamecardRow } from "#src/models/genshinAssets/friendship/FriendshipNamecardRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { FRIENDSHIP_NAMECARD_LEVEL, NAMECARD_MATERIAL_TYPE } from "#src/services/genshinAssets/friendship/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Each character's namecard, the item its Friendship Level's reward pays, named by that item's text id. A reward that pays
// No item, or an item that is no namecard, is a row the dump has changed under, so it throws rather than skip
export const toFriendshipNamecards = (
  cardRows: readonly ExcelFetterCharacterCardRow[],
  rewardMap: ReadonlyMap<number, ExcelRewardRow>,
  materialRows: readonly MaterialRow[],
): FriendshipNamecardRow[] => {
  const materialMap = new Map(materialRows.map((materialRow) => [materialRow.id, materialRow]));
  return cardRows
    .filter(({ fetterLevel }) => fetterLevel === FRIENDSHIP_NAMECARD_LEVEL)
    .map(({ avatarId, rewardId }) => {
      const reward = rewardMap.get(rewardId);
      if (!reward) throw new InvalidOperationError(Operation.Read, String(rewardId), "has no row in the reward table");
      const rewardItem = reward.rewardItemList.find(({ itemId }) => itemId > 0);
      if (!rewardItem)
        throw new InvalidOperationError(Operation.Read, String(rewardId), "pays no item for its namecard");
      const materialRow = materialMap.get(rewardItem.itemId);
      if (materialRow?.materialType !== NAMECARD_MATERIAL_TYPE)
        throw new InvalidOperationError(
          Operation.Read,
          String(rewardItem.itemId),
          "is no namecard in the material table",
        );
      return { characterId: avatarId, itemId: rewardItem.itemId, nameTextId: materialRow.nameTextMapHash };
    });
};
