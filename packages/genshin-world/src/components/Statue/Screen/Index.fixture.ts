import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { characterDataSchema } from "#src/models/character/CharacterData";
import { readGameData } from "#src/services/data/readGameData";
import { DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { NOELLE_CHARACTER_ID } from "#src/services/kit/characters/noelleKit";
import { VENTI_CHARACTER_ID } from "#src/services/kit/characters/ventiKit";
import { XIANGLING_CHARACTER_ID } from "#src/services/kit/characters/xianglingKit";
import { createParty } from "#src/services/party/createParty";
import { ENGLISH_GAME_TEXT } from "genshin-text";
import { z } from "zod";

// The characters' English names by id, from the game's character table and its name text
const characterNameMap = new Map(
  (await readGameData(GAME_DATA_LOCAL_BASE_URL, "stats/characters", z.array(characterDataSchema))).map(
    ({ id, nameTextId }) => [id, englishNameText[nameTextId] ?? ""],
  ),
);
const NOW = Temporal.Instant.fromEpochMilliseconds(0);

// The Statue's Blessing of two statues, its pool full at 10000 of 10000 with auto-recover on at half, and four deployed
// Characters at full health, as the completionist guide shows it at 173 seconds
export const props = {
  autoRecover: { isOn: true, thresholdPercent: 50 },
  gameText: ENGLISH_GAME_TEXT,
  getMaxHealth: () => 10_000,
  getName: (characterId: number) => characterNameMap.get(characterId) ?? "",
  getNow: () => NOW,
  party: createParty([DILUC_CHARACTER_ID, VENTI_CHARACTER_ID, XIANGLING_CHARACTER_ID, NOELLE_CHARACTER_ID]),
  power: { amount: 10_000, changedAt: NOW },
  statueCount: 2,
};
