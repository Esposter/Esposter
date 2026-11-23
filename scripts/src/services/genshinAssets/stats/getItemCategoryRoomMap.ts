import type { ItemCategoryRoomMap } from "genshin-world";

import { readConstValue } from "#src/services/genshinAssets/shared/readConstValue";
import {
  ARTIFACT_ROOM_CONST_NAME,
  FURNISHING_ROOM_CONST_NAME,
  WEAPON_ROOM_CONST_NAME,
} from "#src/services/genshinAssets/stats/constants";
import { takeOne } from "@esposter/shared";
import { ItemCategory } from "genshin-interface/save";
import { itemCategoryRoomMapSchema } from "genshin-world";

// The rooms of the three tabs the bag counts on their own, each the first value of its game constant: the room the bag
// Shows. The record is checked against the World's schema as it is built
export const getItemCategoryRoomMap = (): ItemCategoryRoomMap =>
  itemCategoryRoomMapSchema.parse({
    [ItemCategory.Artifact]: Number(takeOne(readConstValue(ARTIFACT_ROOM_CONST_NAME))),
    [ItemCategory.Furnishing]: Number(takeOne(readConstValue(FURNISHING_ROOM_CONST_NAME))),
    [ItemCategory.Weapon]: Number(takeOne(readConstValue(WEAPON_ROOM_CONST_NAME))),
  });
