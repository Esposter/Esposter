import { LOGIN_MUSIC_RECORDING_DIRECTORY } from "#src/services/login/constants";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// Loading part way, so the startup screen shows its lit marks once the splashes have played
export const isMotionOnly = true;
export const props = {
  gameText: ENGLISH_GAME_TEXT,
  language: GameLanguage.English,
  musicRecordingBaseUrl: LOGIN_MUSIC_RECORDING_DIRECTORY,
  progress: 3 / 7,
};
