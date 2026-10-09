import { ENGLISH_GAME_TEXT } from "genshin-text";

// The menu with every screen built, so each entry is drawn as the game draws it, the world's own unbuilt ones disabled
// Being a state of their own. The profile card shows a new player's rank and World Level, with the bar at a third
export const props = {
  adventureExpProgress: 1 / 3,
  adventureRank: 1,
  checkIsBuilt: () => true,
  gameText: ENGLISH_GAME_TEXT,
  worldLevel: 0,
};
