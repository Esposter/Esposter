import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// Loading part way, so the startup screen shows its lit marks once the splashes have played
export const isMotionOnly = true;
export const props = { gameText: ENGLISH_GAME_TEXT, language: GameLanguage.English, progress: 3 / 7 };
