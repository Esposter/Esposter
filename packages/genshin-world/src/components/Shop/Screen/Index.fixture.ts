import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { shopGoodSchema } from "#src/models/shop/ShopGood";
import { readGameData } from "#src/services/data/readGameData";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { ENGLISH_GAME_TEXT } from "genshin-text";
import { z } from "zod";

// The General Goods list of the public clip at 34 seconds, a Liyue shop: its first eight goods are the published Mondstadt
// General Goods, in the same order and at the same Mora prices, so they are the real data drawn. The clip's list goes on
// Beyond those eight to four more goods (Shrimp Meat, Almond, Rice, Tofu) whose stock no published dataset holds yet
const goods = await readGameData(GAME_DATA_LOCAL_BASE_URL, "shops/mondstadtGeneralGoods", z.array(shopGoodSchema));
// The clip's clock, at which its refresh line reads nine hours and three minutes to go, inside the goods' sale dates
const now = Temporal.Instant.from("2026-10-30T18:57:00+08:00");

export const props = {
  adventureRank: 60,
  gameText: ENGLISH_GAME_TEXT,
  getWorldNow: () => now,
  goods,
  inventory: EMPTY_INVENTORY,
  materialDataMap: await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL),
  nameText: englishNameText,
  now,
  purchases: [],
  reputationLevel: 0,
  // The clip's player holds 916764 Mora, the currency every good is priced in
  wallet: { ...EMPTY_WALLET, [Currency.Mora]: 916_764 },
};
