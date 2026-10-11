import { InteractionState } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The quit prompt in the English words, over the world it opens above, at rest and with every pill hovered and pressed
export const props = { gameText: ENGLISH_GAME_TEXT };
export const variants = {
  hover: { interactionState: InteractionState.Hover },
  pressed: { interactionState: InteractionState.Pressed },
};
