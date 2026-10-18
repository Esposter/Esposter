import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readAbyssFloors } from "#src/services/spiralAbyss/readAbyssFloors";
import { readAbyssPeriods } from "#src/services/spiralAbyss/readAbyssPeriods";
import { takeOne } from "@esposter/shared";
import { ENGLISH_GAME_TEXT } from "genshin-text";

const periods = await readAbyssPeriods(GAME_DATA_LOCAL_BASE_URL);
// The Moon Spire's latest period the mirror holds, read with the floors it runs, over the English words and names
const period = takeOne(periods, periods.length - 1);
const floors = (await readAbyssFloors(GAME_DATA_LOCAL_BASE_URL)).filter(({ id }) => period.floorIds.includes(id));
export const props = { blessing: period.blessing, floors, gameText: ENGLISH_GAME_TEXT, nameText: englishNameText };
