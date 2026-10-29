import { InteractionState } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The menu with every screen built, so each entry is drawn as the game draws it, the world's own unbuilt ones disabled
// Being a state of their own
// The rank is 20 so no entry's rank gate is closed, as the reference reads every tile open at its account's rank of 2
// The profile card's bar sits at its reference's 0.31
export const props = {
  adventureExpProgress: 0.31,
  adventureRank: 20,
  checkIsBuilt: () => true,
  gameText: ENGLISH_GAME_TEXT,
  isWorldLevelAdjustable: false,
  isWorldLevelLowered: false,
  namecardItemId: 0,
  namecards: [],
  worldLevel: 0,
};
export const variants = {
  disabled: { checkIsBuilt: () => false },
  hover: { interactionState: InteractionState.Hover },
  pressed: { interactionState: InteractionState.Pressed },
};
