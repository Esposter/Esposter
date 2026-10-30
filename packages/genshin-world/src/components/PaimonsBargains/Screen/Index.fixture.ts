import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { PAIMON_BARGAINS_SHOP_ID } from "#src/services/shop/constants";
import { readPaimonsBargainsRotation } from "#src/services/shop/readPaimonsBargainsRotation";
import { readShopGoodMap } from "#src/services/shop/readShopGoodMap";
import { ENGLISH_GAME_TEXT } from "genshin-text";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const shopGoodMap = await readShopGoodMap(GAME_DATA_LOCAL_BASE_URL);
const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);
const rotation = await readPaimonsBargainsRotation(GAME_DATA_LOCAL_BASE_URL);
const now = Temporal.Instant.from("2026-10-30T12:00:00Z");

// Paimon's Bargains at the top Adventure Rank, its Fates and this month's rotation on offer, with an empty wallet and no
// Purchase yet. The reference is the 2021 build's hub, so its rotation and Fates are not the current ones: only the frame and
// Its layout are comparable
export const props = {
  adventureRank: 60,
  characterDataMap: statTables.characterDataMap,
  characters: [],
  gameText: ENGLISH_GAME_TEXT,
  getWorldNow: () => now,
  goods: shopGoodMap.get(PAIMON_BARGAINS_SHOP_ID) ?? [],
  inventory: EMPTY_INVENTORY,
  materialDataMap,
  nameText: englishNameText,
  now,
  purchases: [],
  rotation,
  wallet: EMPTY_WALLET,
  weaponDataMap: statTables.weaponDataMap,
};
