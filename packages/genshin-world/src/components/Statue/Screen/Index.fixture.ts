import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { characterDataSchema } from "#src/models/character/CharacterData";
import { readGameData } from "#src/services/data/readGameData";
import { DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { KAEYA_CHARACTER_ID } from "#src/services/kit/characters/kaeyaKit";
import { NOELLE_CHARACTER_ID } from "#src/services/kit/characters/noelleKit";
import { SHENHE_CHARACTER_ID } from "#src/services/kit/characters/shenheKit";
import { SUCROSE_CHARACTER_ID } from "#src/services/kit/characters/sucroseKit";
import { VENTI_CHARACTER_ID } from "#src/services/kit/characters/ventiKit";
import { XIANGLING_CHARACTER_ID } from "#src/services/kit/characters/xianglingKit";
import { createParty } from "#src/services/party/createParty";
import { setPartyTeamCharacters } from "#src/services/party/setPartyTeamCharacters";
import { ENGLISH_GAME_TEXT } from "genshin-text";
import { z } from "zod";

// The characters' English names by id, from the game's character table and its name text
const characterNameMap = new Map(
  (await readGameData(GAME_DATA_LOCAL_BASE_URL, "stats/characters", z.array(characterDataSchema))).map(
    ({ id, nameTextId }) => [id, englishNameText[nameTextId] ?? ""],
  ),
);
const NOW = Temporal.Instant.fromEpochMilliseconds(0);

// The party of the completionist guide's Statue's Blessing at 173 seconds: four deployed Characters, and three preparing in
// Another team, all at full health
const party = createParty([DILUC_CHARACTER_ID, VENTI_CHARACTER_ID, XIANGLING_CHARACTER_ID, NOELLE_CHARACTER_ID]);
setPartyTeamCharacters(party, 1, [SUCROSE_CHARACTER_ID, KAEYA_CHARACTER_ID, SHENHE_CHARACTER_ID]);
// Each character's level as the clip shows it: the deployed team's at five and two, the other team's at one
const characterLevelMap = new Map([
  [DILUC_CHARACTER_ID, 5],
  [VENTI_CHARACTER_ID, 5],
  [XIANGLING_CHARACTER_ID, 2],
  [NOELLE_CHARACTER_ID, 2],
  [SUCROSE_CHARACTER_ID, 1],
  [KAEYA_CHARACTER_ID, 1],
  [SHENHE_CHARACTER_ID, 1],
]);

// The Statue's Blessing of two statues, its pool full at 10000 of 10000 with auto-recover on at half, as the completionist
// Guide shows it at 173 seconds
export const props = {
  autoRecover: { isOn: true, thresholdPercent: 50 },
  gameText: ENGLISH_GAME_TEXT,
  getLevel: (characterId: number) => characterLevelMap.get(characterId),
  getMaxHealth: () => 10_000,
  getName: (characterId: number) => characterNameMap.get(characterId) ?? "",
  getNow: () => NOW,
  party,
  power: { amount: 10_000, changedAt: NOW },
  statueCount: 2,
};
