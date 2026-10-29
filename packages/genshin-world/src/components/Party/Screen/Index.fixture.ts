import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { readStatTables } from "#src/services/character/readStatTables";
import { ALHAITHAM_CHARACTER_ID } from "#src/services/kit/characters/alhaithamKit";
import { RAIDEN_CHARACTER_ID } from "#src/services/kit/characters/raidenKit";
import { VENTI_CHARACTER_ID } from "#src/services/kit/characters/ventiKit";
import { XIANGLING_CHARACTER_ID } from "#src/services/kit/characters/xianglingKit";
import { createParty } from "#src/services/party/createParty";
import { ENGLISH_GAME_TEXT } from "genshin-text";

const { characterDataMap } = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
// The deployed team the English PC client's Party Setup shows at rest: Venti, Xiangling, Raiden Shogun and Alhaitham, each
// At level 90 in its sixth phase, with Party 1 the team deployed
const TEAM_CHARACTER_IDS = [VENTI_CHARACTER_ID, XIANGLING_CHARACTER_ID, RAIDEN_CHARACTER_ID, ALHAITHAM_CHARACTER_ID];
const LEVEL_CAP_ASCENSION = 6;
const LEVEL_CAP = 90;

export const props = {
  characterDataMap,
  characters: TEAM_CHARACTER_IDS.map((id) => ({
    ...createCharacter(id, characterDataMap),
    ascension: LEVEL_CAP_ASCENSION,
    level: LEVEL_CAP,
  })),
  gameText: ENGLISH_GAME_TEXT,
  nameText: englishNameText,
  party: createParty(TEAM_CHARACTER_IDS),
  // The Traveler is not on the team the reference shows, so the name the player chose goes unread
  travelerName: "",
};
