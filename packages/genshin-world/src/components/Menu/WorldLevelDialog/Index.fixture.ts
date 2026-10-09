import { ENGLISH_GAME_TEXT } from "genshin-text";

// The dialog in the English words with the World Level not lowered and no change made, so its button lowers it
export const props = { gameText: ENGLISH_GAME_TEXT, isWorldLevelAdjustable: true, isWorldLevelLowered: false };
// Lowered with its cooldown run, so its button restores it
export const variants = { lowered: { isWorldLevelLowered: true } };
