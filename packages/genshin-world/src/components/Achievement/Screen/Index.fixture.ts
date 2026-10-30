import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AchievementTextLoaderMap } from "#src/services/achievement/AchievementTextLoaderMap";
import { readAchievements } from "#src/services/achievement/readAchievements";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// Marksmanship is the category the clip has open, its three achievements the table's 82001 to 82003 with Master Sniper,
// 82002, the one finished
const MARKSMANSHIP_CATEGORY_ID = 7;
const MASTER_SNIPER_ID = 82_002;
const { achievements, categories } = await readAchievements(GAME_DATA_LOCAL_BASE_URL);

export const props = {
  achievements,
  categories,
  gameText: ENGLISH_GAME_TEXT,
  initialCategoryId: MARKSMANSHIP_CATEGORY_ID,
  progressMap: new Map([[MASTER_SNIPER_ID, { count: 1, finishedAt: Temporal.Instant.from("2024-05-14T00:00:00Z") }]]),
  textMap: await AchievementTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL),
};
