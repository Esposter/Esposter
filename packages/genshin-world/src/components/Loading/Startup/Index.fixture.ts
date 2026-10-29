import { CharacterPackPreloadStatus } from "#src/models/character/CharacterPackPreloadStatus";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// Three of the seven lit, as the reference shows, with the packs' download under way: its size beside the marks. Loading
// Then completes for the marks' fade out
export const props = {
  gameText: ENGLISH_GAME_TEXT,
  language: GameLanguage.English,
  loadedBytes: 40_000_000,
  pendingBytes: 85_000_000,
  progress: 3 / 7,
  status: CharacterPackPreloadStatus.Downloading,
};
export const motionProps = { progress: 1 };
// The download's other states: every file held, so no size is drawn, and a file that failed its attempts, so the line
// And the retry are
export const variants = {
  failed: { status: CharacterPackPreloadStatus.Failed },
  none: { loadedBytes: 0, pendingBytes: 0, status: CharacterPackPreloadStatus.Ready },
};
