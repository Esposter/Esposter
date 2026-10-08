import { ENGLISH_GAME_TEXT } from "genshin-text";

// The menu with every screen built, so each entry is drawn as the game draws it, the world's own unbuilt ones disabled
// Being a state of their own
export const props = { checkIsBuilt: () => true, gameText: ENGLISH_GAME_TEXT };
