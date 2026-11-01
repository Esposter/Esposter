import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { CurrencyItemIdMap } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { readStatueLevels } from "#src/services/statue/readStatueLevels";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";

// The Adventure EXP, Primogems and Anemo Sigil a level pays are items the materials table does not hold, so their names are the game's own text
const GAME_TEXT_ITEM_KEY_MAP: Partial<Record<number, GameTextKey>> = {
  [ADVENTURE_EXP_ITEM_ID]: GameTextKey.AdventureExp,
  [CurrencyItemIdMap[Currency.Primogem]]: GameTextKey.Primogem,
  [CurrencyItemIdMap[Currency.AnemoSigil]]: GameTextKey.AnemoSigil,
};
const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);

// Mondstadt's Worship at level 2 with no Anemoculus held toward it, as the completionist guide shows it at 164 seconds
export const props = {
  gameText: ENGLISH_GAME_TEXT,
  getItemName: (itemId: number) => {
    const gameTextKey = GAME_TEXT_ITEM_KEY_MAP[itemId];
    return gameTextKey === undefined
      ? getItemDefinition(itemId, englishNameText, materialDataMap).name
      : ENGLISH_GAME_TEXT[gameTextKey];
  },
  levels: await readStatueLevels(GAME_DATA_LOCAL_BASE_URL, "statueLevels/mondstadt"),
  progress: { claimedLevel: 1, heldCount: 0, level: 1 },
};
