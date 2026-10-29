import { InteractionState } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The quit prompt in the English words, at rest and with Confirm hovered and pressed, the choice the game's pointer
// Rests on
export const props = { gameText: ENGLISH_GAME_TEXT };
export const variants = {
  hover: { interactionState: InteractionState.Hover },
  pressed: { interactionState: InteractionState.Pressed },
};
